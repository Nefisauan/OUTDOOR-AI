import "reflect-metadata";
import "dotenv/config";
import { randomUUID, createHash } from "node:crypto";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import {
  BALL_FLIGHTS,
  HANDEDNESS,
  MISS_DIRECTIONS,
  SKILL_LEVELS,
} from "@outdoor-ai/shared";
import {
  BallFlight,
  Handedness,
  MissDirection,
  SkillLevel,
} from "../src/generated/prisma/enums";
const valid = {
  dateOfBirth: "1990-05-21",
  heightCm: 180,
  weightKg: 80,
  handicap: 12.5,
  skillLevel: "INTERMEDIATE",
  handedness: "RIGHT",
  yearsPlaying: 10,
  typicalScore: 90,
  typicalBallFlight: "FADE",
  typicalMissDirection: "RIGHT",
};
describe("Phase 2 real database and HTTP contracts", () => {
  let app: INestApplication;
  let db: PrismaService;
  let tokenA: string;
  let tokenB: string;
  let userA: string;
  let userB: string;
  const password = "A long test password!";
  const emails = [
    randomUUID() + "@example.test",
    randomUUID() + "@example.test",
  ];
  const http = () => request(app.getHttpServer());
  const own = () => ({ Authorization: "Bearer " + tokenA });
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useLogger(false);
    app.setGlobalPrefix("api/v1");
    await app.init();
    db = app.get(PrismaService);
    const a = await http()
      .post("/api/v1/auth/register")
      .send({ email: emails[0], password })
      .expect(201);
    tokenA = a.body.token;
    userA = a.body.user.id;
    expect(a.body.user.passwordHash).toBeUndefined();
    const b = await http()
      .post("/api/v1/auth/register")
      .send({ email: emails[1], password })
      .expect(201);
    tokenB = b.body.token;
    userB = b.body.user.id;
  }, 30000);
  afterAll(async () => {
    if (db) await db.user.deleteMany({ where: { email: { in: emails } } });
    if (app) await app.close();
  });
  it("keeps database enum values aligned with shared contracts", () => {
    expect(Object.values(SkillLevel)).toEqual([...SKILL_LEVELS]);
    expect(Object.values(Handedness)).toEqual([...HANDEDNESS]);
    expect(Object.values(BallFlight)).toEqual([...BALL_FLIGHTS]);
    expect(Object.values(MissDirection)).toEqual([...MISS_DIRECTIONS]);
  });
  it("stores hashes rather than passwords or bearer tokens", async () => {
    const user = await db.user.findUniqueOrThrow({ where: { id: userA } });
    expect(user.passwordHash).not.toContain(password);
    const sessions = await db.session.findMany({ where: { userId: userA } });
    expect(sessions[0]?.tokenHash).not.toBe(tokenA);
  });
  it("returns 404 before a profile exists", async () => {
    await http().get("/api/v1/profile").set(own()).expect(404);
    await http()
      .patch("/api/v1/profile")
      .set(own())
      .send({ handicap: 5 })
      .expect(404);
  });
  it("requires authentication for every profile operation", async () => {
    await http().get("/api/v1/profile").expect(401);
    await http().post("/api/v1/profile").send(valid).expect(401);
    await http().patch("/api/v1/profile").send({ handicap: 5 }).expect(401);
    await http()
      .get("/api/v1/profile")
      .set("Authorization", "Bearer invented")
      .expect(401);
  });
  it("creates and retrieves own profile", async () => {
    const created = await http()
      .post("/api/v1/profile")
      .set(own())
      .send(valid)
      .expect(201);
    expect(created.body).toMatchObject({ ...valid, userId: userA });
    const loaded = await http().get("/api/v1/profile").set(own()).expect(200);
    expect(loaded.body).toEqual(created.body);
  });
  it("rejects duplicate profile", async () => {
    await http().post("/api/v1/profile").set(own()).send(valid).expect(409);
  });
  it("updates supplied fields and preserves other fields", async () => {
    const updated = await http()
      .patch("/api/v1/profile")
      .set(own())
      .send({ handicap: -2, handedness: "LEFT" })
      .expect(200);
    expect(updated.body.handicap).toBe(-2);
    expect(updated.body.handedness).toBe("LEFT");
    expect(updated.body.heightCm).toBe(valid.heightCm);
  });
  for (const input of [
    { handicap: 55 },
    { dateOfBirth: "2025-02-30" },
    { dateOfBirth: "2999-01-01" },
    { heightCm: 0 },
    { weightKg: -1 },
    { skillLevel: "INVALID" },
    { handedness: "BOTH" },
    { yearsPlaying: -1 },
    { typicalScore: 500 },
    { yearsPlaying: 100 },
    { userId: "another" },
    {},
  ])
    it("rejects invalid update " + JSON.stringify(input), async () => {
      await http().patch("/api/v1/profile").set(own()).send(input).expect(400);
    });
  it("rejects malformed JSON and unknown account properties", async () => {
    await http()
      .post("/api/v1/profile")
      .set(own())
      .set("Content-Type", "application/json")
      .send("{broken")
      .expect(400);
    await http()
      .post("/api/v1/auth/register")
      .send({ email: "x@example.test", password, role: "admin" })
      .expect(400);
  });
  it("isolates users and disallows ownership injection", async () => {
    const b = { Authorization: "Bearer " + tokenB };
    await http().get("/api/v1/profile").set(b).expect(404);
    await http()
      .post("/api/v1/profile")
      .set(b)
      .send({ ...valid, userId: userA })
      .expect(400);
    const p = await http()
      .post("/api/v1/profile")
      .set(b)
      .send({ ...valid, handicap: 40 })
      .expect(201);
    expect(p.body.userId).toBe(userB);
    await http()
      .patch("/api/v1/profile")
      .set(b)
      .send({ userId: userA, handicap: 0 })
      .expect(400);
    await http()
      .get("/api/v1/profile/" + userA)
      .set(b)
      .expect(404);
    expect((await http().get("/api/v1/profile").set(own())).body.handicap).toBe(
      -2,
    );
  });
  it("enforces one-to-one relation and foreign key", async () => {
    const u = await db.user.findUniqueOrThrow({
      where: { id: userA },
      include: { profile: true },
    });
    expect(u.profile?.userId).toBe(userA);
    await expect(
      db.playerProfile.create({
        data: {
          ...valid,
          skillLevel: "INTERMEDIATE",
          handedness: "RIGHT",
          typicalBallFlight: "FADE",
          typicalMissDirection: "RIGHT",
          dateOfBirth: new Date("1990-05-21"),
          userId: randomUUID(),
        },
      }),
    ).rejects.toMatchObject({ code: "P2003" });
  });
  it("rejects invalid login and duplicate email", async () => {
    await http()
      .post("/api/v1/auth/login")
      .send({ email: emails[0], password: "wrong long password" })
      .expect(401);
    await http()
      .post("/api/v1/auth/register")
      .send({ email: emails[0]?.toUpperCase(), password })
      .expect(409);
  });
  it("logs in, revokes on logout, and rejects expired sessions", async () => {
    const login = await http()
      .post("/api/v1/auth/login")
      .send({ email: emails[0], password })
      .expect(200);
    const header = { Authorization: "Bearer " + login.body.token };
    await http().get("/api/v1/profile").set(header).expect(200);
    await http().post("/api/v1/auth/logout").set(header).expect(204);
    await http().get("/api/v1/profile").set(header).expect(401);
    await db.session.update({
      where: { tokenHash: createHash("sha256").update(tokenB).digest("hex") },
      data: { expiresAt: new Date(0) },
    });
    await http()
      .get("/api/v1/profile")
      .set("Authorization", "Bearer " + tokenB)
      .expect(401);
  });
  it("keeps health working", async () => {
    await http().get("/api/v1/health").expect(200, { status: "ok" });
    await http()
      .get("/api/v1/health/ready")
      .expect(200, { status: "ok", database: "up" });
  });
});
