const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  createProfileSchema,
  updateProfileSchema,
  credentialsSchema,
  ageOn,
} = require("../dist");
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
test("valid profile and plus handicap", () => {
  assert.ok(createProfileSchema.safeParse(valid).success);
  assert.ok(createProfileSchema.safeParse({ ...valid, handicap: -2 }).success);
});
for (const [key, value] of [
  ["handicap", 54.1],
  ["handicap", -10.1],
  ["handicap", "12"],
  ["dateOfBirth", "2000-02-30"],
  ["dateOfBirth", "2999-01-01"],
  ["dateOfBirth", "1800-01-01"],
  ["dateOfBirth", "not-a-date"],
  ["heightCm", 0],
  ["heightCm", 251],
  ["weightKg", -1],
  ["weightKg", 351],
  ["yearsPlaying", -1],
  ["yearsPlaying", 1.5],
  ["yearsPlaying", 100],
  ["typicalScore", 17],
  ["typicalScore", 301],
  ["skillLevel", "PRO"],
  ["handedness", "BOTH"],
  ["typicalBallFlight", "HOOK"],
  ["typicalMissDirection", "NEVER"],
  ["userId", "somebody-else"],
])
  test("reject " + key + " " + value, () =>
    assert.equal(
      createProfileSchema.safeParse({ ...valid, [key]: value }).success,
      false,
    ),
  );
test("strict nonempty partial update", () => {
  assert.ok(updateProfileSchema.safeParse({ handicap: 5 }).success);
  assert.equal(updateProfileSchema.safeParse({}).success, false);
  assert.equal(
    updateProfileSchema.safeParse({ userId: "other" }).success,
    false,
  );
});
test("birthdays use calendar age", () => {
  assert.equal(ageOn("2000-09-11", new Date("2026-09-10T12:00:00Z")), 25);
  assert.equal(ageOn("2000-09-11", new Date("2026-09-11T12:00:00Z")), 26);
});
test("credentials normalize email but preserve password", () => {
  const c = credentialsSchema.parse({
    email: " Test@Example.com ",
    password: "a long password",
  });
  assert.equal(c.email, "test@example.com");
  assert.equal(c.password, "a long password");
  assert.equal(
    credentialsSchema.safeParse({ email: "bad", password: "short" }).success,
    false,
  );
});
