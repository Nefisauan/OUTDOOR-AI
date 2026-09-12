import { useState } from "react";
import { Text, View } from "react-native";
import {
  credentialsSchema,
  fieldErrors,
  type AuthResponse,
} from "@outdoor-ai/shared";
import { api, ApiError } from "./api";
import { Button, Field, styles } from "./components";
export function AccountScreen({
  onAuthenticated,
}: {
  onAuthenticated: (auth: AuthResponse) => void;
}) {
  const [register, setRegister] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function submit() {
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      const result = await (register ? api.register : api.login)(parsed.data);
      setPassword("");
      onAuthenticated(result);
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? { ...error.fields, form: error.message }
          : { form: "Unable to sign in. Please retry." },
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>
        {register ? "Create your account" : "Welcome back"}
      </Text>
      <Text style={styles.note}>Keep your golfer profile in one place.</Text>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        error={errors.email}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete={register ? "new-password" : "current-password"}
        error={errors.password}
      />
      <Text style={styles.note}>
        Use 12–128 characters. Sign-in lasts up to 24 hours and is cleared when
        the app restarts.
      </Text>
      {errors.form && (
        <Text accessibilityRole="alert" style={styles.error}>
          {errors.form}
        </Text>
      )}
      <Button
        title={busy ? "Please wait…" : register ? "Create account" : "Sign in"}
        onPress={() => void submit()}
        disabled={busy}
      />
      <Button
        title={
          register
            ? "Already have an account? Sign in"
            : "New here? Create an account"
        }
        secondary
        onPress={() => {
          setRegister(!register);
          setErrors({});
          setPassword("");
        }}
        disabled={busy}
      />
    </View>
  );
}
