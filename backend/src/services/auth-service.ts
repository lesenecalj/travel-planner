import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user-repository";
import { AuthTokens, JwtPayload, LoginInput } from "../types/auth";
import { UnauthorizedError } from "../errors";
import { UserRecord } from "../types/user";
import { BCRYPT_ROUNDS } from "../lib/constants";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";
const JWT_ALGORITHM = "HS256" as const;

// Pre-computed once at startup. Used to keep bcrypt running its full work factor
// when the user doesn't exist, preventing timing-based email enumeration.
const DUMMY_HASH = bcrypt.hashSync("timing_guard", BCRYPT_ROUNDS);

function getSecrets(): { access: string; refresh: string } {
  const access = process.env.JWT_ACCESS_SECRET;
  const refresh = process.env.JWT_REFRESH_SECRET;
  if (!access) throw new Error("JWT_ACCESS_SECRET environment variable is not set");
  if (!refresh) throw new Error("JWT_REFRESH_SECRET environment variable is not set");
  return { access, refresh };
}

export class AuthService {
  private repo: UserRepository;

  constructor(repo: UserRepository = new UserRepository()) {
    this.repo = repo;
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = this.repo.findByEmail(input.email);

    // Always run bcrypt to prevent timing-based user enumeration
    const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedError("Invalid credentials");

    return this.generateTokens({ sub: user.id, email: user.email });
  }

  refreshTokens(refreshToken: string): AuthTokens {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, getSecrets().refresh, { algorithms: [JWT_ALGORITHM] }) as JwtPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
    const user: UserRecord | null = this.repo.findById(payload.sub);
    if (!user) throw new UnauthorizedError("Invalid or expired refresh token");
    return this.generateTokens({ sub: user.id, email: user.email });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, getSecrets().access, { algorithms: [JWT_ALGORITHM] }) as JwtPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }

  generateTokens(payload: JwtPayload): AuthTokens {
    const { access, refresh } = getSecrets();
    return {
      accessToken: jwt.sign(payload, access, { expiresIn: ACCESS_TOKEN_TTL, algorithm: JWT_ALGORITHM }),
      refreshToken: jwt.sign(payload, refresh, { expiresIn: REFRESH_TOKEN_TTL, algorithm: JWT_ALGORITHM }),
    };
  }
}
