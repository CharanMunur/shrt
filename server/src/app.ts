import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

import { env } from "./config/env.js";
import { noCacheMiddleware } from "./middleware/noCache.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import linkRoutes from "./routes/link.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import healthRoutes from "./routes/health.routes.js";
import redirectRoutes from "./routes/redirect.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Security headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // allow inline styles/assets for minimal redirect unlock UI
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Enforce no-cache policy on all responses across the board
  app.use(noCacheMiddleware);

  app.use(cookieParser());
  app.use(express.json({ limit: "64kb" }));
  app.use(express.urlencoded({ extended: true, limit: "64kb" }));

  // Session middleware backed by MongoDB
  const sessionConfig: session.SessionOptions = {
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "shrtn.sid",
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      path: "/",
    },
  };

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    sessionConfig.store = MongoStore.create({
      clientPromise: Promise.resolve(mongoose.connection.getClient() as any),
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: "native",
      touchAfter: 24 * 3600, // lazy update once per 24 hours unless data changes
    });
  }

  app.use(session(sessionConfig));

  // Health and API routes
  app.use("/api/health", healthRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/links", linkRoutes);
  app.use("/api/v1/analytics", analyticsRoutes);

  // Short link redirection handler
  app.use("/", redirectRoutes);

  // API 404 handler
  app.use("/api", (_req, res) => {
    res.status(404).json({
      code: "NOT_FOUND",
      message: "The requested API endpoint was not found.",
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
