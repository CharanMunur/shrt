import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Never leak credentials or sensitive tokens in logs
  console.error("Internal Server Error:", err.message || err);

  if (err.type === "entity.too.large") {
    res.status(413).json({
      code: "PAYLOAD_TOO_LARGE",
      message: "Request payload too large.",
    });
    return;
  }

  res.status(err.status || 500).json({
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "An unexpected error occurred.",
  });
}
