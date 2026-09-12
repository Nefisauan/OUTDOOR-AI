import { z } from "zod";
export const SKILL_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;
export const HANDEDNESS = ["RIGHT", "LEFT"] as const;
export const BALL_FLIGHTS = [
  "DRAW",
  "FADE",
  "STRAIGHT",
  "MIXED",
  "UNKNOWN",
] as const;
export const MISS_DIRECTIONS = [
  "LEFT",
  "RIGHT",
  "SHORT",
  "LONG",
  "VARIABLE",
  "UNKNOWN",
] as const;
export function ageOn(dateOfBirth: string, now = new Date()): number {
  const birth = new Date(dateOfBirth + "T00:00:00.000Z");
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  if (
    now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() &&
      now.getUTCDate() < birth.getUTCDate())
  )
    age--;
  return age;
}
export const dateOfBirthSchema = z
  .string()
  .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, "Use YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(value + "T00:00:00.000Z");
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      ageOn(value) >= 5 &&
      ageOn(value) <= 120
    );
  }, "Enter a real date of birth for an age between 5 and 120");
export const profileFields = z
  .object({
    dateOfBirth: dateOfBirthSchema,
    heightCm: z.number().finite().min(50).max(250),
    weightKg: z.number().finite().min(10).max(350),
    handicap: z.number().finite().min(-10).max(54),
    skillLevel: z.enum(SKILL_LEVELS),
    handedness: z.enum(HANDEDNESS),
    yearsPlaying: z.number().int().min(0).max(120),
    typicalScore: z.number().int().min(18).max(300),
    typicalBallFlight: z.enum(BALL_FLIGHTS),
    typicalMissDirection: z.enum(MISS_DIRECTIONS),
  })
  .strict();
export const createProfileSchema = profileFields.refine(
  (p) => p.yearsPlaying <= ageOn(p.dateOfBirth),
  { path: ["yearsPlaying"], message: "Years playing cannot exceed age" },
);
export const updateProfileSchema = profileFields
  .partial()
  .refine(
    (p) => Object.keys(p).length > 0,
    "Provide at least one profile field",
  );
export const credentialsSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(12).max(128),
  })
  .strict();
export type ProfileInput = z.infer<typeof createProfileSchema>;
export type ProfileUpdate = z.infer<typeof updateProfileSchema>;
export type Credentials = z.infer<typeof credentialsSchema>;
export interface PlayerProfile extends ProfileInput {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
export interface Account {
  id: string;
  email: string;
}
export interface AuthResponse {
  user: Account;
  token: string;
  expiresAt: string;
}
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fields[key] ??= issue.message;
  }
  return fields;
}
export { z };
