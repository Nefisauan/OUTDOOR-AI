import { fireEvent, render, waitFor } from "@testing-library/react-native";
import App from "../App";
import { api, ApiError } from "./api";
jest.mock("./api", () => {
  class ApiError extends Error {
    status: number;
    constructor(code: number, message: string) {
      super(message);
      this.status = code;
    }
  }
  return {
    ApiError,
    api: {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      profile: jest.fn(),
      save: jest.fn(),
    },
  };
});
const mock = api as jest.Mocked<typeof api>;
const auth = {
  token: "test-token",
  expiresAt: "later",
  user: { id: "u", email: "golfer@example.test" },
};
beforeEach(() => jest.clearAllMocks());
it("validates credentials before network access", () => {
  const screen = render(<App />);
  fireEvent.press(screen.getByText("Create account"));
  expect(mock.register).not.toHaveBeenCalled();
  expect(screen.getByText(/Invalid email/)).toBeTruthy();
});
it("registers, creates profile, reloads via sign-in, edits, and signs out", async () => {
  mock.register.mockResolvedValue(auth);
  mock.login.mockResolvedValue(auth);
  mock.profile.mockRejectedValueOnce(new ApiError(404, "missing"));
  mock.logout.mockResolvedValue(undefined);
  const saved = {
    id: "p",
    userId: "u",
    dateOfBirth: "1990-05-21",
    heightCm: 180,
    weightKg: 80,
    handicap: 12,
    skillLevel: "BEGINNER" as const,
    handedness: "RIGHT" as const,
    yearsPlaying: 10,
    typicalScore: 90,
    typicalBallFlight: "UNKNOWN" as const,
    typicalMissDirection: "UNKNOWN" as const,
    createdAt: "now",
    updatedAt: "now",
  };
  mock.save.mockResolvedValue(saved);
  const screen = render(<App />);
  fireEvent.changeText(screen.getByLabelText("Email"), auth.user.email);
  fireEvent.changeText(screen.getByLabelText("Password"), "A long password!");
  fireEvent.press(screen.getByText("Create account"));
  await waitFor(() =>
    expect(screen.getByText("Build your player profile")).toBeTruthy(),
  );
  for (const [label, value] of [
    ["Date of birth (YYYY-MM-DD)", "1990-05-21"],
    ["Height (cm)", "180"],
    ["Weight (kg)", "80"],
    ["Handicap index", "12"],
    ["Years playing golf", "10"],
    ["Typical score (18 holes)", "90"],
  ])
    fireEvent.changeText(screen.getByLabelText(label!), value!);
  fireEvent.press(screen.getByText("Save profile"));
  await waitFor(() => expect(screen.getByText("Profile saved.")).toBeTruthy());
  expect(mock.save).toHaveBeenCalledWith(
    auth.token,
    expect.objectContaining({ heightCm: 180 }),
    false,
  );
  fireEvent.press(screen.getByText("Sign out"));
  await waitFor(() =>
    expect(screen.getByText("Create your account")).toBeTruthy(),
  );
  mock.profile.mockResolvedValue(saved);
  fireEvent.press(screen.getByText("Already have an account? Sign in"));
  fireEvent.changeText(screen.getByLabelText("Email"), auth.user.email);
  fireEvent.changeText(screen.getByLabelText("Password"), "A long password!");
  fireEvent.press(screen.getByText("Sign in"));
  await waitFor(() =>
    expect(screen.getByText("Your player profile")).toBeTruthy(),
  );
  expect(screen.getByLabelText("Height (cm)").props.value).toBe("180");
  fireEvent.changeText(screen.getByLabelText("Handicap index"), "8");
  fireEvent.press(screen.getByText("Save profile"));
  await waitFor(() =>
    expect(mock.save).toHaveBeenLastCalledWith(
      auth.token,
      expect.objectContaining({ handicap: 8 }),
      true,
    ),
  );
});
it("shows a recoverable network error", async () => {
  mock.register.mockRejectedValue(new ApiError(0, "Cannot reach server"));
  const screen = render(<App />);
  fireEvent.changeText(screen.getByLabelText("Email"), auth.user.email);
  fireEvent.changeText(screen.getByLabelText("Password"), "A long password!");
  fireEvent.press(screen.getByText("Create account"));
  await waitFor(() =>
    expect(screen.getByText("Cannot reach server")).toBeTruthy(),
  );
});
