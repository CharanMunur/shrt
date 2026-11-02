import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), (req, res, next) => {
  authController.register(req, res, next);
});

router.post("/login", authLimiter, validateBody(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

router.post("/logout", requireAuth, (req, res, next) => {
  authController.logout(req, res, next);
});

router.get("/me", requireAuth, (req, res, next) => {
  authController.getMe(req, res, next);
});

export default router;
