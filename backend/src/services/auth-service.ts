import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user-repository";
import { AuthTokens, JwtPayload, LoginInput } from "../types/auth";
import { UnauthorizedError } from "../errors";

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
}

export class AuthService {
  private repo: UserRepository;

  constructor(repo: UserRepository = new UserRepository()) {
    this.repo = repo;
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = this.repo.findByEmail(input.email);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid credentials");

    return this.generateTokens({ sub: user.id, email: user.email });
  }

  refreshTokens(refreshToken: string): AuthTokens {
    try {
      const payload = jwt.verify(refreshToken, getSecret()) as JwtPayload;
      return this.generateTokens({ sub: payload.sub, email: payload.email });
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, getSecret()) as JwtPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }

  private generateTokens(payload: JwtPayload): AuthTokens {
    const secret = getSecret();
    return {
      accessToken: jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_TTL }),
      refreshToken: jwt.sign(payload, secret, { expiresIn: REFRESH_TOKEN_TTL }),
    };
  }
}
