import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { credentialsSchema, type AuthResponse } from "@outdoor-ai/shared";
import { PrismaService } from "../prisma/prisma.service";
import { parse } from "../validation/parse";
import { hashPassword, verifyPassword } from "./password";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
@Injectable()
export class AuthService {
  constructor(private readonly db: PrismaService) {}
  private async session(user: {
    id: string;
    email: string;
  }): Promise<AuthResponse> {
    await this.db.session.deleteMany({
      where: { userId: user.id, expiresAt: { lte: new Date() } },
    });
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.db.session.create({
      data: { userId: user.id, tokenHash: digest(token), expiresAt },
    });
    return { user, token, expiresAt: expiresAt.toISOString() };
  }
  async register(body: unknown): Promise<AuthResponse> {
    const input = parse(credentialsSchema, body);
    const passwordHash = await hashPassword(input.password);
    try {
      const user = await this.db.user.create({
        data: { email: input.email, passwordHash },
        select: { id: true, email: true },
      });
      return await this.session(user);
    } catch (error) {
      if ((error as { code?: string }).code === "P2002")
        throw new ConflictException(
          "An account with that email already exists",
        );
      throw error;
    }
  }
  async login(body: unknown): Promise<AuthResponse> {
    const input = parse(credentialsSchema, body);
    const user = await this.db.user.findUnique({
      where: { email: input.email },
    });
    // Spend equivalent password-hashing work for unknown accounts.
    const stored =
      user?.passwordHash ??
      "00000000000000000000000000000000:" + "00".repeat(64);
    const valid = await verifyPassword(input.password, stored);
    if (!user || !valid)
      throw new UnauthorizedException("Invalid email or password");
    return this.session({ id: user.id, email: user.email });
  }
  async authenticate(
    token: string,
  ): Promise<{ userId: string; tokenHash: string }> {
    if (!/^[a-f0-9]{64}$/.test(token))
      throw new UnauthorizedException("Invalid session");
    const tokenHash = digest(token);
    const session = await this.db.session.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt.getTime() <= Date.now())
      throw new UnauthorizedException("Session expired or invalid");
    return { userId: session.userId, tokenHash };
  }
  async logout(tokenHash: string): Promise<void> {
    await this.db.session.deleteMany({ where: { tokenHash } });
  }
}
