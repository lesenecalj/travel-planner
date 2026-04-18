import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth-service";
import { UnauthorizedError } from "../errors";
import { JwtPayload } from "../types/auth";

declare global {
  namespace Express {
    interface Request {
      auth: JwtPayload;
    }
  }
}

const authService = new AuthService();

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing authorization header");
  }
  const token = header.slice(7);
  if (!token) {
    throw new UnauthorizedError("Missing token");
  }
  req.auth = authService.verifyAccessToken(token);
  next();
}
