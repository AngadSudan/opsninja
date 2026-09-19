import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { requireConfigValue } from "../utils/config";

declare global {
  namespace Express {
    interface Request {
      user?: { user_id: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.application_token;
    if (!token) {
      res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null,
        error: "No authentication token provided",
      });
      return;
    }

    const secret = requireConfigValue("JWT_SECRET");
    const decoded = jwt.verify(token, secret) as { user_id: string };
    req.user = { user_id: decoded.user_id };
    next();
  } catch {
    res.status(401).json({
      statusCode: 401,
      message: "Unauthorized",
      data: null,
      error: "Invalid or expired token",
    });
  }
};
