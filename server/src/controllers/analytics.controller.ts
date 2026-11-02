import { Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { AnalyticsEventsQuery, AnalyticsQuery, ExportQuery } from "../validators/analytics.validator.js";

export class AnalyticsController {
  async getLinkAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const code = req.params.code as string;
      const data = await analyticsService.getLinkAnalytics(ownerId, code, req.query as unknown as AnalyticsQuery);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getAccountAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const data = await analyticsService.getAccountAnalytics(ownerId, req.query as unknown as AnalyticsQuery);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getEvents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const code = req.params.code as string;
      const data = await analyticsService.getEvents(ownerId, code, req.query as unknown as AnalyticsEventsQuery);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async export(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const code = req.params.code as string;
      const query = req.query as unknown as ExportQuery;
      const result = await analyticsService.exportAnalytics(ownerId, code, query);

      if (req.query.format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="shrtn-${code}-analytics.json"`);
        res.status(200).send(JSON.stringify(result, null, 2));
      } else {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="shrtn-${code}-analytics.csv"`);
        res.status(200).send(result);
      }
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
