import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  createProfileSchema,
  updateProfileSchema,
  profileFields,
  type PlayerProfile,
} from "@outdoor-ai/shared";
import { PrismaService } from "../prisma/prisma.service";
import { parse } from "../validation/parse";
import type { PlayerProfile as DbProfile } from "../generated/prisma/client";
const serialize = (p: DbProfile): PlayerProfile => ({
  ...p,
  dateOfBirth: p.dateOfBirth.toISOString().slice(0, 10),
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
});
@Injectable()
export class ProfileService {
  constructor(private readonly db: PrismaService) {}
  async get(userId: string): Promise<PlayerProfile> {
    const profile = await this.db.playerProfile.findUnique({
      where: { userId },
    });
    if (!profile)
      throw new NotFoundException("Create your player profile first");
    return serialize(profile);
  }
  async create(userId: string, body: unknown): Promise<PlayerProfile> {
    const input = parse(createProfileSchema, body);
    try {
      return serialize(
        await this.db.playerProfile.create({
          data: {
            ...input,
            userId,
            dateOfBirth: new Date(input.dateOfBirth + "T00:00:00.000Z"),
          },
        }),
      );
    } catch (error) {
      if ((error as { code?: string }).code === "P2002")
        throw new ConflictException("Profile already exists");
      throw error;
    }
  }
  async update(userId: string, body: unknown): Promise<PlayerProfile> {
    const changes = parse(updateProfileSchema, body);
    // A serializable transaction prevents concurrent partial updates bypassing cross-field rules.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.db.$transaction(
          async (tx) => {
            const existing = await tx.playerProfile.findUnique({
              where: { userId },
            });
            if (!existing)
              throw new NotFoundException("Create your player profile first");
            const current = serialize(existing);
            const fields = Object.fromEntries(
              Object.keys(profileFields.shape).map((key) => [
                key,
                current[key as keyof PlayerProfile],
              ]),
            );
            const input = parse(createProfileSchema, { ...fields, ...changes });
            return serialize(
              await tx.playerProfile.update({
                where: { userId },
                data: {
                  ...input,
                  dateOfBirth: new Date(input.dateOfBirth + "T00:00:00.000Z"),
                },
              }),
            );
          },
          { isolationLevel: "Serializable" },
        );
      } catch (error) {
        if ((error as { code?: string }).code === "P2034" && attempt < 2)
          continue;
        throw error;
      }
    }
    throw new ConflictException("Profile changed; retry your update");
  }
}
