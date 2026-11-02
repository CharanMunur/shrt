import { Router } from "express";
import { redirectController } from "../controllers/redirect.controller.js";

const router = Router();

router.get("/:code", (req, res, next) => {
  redirectController.handleRedirect(req, res, next);
});

router.post("/:code/unlock", (req, res, next) => {
  redirectController.handleUnlock(req, res, next);
});

export default router;
