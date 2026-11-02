import { Request, Response, NextFunction } from "express";
import { linkService } from "../services/link.service.js";
import { qrService } from "../services/qr.service.js";
import { CreateLinkInput, UpdateLinkInput } from "../validators/link.validator.js";

export class LinkController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const link = await linkService.createLink(ownerId, req.body as CreateLinkInput);
      res.status(201).json({
        message: "Link shortened successfully.",
        link,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const status = (req.query.status as any) || "all";

      const data = await linkService.getLinks(ownerId, { page, limit, search, status });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const code = req.params.code as string;
      const link = await linkService.getLinkByCode(ownerId, code);
      res.status(200).json({ link });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const code = req.params.code as string;
      const updated = await linkService.updateLink(ownerId, code, req.body as UpdateLinkInput);
      res.status(200).json({
        message: "Link updated successfully.",
        link: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const code = req.params.code as string;
      const result = await linkService.deleteLink(ownerId, code);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!._id;
      const code = req.params.code as string;
      const qrData = await qrService.getLinkQr(ownerId, code);
      res.status(200).json(qrData);
    } catch (error) {
      next(error);
    }
  }
}

export const linkController = new LinkController();
