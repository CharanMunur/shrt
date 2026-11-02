import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { RegisterInput, LoginInput, ChangePasswordInput, UpdatePreferencesInput } from "../validators/auth.validator.js";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.register(req.body as RegisterInput);

      // Establish session
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = user._id.toString();
        res.status(201).json({
          message: "Account created successfully.",
          user,
        });
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.login(req.body as LoginInput);

      // Regenerate session identifier on login to prevent session fixation
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = user._id.toString();
        res.status(200).json({
          message: "Signed in successfully.",
          user,
        });
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("shrtn.sid");
        res.status(200).json({
          message: "Signed out successfully.",
        });
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
        return;
      }
      res.status(200).json({
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const result = await authService.changePassword(userId, req.body as ChangePasswordInput);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const body = req.body as UpdatePreferencesInput;
      const updated = await authService.updatePreferences(userId, body.theme);
      res.status(200).json({
        message: "Preferences updated.",
        user: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
