import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.session?.userId;

  if (!userId) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Please sign in to continue.",
    });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Session expired or user not found.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
