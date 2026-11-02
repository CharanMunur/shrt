import { Types } from "mongoose";
import { Link } from "../models/Link.js";
import { env } from "../config/env.js";
import { generateQrDataUrl, generateQrSvg } from "../lib/qr.js";

export class QrService {
  async getLinkQr(ownerId: Types.ObjectId, code: string) {
    const link = await Link.findOne({ code: code.toLowerCase(), ownerId });
    if (!link) {
      const err: any = new Error("Link not found.");
      err.status = 404;
      err.code = "LINK_NOT_FOUND";
      throw err;
    }

    const shortUrl = `${env.BASE_URL}/${link.code}`;
    const [dataUrl, svg] = await Promise.all([
      generateQrDataUrl(shortUrl),
      generateQrSvg(shortUrl),
    ]);

    return {
      code: link.code,
      shortUrl,
      destinationUrl: link.destinationUrl,
      dataUrl,
      svg,
    };
  }
}

export const qrService = new QrService();
