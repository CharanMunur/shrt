import { Router } from "express";
import { linkController } from "../controllers/link.controller.js";
import { analyticsController } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import { linkCreateLimiter } from "../middleware/rateLimiter.js";
import { createLinkSchema, updateLinkSchema } from "../validators/link.validator.js";
import {
  analyticsEventsQuerySchema,
  analyticsQuerySchema,
  exportQuerySchema,
} from "../validators/analytics.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res, next) => {
  linkController.list(req, res, next);
});

router.post("/", linkCreateLimiter, validateBody(createLinkSchema), (req, res, next) => {
  linkController.create(req, res, next);
});

router.get("/:code/analytics", validateQuery(analyticsQuerySchema), (req, res, next) => {
  analyticsController.getLinkAnalytics(req, res, next);
});

router.get("/:code/analytics/events", validateQuery(analyticsEventsQuerySchema), (req, res, next) => {
  analyticsController.getEvents(req, res, next);
});

router.get("/:code/analytics/export", validateQuery(exportQuerySchema), (req, res, next) => {
  analyticsController.export(req, res, next);
});

router.get("/:code/export", validateQuery(exportQuerySchema), (req, res, next) => {
  analyticsController.export(req, res, next);
});

router.get("/:code", (req, res, next) => {
  linkController.getOne(req, res, next);
});

router.patch("/:code", validateBody(updateLinkSchema), (req, res, next) => {
  linkController.update(req, res, next);
});

router.delete("/:code", (req, res, next) => {
  linkController.delete(req, res, next);
});

router.post("/:code/qr", (req, res, next) => {
  linkController.getQr(req, res, next);
});

router.get("/:code/qr", (req, res, next) => {
  linkController.getQr(req, res, next);
});

export default router;
