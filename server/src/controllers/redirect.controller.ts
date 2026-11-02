import { Request, Response, NextFunction } from "express";
import { redirectService } from "../services/redirect.service.js";
import { isReservedCode } from "../lib/reservedCodes.js";

export class RedirectController {
  async handleRedirect(req: Request<{ code: string }>, res: Response, next: NextFunction): Promise<void> {
    const { code } = req.params;

    if (!code || isReservedCode(code)) {
      next(); // Hand off to SPA or API 404
      return;
    }

    try {
      const result = await redirectService.resolveLink(code, req);

      if (result.status === "redirect" && result.destinationUrl) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        res.redirect(302, result.destinationUrl);
        return;
      }

      if (result.status === "password_required") {
        res.setHeader("Cache-Control", "no-store");
        res.status(200).send(renderPasswordPage(code));
        return;
      }

      // Unavailable state (not found, expired, inactive, limit reached)
      res.setHeader("Cache-Control", "no-store");
      res.status(result.reason === "not_found" ? 404 : 410).send(renderUnavailablePage(code, result.reason));
    } catch (error) {
      next(error);
    }
  }

  async handleUnlock(req: Request<{ code: string }>, res: Response, next: NextFunction): Promise<void> {
    const { code } = req.params;
    const { password } = req.body;

    if (!code || isReservedCode(code)) {
      next();
      return;
    }

    try {
      const result = await redirectService.resolveLink(code, req, password);

      if (result.status === "redirect" && result.destinationUrl) {
        res.setHeader("Cache-Control", "no-store");
        res.redirect(302, result.destinationUrl);
        return;
      }

      res.setHeader("Cache-Control", "no-store");
      res.status(401).send(renderPasswordPage(code, "Incorrect password. Please try again."));
    } catch (error) {
      next(error);
    }
  }
}

function renderPasswordPage(code: string, errorMessage?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Protected Link — Shrtn</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.05em; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 8px; color: #fff; text-decoration: none; }
    .logo-badge { background: #fff; color: #000; border-radius: 6px; padding: 2px 8px; font-size: 14px; font-weight: 800; }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #fafafa; }
    p { font-size: 14px; color: #a1a1aa; margin-bottom: 24px; line-height: 1.5; }
    .code-badge { background: #27272a; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #e4e4e7; }
    .error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 8px; color: #d4d4d8; }
    input { width: 100%; background: #09090b; border: 1px solid #3f3f46; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; margin-bottom: 20px; }
    input:focus { border-color: #3b82f6; ring: 2px solid rgba(59, 130, 246, 0.3); }
    button { width: 100%; background: #fff; color: #09090b; font-weight: 600; border: none; border-radius: 8px; padding: 12px; font-size: 14px; cursor: pointer; transition: background 0.15s; }
    button:hover { background: #e4e4e7; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <span class="logo-badge">s</span> shrtn
    </div>
    <h1>Protected Link</h1>
    <p>The link for <span class="code-badge">/${escapeHtml(code)}</span> is password-protected. Enter the password to proceed.</p>
    ${errorMessage ? `<div class="error">${escapeHtml(errorMessage)}</div>` : ""}
    <form method="POST" action="/${encodeURIComponent(code)}/unlock">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autofocus autocomplete="current-password" placeholder="Enter link password..." />
      <button type="submit">Unlock link &rarr;</button>
    </form>
  </div>
</body>
</html>`;
}

function renderUnavailablePage(code: string, reason?: string): string {
  let title = "Link Unavailable";
  let explanation = "The requested short link is not available or does not exist.";

  if (reason === "expired") {
    title = "Link Expired";
    explanation = "This short link has reached its expiration date and can no longer be accessed.";
  } else if (reason === "inactive") {
    title = "Link Disabled";
    explanation = "This short link has been disabled by its owner.";
  } else if (reason === "limit_reached") {
    title = "Click Limit Reached";
    explanation = "This short link has exceeded its maximum allowed click count.";
  } else if (reason === "not_found") {
    title = "Link Not Found";
    explanation = "No short link was found matching this code.";
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — Shrtn</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 36px 32px; width: 100%; max-width: 420px; text-align: center; }
    .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.05em; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 8px; color: #fff; text-decoration: none; }
    .logo-badge { background: #fff; color: #000; border-radius: 6px; padding: 2px 8px; font-size: 14px; font-weight: 800; }
    .icon { font-size: 32px; margin-bottom: 16px; color: #a1a1aa; }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 12px; color: #fafafa; }
    p { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
    .code-badge { background: #27272a; padding: 3px 8px; border-radius: 4px; font-family: monospace; color: #e4e4e7; font-size: 13px; }
    a.btn { display: inline-block; background: #27272a; color: #f4f4f5; text-decoration: none; font-size: 14px; font-weight: 500; padding: 10px 18px; border-radius: 8px; border: 1px solid #3f3f46; transition: background 0.15s; }
    a.btn:hover { background: #3f3f46; }
  </style>
</head>
<body>
  <div class="card">
    <a href="/" class="logo">
      <span class="logo-badge">s</span> shrtn
    </a>
    <div class="icon">⊘</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(explanation)}</p>
    <div style="margin-bottom: 24px;">
      <span class="code-badge">/${escapeHtml(code)}</span>
    </div>
    <div>
      <a href="/" class="btn">&larr; Return to Shrtn</a>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const redirectController = new RedirectController();
