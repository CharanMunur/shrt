import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Link } from "../models/Link.js";
import { ClickEvent } from "../models/ClickEvent.js";
import { hashPassword } from "../lib/argon.js";
import { env } from "../config/env.js";

async function seed() {
  console.log("Seeding Shrtn demo data for presentation...");
  const mongoUri = env.MONGODB_URI || "mongodb://127.0.0.1:27017/shrtn";
  await mongoose.connect(mongoUri);

  // 1. Create Demo User
  const normalizedUsername = "demo";
  let user = await User.findOne({ normalizedUsername });
  if (!user) {
    const passwordHash = await hashPassword("password123");
    user = await User.create({
      username: "demo",
      normalizedUsername,
      passwordHash,
      preferences: { theme: "system" },
    });
    console.log("Created demo user: username='demo', password='password123'");
  } else {
    console.log("Demo user exists: username='demo', password='password123'");
  }

  // 2. Clear old demo links
  await Link.deleteMany({ ownerId: user._id });

  // 3. Create Sample Links
  const link1 = await Link.create({
    ownerId: user._id,
    code: "portfolio",
    destinationUrl: "https://github.com/topics/mern-stack",
    isActive: true,
  });

  const link2 = await Link.create({
    ownerId: user._id,
    code: "product-launch",
    destinationUrl: "https://news.ycombinator.com",
    isActive: true,
  });

  const link3 = await Link.create({
    ownerId: user._id,
    code: "confidential-spec",
    destinationUrl: "https://www.google.com",
    isActive: true,
    passwordHash: await hashPassword("secret"),
  });

  console.log("Created 3 demo links: /portfolio, /product-launch, /confidential-spec");

  // 4. Generate Realistic Click Events over past 7 days
  const now = new Date();
  const sampleEvents: any[] = [];

  const referrers = [
    { domain: "twitter.com", category: "social" },
    { domain: "linkedin.com", category: "social" },
    { domain: "google.com", category: "search" },
    { domain: "Direct", category: "direct" },
    { domain: "mail.google.com", category: "email" },
    { domain: "github.com", category: "other" },
  ];

  const devices = [
    { browser: "Chrome", os: "Mac OS", deviceType: "desktop" },
    { browser: "Safari", os: "iOS", deviceType: "mobile" },
    { browser: "Firefox", os: "Windows", deviceType: "desktop" },
    { browser: "Mobile Safari", os: "iOS", deviceType: "mobile" },
    { browser: "Chrome", os: "Android", deviceType: "mobile" },
  ];

  const locations = [
    { country: "India", region: "Karnataka", city: "Bengaluru" },
    { country: "United States", region: "California", city: "San Francisco" },
    { country: "United Kingdom", region: "England", city: "London" },
    { country: "Germany", region: "Berlin", city: "Berlin" },
    { country: "Japan", region: "Tokyo", city: "Tokyo" },
  ];

  const utms = [
    { source: "newsletter", medium: "email", campaign: "weekly_digest" },
    { source: "twitter", medium: "social", campaign: "launch_day" },
    { source: "linkedin", medium: "social", campaign: "hiring" },
  ];

  // Distribute 45 clicks over the past 7 days for /portfolio
  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 6);
    const hoursAgo = Math.floor(Math.random() * 24);
    const clickedAt = new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 3600 * 1000);

    const ref = referrers[i % referrers.length];
    const dev = devices[i % devices.length];
    const loc = locations[i % locations.length];
    const utm = utms[i % utms.length];

    sampleEvents.push({
      linkId: link1._id,
      clickedAt,
      referrer: ref.domain,
      referrerCategory: ref.category,
      utmSource: utm.source,
      utmMedium: utm.medium,
      utmCampaign: utm.campaign,
      country: loc.country,
      region: loc.region,
      city: loc.city,
      browser: dev.browser,
      browserVersion: "120",
      os: dev.os,
      deviceType: dev.deviceType,
    });
  }

  // 18 clicks for /product-launch
  for (let i = 0; i < 18; i++) {
    const daysAgo = Math.floor(Math.random() * 5);
    const hoursAgo = Math.floor(Math.random() * 24);
    const clickedAt = new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 3600 * 1000);

    const ref = referrers[(i + 2) % referrers.length];
    const dev = devices[(i + 1) % devices.length];
    const loc = locations[(i + 3) % locations.length];

    sampleEvents.push({
      linkId: link2._id,
      clickedAt,
      referrer: ref.domain,
      referrerCategory: ref.category,
      country: loc.country,
      region: loc.region,
      city: loc.city,
      browser: dev.browser,
      browserVersion: "122",
      os: dev.os,
      deviceType: dev.deviceType,
    });
  }

  await ClickEvent.deleteMany({ linkId: { $in: [link1._id, link2._id, link3._id] } });
  await ClickEvent.insertMany(sampleEvents);

  console.log(`Successfully seeded ${sampleEvents.length} analytics click events.`);
  await mongoose.disconnect();
  console.log("Done! You can now log into Shrtn with demo / password123 to see live charts.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
