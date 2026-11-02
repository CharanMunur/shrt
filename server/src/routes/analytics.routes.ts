import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validation.js";
import {
  analyticsEventsQuerySchema,
  analyticsQuerySchema,
  exportQuerySchema,
} from "../validators/analytics.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", validateQuery(analyticsQuerySchema), (req, res, next) => {
  analyticsController.getAccountAnalytics(req, res, next);
});

router.get("/:code", validateQuery(analyticsQuerySchema), (req, res, next) => {
  analyticsController.getLinkAnalytics(req, res, next);
});

router.get("/:code/events", validateQuery(analyticsEventsQuerySchema), (req, res, next) => {
  analyticsController.getEvents(req, res, next);
});

router.get("/:code/export", validateQuery(exportQuerySchema), (req, res, next) => {
  analyticsController.export(req, res, next);
});

export default router;
