import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "RATE_LIMITED",
    message: "Too many authentication attempts. Please try again later.",
  },
});

export const linkCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 link creations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "RATE_LIMITED",
    message: "Link creation limit exceeded. Please wait a moment.",
  },
});
