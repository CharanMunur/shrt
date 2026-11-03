import { Types } from "mongoose";
import { ClickEvent } from "../models/ClickEvent.js";
import { Link } from "../models/Link.js";
import { AnalyticsEventsQuery, AnalyticsQuery, ExportQuery } from "../validators/analytics.validator.js";
import { convertToCsv } from "../lib/csv.js";
import { env } from "../config/env.js";

export class AnalyticsService {
  private getDateRange(query: AnalyticsQuery) {
    const now = new Date();
    let to = query.to ? new Date(query.to) : now;
    let from: Date;

    if (query.from) {
      from = new Date(query.from);
    } else {
      switch (query.period) {
        case "30d":
          from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "all":
          from = new Date(0); // Beginning of epoch
          break;
        case "7d":
        default:
          from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    const durationMs = to.getTime() - from.getTime();
    const priorTo = new Date(from.getTime());
    const priorFrom = new Date(from.getTime() - durationMs);

    return { from, to, priorFrom, priorTo, isAllTime: query.period === "all" };
  }

  async getLinkAnalytics(ownerId: Types.ObjectId, code: string, query: AnalyticsQuery) {
    const link = await Link.findOne({ code: code.toLowerCase(), ownerId }).lean();
    if (!link) {
      const err: any = new Error("Link not found.");
      err.status = 404;
      err.code = "LINK_NOT_FOUND";
      throw err;
    }

    return this.aggregateAnalytics([link._id], query, link);
  }

  async getAccountAnalytics(ownerId: Types.ObjectId, query: AnalyticsQuery) {
    const links = await Link.find({ ownerId }).select("_id").lean();
    const linkIds = links.map((l) => l._id);

    return this.aggregateAnalytics(linkIds, query);
  }

  private async aggregateAnalytics(linkIds: Types.ObjectId[], query: AnalyticsQuery, singleLinkDoc?: any) {
    const { from, to, priorFrom, priorTo, isAllTime } = this.getDateRange(query);

    const matchCurrent: any = {
      linkId: { $in: linkIds },
      clickedAt: { $gte: from, $lte: to },
    };

    const matchPrior: any = {
      linkId: { $in: linkIds },
      clickedAt: { $gte: priorFrom, $lt: priorTo },
    };

    const [
      totalPeriodClicks,
      overallClicks,
      priorPeriodClicks,
      dailyClicksRaw,
      peakHourRaw,
      referrerBreakdown,
      categoryBreakdown,
      utmSourceBreakdown,
      utmMediumBreakdown,
      utmCampaignBreakdown,
      countryBreakdown,
      browserBreakdown,
      osBreakdown,
      deviceTypeBreakdown,
      regionBreakdown,
      cityBreakdown,
      heatmapRaw,
      lastClicksRaw,
    ] = await Promise.all([
      ClickEvent.countDocuments(matchCurrent),
      ClickEvent.countDocuments({ linkId: { $in: linkIds } }),
      isAllTime ? Promise.resolve(0) : ClickEvent.countDocuments(matchPrior),
      this.aggregateTimeSeries(matchCurrent, from, to),
      this.aggregatePeakHour(matchCurrent),
      this.aggregateFieldBreakdown(matchCurrent, "$referrer", 50),
      this.aggregateFieldBreakdown(matchCurrent, "$referrerCategory", 50),
      this.aggregateFieldBreakdown(matchCurrent, "$utmSource", 50, true),
      this.aggregateFieldBreakdown(matchCurrent, "$utmMedium", 50, true),
      this.aggregateFieldBreakdown(matchCurrent, "$utmCampaign", 50, true),
      this.aggregateFieldBreakdown(matchCurrent, "$country", 50),
      this.aggregateFieldBreakdown(matchCurrent, "$browser", 50),
      this.aggregateFieldBreakdown(matchCurrent, "$os", 50),
      this.aggregateFieldBreakdown(matchCurrent, "$deviceType", 50),
      this.aggregateFieldBreakdown(matchCurrent, "$region", 50),
      this.aggregateFieldBreakdown(matchCurrent, "$city", 50),
      ClickEvent.aggregate([
        { $match: matchCurrent },
        {
          $group: {
            _id: {
              day: { $dayOfWeek: "$clickedAt" },
              hour: { $hour: "$clickedAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      ClickEvent.find(matchCurrent)
        .sort({ clickedAt: -1 })
        .limit(20)
        .select("clickedAt country region city browser os deviceType referrer referrerCategory userAgent utmSource utmMedium utmCampaign")
        .lean(),
    ]);

    // Construct 7x24 weekly traffic heatmap
    const trafficHeatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const item of heatmapRaw) {
      const d = (item._id.day - 1 + 7) % 7; // 1=Sun (0), 7=Sat (6)
      const h = item._id.hour;
      if (d >= 0 && d < 7 && h >= 0 && h < 24) {
        trafficHeatmap[d][h] = item.count;
      }
    }

    // Convert breakdown arrays to Record<string, number> mappings
    const toRecord = (items: { name: string; count: number }[]) => {
      const rec: Record<string, number> = {};
      for (const item of items) {
        if (item.name && item.name !== "Unknown") {
          rec[item.name] = item.count;
        }
      }
      return rec;
    };

    const clicksByDate: Record<string, number> = {};
    for (const d of dailyClicksRaw) {
      clicksByDate[d.date] = d.clicks;
    }

    const activeDaysCount = dailyClicksRaw.filter((d) => d.clicks > 0).length;
    const avgDailyClicks = activeDaysCount > 0 ? Math.round(totalPeriodClicks / activeDaysCount) : 0;
    const peakTimeStr = peakHourRaw
      ? `${peakHourRaw.hour}:00 - ${(peakHourRaw.hour + 1) % 24}:00 UTC`
      : "No traffic";

    // Calculate percentage change avoiding division by zero
    let changePercentage: number | null = null;
    if (!isAllTime) {
      if (priorPeriodClicks === 0) {
        changePercentage = totalPeriodClicks > 0 ? 100 : 0;
      } else {
        changePercentage = Number((((totalPeriodClicks - priorPeriodClicks) / priorPeriodClicks) * 100).toFixed(1));
      }
    }

    return {
      // Direct fields expected by Analytics Page Guide
      shortCode: singleLinkDoc?.code || "all",
      shortUrl: singleLinkDoc ? `${env.BASE_URL}/${singleLinkDoc.code}` : undefined,
      originalUrl: singleLinkDoc?.destinationUrl,
      totalClicks: totalPeriodClicks,
      clickGrowthPercent: changePercentage ?? 0,
      peakTime: peakTimeStr,
      avgDailyClicks,
      clicksByDate,
      countryBreakdown: toRecord(countryBreakdown),
      regionBreakdown: toRecord(regionBreakdown),
      cityBreakdown: toRecord(cityBreakdown),
      browserBreakdown: toRecord(browserBreakdown),
      osBreakdown: toRecord(osBreakdown),
      deviceBreakdown: toRecord(deviceTypeBreakdown),
      referrerCategories: toRecord(categoryBreakdown),
      referrerBreakdown: toRecord(referrerBreakdown),
      trafficHeatmap,
      lastClicks: lastClicksRaw,

      // Retained fields for full backward-compatibility with other dashboard views
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
        isAllTime,
      },
      summary: {
        totalClicks: totalPeriodClicks,
        overallClicks,
        priorPeriodClicks: isAllTime ? null : priorPeriodClicks,
        changePercentage,
        peakDay: this.calculatePeakDay(dailyClicksRaw),
        peakHour: peakHourRaw,
      },
      timeSeries: dailyClicksRaw,
      breakdowns: {
        referrers: referrerBreakdown,
        categories: categoryBreakdown,
        utmSources: utmSourceBreakdown,
        utmMediums: utmMediumBreakdown,
        utmCampaigns: utmCampaignBreakdown,
        countries: countryBreakdown,
        browsers: browserBreakdown,
        operatingSystems: osBreakdown,
        devices: deviceTypeBreakdown,
      },
      linkMetadata: singleLinkDoc
        ? {
            code: singleLinkDoc.code,
            destinationUrl: singleLinkDoc.destinationUrl,
            isActive: singleLinkDoc.isActive,
            expiresAt: singleLinkDoc.expiresAt,
            maxClicks: singleLinkDoc.maxClicks,
            createdAt: singleLinkDoc.createdAt,
            hasPassword: Boolean(singleLinkDoc.passwordHash),
          }
        : undefined,
    };
  }

  private async aggregateTimeSeries(matchQuery: any, from: Date, to: Date) {
    const rawDaily = await ClickEvent.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const clicksMap = new Map<string, number>();
    for (const item of rawDaily) {
      clicksMap.set(item._id, item.clicks);
    }

    // Populate zero-activity days across the entire range
    const result: { date: string; clicks: number }[] = [];
    const current = new Date(from);
    // Align to start of day
    current.setUTCHours(0, 0, 0, 0);
    const end = new Date(to);

    // Limit maximum points to prevent runaway memory if all-time is vast
    let daysCount = 0;
    while (current <= end && daysCount < 366) {
      const dateStr = current.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        clicks: clicksMap.get(dateStr) || 0,
      });
      current.setUTCDate(current.getUTCDate() + 1);
      daysCount++;
    }

    return result;
  }

  private calculatePeakDay(timeSeries: { date: string; clicks: number }[]) {
    if (timeSeries.length === 0) return null;
    let peak = timeSeries[0];
    for (const day of timeSeries) {
      if (day.clicks > peak.clicks) {
        peak = day;
      }
    }
    return peak.clicks > 0 ? peak : null;
  }

  private async aggregatePeakHour(matchQuery: any) {
    const hourly = await ClickEvent.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $hour: "$clickedAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    if (hourly.length === 0 || hourly[0].count === 0) return null;
    return {
      hour: hourly[0]._id, // 0 - 23 UTC
      clicks: hourly[0].count,
    };
  }

  private async aggregateFieldBreakdown(matchQuery: any, fieldExpr: string, topN: number = 10, skipNulls: boolean = false) {
    const pipeline: any[] = [{ $match: matchQuery }];

    if (skipNulls) {
      const cleanField = fieldExpr.replace(/^\$/, "");
      pipeline.push({ $match: { [cleanField]: { $exists: true, $ne: null, $nin: ["", "Unknown"] } } });
    }

    pipeline.push(
      {
        $group: {
          _id: { $ifNull: [fieldExpr, "Unknown"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } }
    );

    const rows = await ClickEvent.aggregate(pipeline);
    const totalCount = rows.reduce((sum, r) => sum + r.count, 0);

    const top = rows.slice(0, topN);
    const remainder = rows.slice(topN);
    const remainderCount = remainder.reduce((sum, r) => sum + r.count, 0);

    const items = top.map((r) => ({
      name: String(r._id) || "Unknown",
      count: r.count,
      percentage: totalCount > 0 ? Number(((r.count / totalCount) * 100).toFixed(1)) : 0,
    }));

    if (remainderCount > 0) {
      items.push({
        name: "Other",
        count: remainderCount,
        percentage: totalCount > 0 ? Number(((remainderCount / totalCount) * 100).toFixed(1)) : 0,
      });
    }

    return items;
  }

  async getEvents(ownerId: Types.ObjectId, code: string, query: AnalyticsEventsQuery) {
    const link = await Link.findOne({ code: code.toLowerCase(), ownerId }).lean();
    if (!link) {
      const err: any = new Error("Link not found.");
      err.status = 404;
      err.code = "LINK_NOT_FOUND";
      throw err;
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = { linkId: link._id };
    if (query.from || query.to) {
      filter.clickedAt = {};
      if (query.from) filter.clickedAt.$gte = new Date(query.from);
      if (query.to) filter.clickedAt.$lte = new Date(query.to);
    }
    if (query.referrerCategory) filter.referrerCategory = query.referrerCategory;
    if (query.country) filter.country = query.country;
    if (query.deviceType) filter.deviceType = query.deviceType;

    const [events, total] = await Promise.all([
      ClickEvent.find(filter)
        .sort({ clickedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean(),
      ClickEvent.countDocuments(filter),
    ]);

    return {
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async exportAnalytics(ownerId: Types.ObjectId, code: string, query: ExportQuery) {
    const link = await Link.findOne({ code: code.toLowerCase(), ownerId }).lean();
    if (!link) {
      const err: any = new Error("Link not found.");
      err.status = 404;
      err.code = "LINK_NOT_FOUND";
      throw err;
    }

    const { from, to } = this.getDateRange({ period: query.period, from: query.from, to: query.to, timezone: "UTC" });

    const filter: any = {
      linkId: link._id,
      clickedAt: { $gte: from, $lte: to },
    };

    const events = await ClickEvent.find(filter).sort({ clickedAt: -1 }).lean();

    if (query.format === "json") {
      return {
        link: {
          code: link.code,
          destinationUrl: link.destinationUrl,
        },
        range: { from: from.toISOString(), to: to.toISOString() },
        totalEvents: events.length,
        events,
      };
    }

    // CSV format with clear documented column names
    const exportRows = events.map((ev) => ({
      Timestamp: ev.clickedAt.toISOString(),
      ShortCode: link.code,
      DestinationUrl: link.destinationUrl,
      Referrer: ev.referrer,
      ReferrerCategory: ev.referrerCategory,
      UTM_Source: ev.utmSource || "",
      UTM_Medium: ev.utmMedium || "",
      UTM_Campaign: ev.utmCampaign || "",
      Country: ev.country,
      Region: ev.region,
      City: ev.city,
      Browser: ev.browser,
      BrowserVersion: ev.browserVersion,
      OperatingSystem: ev.os,
      DeviceType: ev.deviceType,
    }));

    return convertToCsv(exportRows);
  }
}

export const analyticsService = new AnalyticsService();
