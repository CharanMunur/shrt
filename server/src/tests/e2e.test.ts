import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../app.js";

describe("Shrtn E2E API & Redirect Integration", () => {
  let memoryServer: MongoMemoryServer;
  let app: any;
  let sessionCookie: string;

  before(async () => {
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    app = createApp();
  });

  after(async () => {
    await mongoose.disconnect();
    await memoryServer.stop();
  });

  test("1. Health endpoint returns 200 and connected status", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
    assert.equal(res.body.database, "connected");
  });

  test("2. User registration and session establishment", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        username: "demo_user",
        password: "secure_password_123",
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.username, "demo_user");
    assert.equal(res.body.user.normalizedUsername, "demo_user");
    assert.equal(res.body.user.passwordHash, undefined); // Never leaked

    const cookieHeader = res.headers["set-cookie"];
    assert.ok(cookieHeader);
    sessionCookie = cookieHeader[0];
  });

  test("3. Duplicate username registration is rejected with 409", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        username: "Demo_User", // case insensitive normalization
        password: "secure_password_123",
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.code, "USERNAME_EXISTS");
  });

  test("4. Current user profile /auth/me returns authenticated user", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", sessionCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.username, "demo_user");
  });

  test("5. Create short link with custom code and destination", async () => {
    const res = await request(app)
      .post("/api/v1/links")
      .set("Cookie", sessionCookie)
      .send({
        destinationUrl: "https://example.com/target-page",
        code: "my-test",
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.link.code, "my-test");
    assert.equal(res.body.link.destinationUrl, "https://example.com/target-page");
  });

  test("6. Reserved code is rejected", async () => {
    const res = await request(app)
      .post("/api/v1/links")
      .set("Cookie", sessionCookie)
      .send({
        destinationUrl: "https://example.com",
        code: "dashboard",
      });

    assert.equal(res.status, 400);
  });

  test("7. Redirect /:code returns direct HTTP 302 with Cache-Control: no-store", async () => {
    const res = await request(app)
      .get("/my-test")
      .set("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)")
      .set("Referer", "https://twitter.com/post/123");

    assert.equal(res.status, 302);
    assert.equal(res.headers["location"], "https://example.com/target-page");
    assert.ok(res.headers["cache-control"].includes("no-store"));
  });

  test("8. Click event is recorded and derived analytics aggregate correctly", async () => {
    // Wait briefly for async click write
    await new Promise((r) => setTimeout(r, 200));

    const res = await request(app)
      .get("/api/v1/links/my-test/analytics?period=7d")
      .set("Cookie", sessionCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.summary.totalClicks, 1);
    assert.equal(res.body.timeSeries.length, 8); // 7 continuous days with zero-activity days padded

    // Verify categories breakdown
    const categories = res.body.breakdowns.categories;
    const social = categories.find((c: any) => c.name === "social");
    assert.ok(social, "Should identify Twitter referrer as social category");

    // Verify devices breakdown
    const devices = res.body.breakdowns.devices;
    const mobile = devices.find((d: any) => d.name === "mobile");
    assert.ok(mobile, "Should detect iPhone as mobile device");
  });

  test("9. CSV Export returns properly formatted lines", async () => {
    const res = await request(app)
      .get("/api/v1/links/my-test/export?format=csv")
      .set("Cookie", sessionCookie);

    assert.equal(res.status, 200);
    assert.ok(res.headers["content-type"].includes("text/csv"));
    assert.ok(res.text.includes("Timestamp"));
    assert.ok(res.text.includes("ShortCode"));
    assert.ok(res.text.includes("my-test"));
  });

  test("10. QR code endpoint generates valid data URL and SVG", async () => {
    const res = await request(app)
      .get("/api/v1/links/my-test/qr")
      .set("Cookie", sessionCookie);

    assert.equal(res.status, 200);
    assert.ok(res.body.dataUrl.startsWith("data:image/png;base64,"));
    assert.ok(res.body.svg.startsWith("<svg"));
  });
});
