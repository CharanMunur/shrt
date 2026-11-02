import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import { changePasswordSchema, updatePreferencesSchema } from "../validators/auth.validator.js";

const router = Router();

router.patch("/me/password", requireAuth, validateBody(changePasswordSchema), (req, res, next) => {
  authController.changePassword(req, res, next);
});

router.patch("/me/preferences", requireAuth, validateBody(updatePreferencesSchema), (req, res, next) => {
  authController.updatePreferences(req, res, next);
});

export default router;
