import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type {
  AuthResponse,
  PlayerProfile,
  ProfileInput,
} from "@outdoor-ai/shared";
import { AccountScreen } from "./src/AccountScreen";
import { ProfileForm } from "./src/ProfileForm";
import { Button, styles } from "./src/components";
import { api, ApiError } from "./src/api";
export default function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const clear = () => {
    setAuth(null);
    setProfile(null);
    setLoaded(false);
  };
  async function load(session: AuthResponse) {
    setAuth(session);
    setBusy(true);
    setError("");
    setLoaded(false);
    try {
      setProfile(await api.profile(session.token));
      setLoaded(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setProfile(null);
        setLoaded(true);
      } else if (e instanceof ApiError && e.status === 401) {
        clear();
        setError("Your session expired. Sign in again.");
      } else
        setError(e instanceof Error ? e.message : "Could not load profile.");
    } finally {
      setBusy(false);
    }
  }
  async function save(data: ProfileInput) {
    if (!auth) return;
    setBusy(true);
    try {
      setProfile(await api.save(auth.token, data, profile !== null));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        clear();
        setError("Your session expired. Sign in again.");
      }
      throw e;
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (!auth) return;
    setBusy(true);
    try {
      await api.logout(auth.token);
      clear();
      setError("");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        clear();
        setError("");
      } else setError("Could not revoke your session. Retry sign out.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text accessibilityRole="header" style={styles.title}>
          Outdoor AI
        </Text>
        <Text style={styles.subtitle}>Look. Ask. Play.</Text>
        {error !== "" && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        {!auth ? (
          <AccountScreen onAuthenticated={(a) => void load(a)} />
        ) : (
          <View>
            <Text style={styles.note}>{auth.user.email}</Text>
            {busy && <Text style={styles.note}>Loading…</Text>}
            {loaded ? (
              <ProfileForm profile={profile} onSave={save} />
            ) : (
              <Button
                title="Retry loading profile"
                onPress={() => void load(auth)}
                disabled={busy}
              />
            )}
            <Button
              title="Sign out"
              secondary
              onPress={() => void logout()}
              disabled={busy}
            />
          </View>
        )}
        <Text style={styles.note}>Phase 1 · Foundation</Text>
        <Text style={styles.note}>
          Golf features will arrive in later phases.
        </Text>
        <StatusBar style="dark" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
