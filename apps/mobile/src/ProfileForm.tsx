import { useState } from "react";
import { Text, View } from "react-native";
import {
  BALL_FLIGHTS,
  HANDEDNESS,
  MISS_DIRECTIONS,
  SKILL_LEVELS,
  createProfileSchema,
  fieldErrors,
  type PlayerProfile,
  type ProfileInput,
} from "@outdoor-ai/shared";
import { Button, Choice, Field, styles } from "./components";
import { ApiError } from "./api";
export function ProfileForm({
  profile,
  onSave,
}: {
  profile: PlayerProfile | null;
  onSave: (data: ProfileInput) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({
    dateOfBirth: profile?.dateOfBirth ?? "",
    heightCm: profile ? String(profile.heightCm) : "",
    weightKg: profile ? String(profile.weightKg) : "",
    handicap: profile ? String(profile.handicap) : "",
    yearsPlaying: profile ? String(profile.yearsPlaying) : "",
    typicalScore: profile ? String(profile.typicalScore) : "",
    skillLevel: profile?.skillLevel ?? "BEGINNER",
    handedness: profile?.handedness ?? "RIGHT",
    typicalBallFlight: profile?.typicalBallFlight ?? "UNKNOWN",
    typicalMissDirection: profile?.typicalMissDirection ?? "UNKNOWN",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (key: string, value: string) => {
    setValues((old) => ({ ...old, [key]: value }));
    setSaved(false);
  };
  async function submit() {
    const data: Record<string, unknown> = { ...values };
    for (const key of [
      "heightCm",
      "weightKg",
      "handicap",
      "yearsPlaying",
      "typicalScore",
    ])
      data[key] = values[key]?.trim() ? Number(values[key]) : NaN;
    const result = createProfileSchema.safeParse(data);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    setBusy(true);
    setErrors({});
    setSaved(false);
    try {
      await onSave(result.data);
      setSaved(true);
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? { ...error.fields, form: error.message }
          : { form: "Unable to save. Please retry." },
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>
        {profile ? "Your player profile" : "Build your player profile"}
      </Text>
      <Text style={styles.note}>
        A few details about your game. You can edit these at any time.
      </Text>
      <Field
        label="Date of birth (YYYY-MM-DD)"
        value={values.dateOfBirth}
        onChangeText={(v) => set("dateOfBirth", v)}
        error={errors.dateOfBirth}
        autoCapitalize="none"
        placeholder="1990-05-21"
      />
      {(
        [
          ["heightCm", "Height (cm)"],
          ["weightKg", "Weight (kg)"],
          ["handicap", "Handicap index"],
          ["yearsPlaying", "Years playing golf"],
          ["typicalScore", "Typical score (18 holes)"],
        ] as const
      ).map(([key, label]) => (
        <Field
          key={key}
          label={label}
          value={values[key]}
          onChangeText={(v) => set(key, v)}
          error={errors[key]}
          keyboardType={
            key === "handicap" ? "numbers-and-punctuation" : "decimal-pad"
          }
        />
      ))}
      <Text style={styles.note}>
        Handicap: -10 to 54. Enter a plus handicap as a negative number (for
        example, +2 becomes -2).
      </Text>
      <Choice
        label="Skill level"
        values={SKILL_LEVELS}
        value={values.skillLevel ?? ""}
        onChange={(v) => set("skillLevel", v)}
        error={errors.skillLevel}
      />
      <Choice
        label="Handedness"
        values={HANDEDNESS}
        value={values.handedness ?? ""}
        onChange={(v) => set("handedness", v)}
        error={errors.handedness}
      />
      <Choice
        label="Typical ball flight"
        values={BALL_FLIGHTS}
        value={values.typicalBallFlight ?? ""}
        onChange={(v) => set("typicalBallFlight", v)}
        error={errors.typicalBallFlight}
      />
      <Choice
        label="Typical miss"
        values={MISS_DIRECTIONS}
        value={values.typicalMissDirection ?? ""}
        onChange={(v) => set("typicalMissDirection", v)}
        error={errors.typicalMissDirection}
      />
      {errors.form && (
        <Text accessibilityRole="alert" style={styles.error}>
          {errors.form}
        </Text>
      )}
      {saved && (
        <Text accessibilityRole="alert" style={styles.success}>
          Profile saved.
        </Text>
      )}
      <Button
        title={busy ? "Saving…" : "Save profile"}
        onPress={() => void submit()}
        disabled={busy}
      />
    </View>
  );
}
