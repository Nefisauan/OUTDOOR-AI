import type {
  AuthResponse,
  Credentials,
  PlayerProfile,
  ProfileInput,
} from "@outdoor-ai/shared";
const configured =
  process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3000/api/v1";
const base = configured.endsWith("/") ? configured.slice(0, -1) : configured;
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
async function request<T>(
  path: string,
  method: string,
  body?: unknown,
  token?: string,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(base + path, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (response.status === 204) return undefined as T;
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(
        response.status,
        typeof data.message === "string" ? data.message : "Request failed",
        data.fields ?? {},
      );
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      "Cannot reach the server. Check your connection and API address.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
export const api = {
  register: (data: Credentials) =>
    request<AuthResponse>("/auth/register", "POST", data),
  login: (data: Credentials) =>
    request<AuthResponse>("/auth/login", "POST", data),
  logout: (token: string) =>
    request<void>("/auth/logout", "POST", undefined, token),
  profile: (token: string) =>
    request<PlayerProfile>("/profile", "GET", undefined, token),
  save: (token: string, data: ProfileInput, exists: boolean) =>
    request<PlayerProfile>("/profile", exists ? "PATCH" : "POST", data, token),
};
