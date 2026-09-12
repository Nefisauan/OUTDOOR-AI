import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { ProfileForm } from "./ProfileForm";
import type { PlayerProfile } from "@outdoor-ai/shared";
const profile: PlayerProfile = {
  id: "p",
  userId: "u",
  dateOfBirth: "1990-05-21",
  heightCm: 180,
  weightKg: 80,
  handicap: 12,
  skillLevel: "INTERMEDIATE",
  handedness: "RIGHT",
  yearsPlaying: 10,
  typicalScore: 90,
  typicalBallFlight: "FADE",
  typicalMissDirection: "RIGHT",
  createdAt: "now",
  updatedAt: "now",
};
it("blocks invalid physical input using shared rules", () => {
  const save = jest.fn();
  const screen = render(<ProfileForm profile={profile} onSave={save} />);
  fireEvent.changeText(screen.getByLabelText("Height (cm)"), "0");
  fireEvent.press(screen.getByText("Save profile"));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText(/Too small/)).toBeTruthy();
});
it("saves edited numeric and enum values and confirms success", async () => {
  const save = jest.fn().mockResolvedValue(undefined);
  const screen = render(<ProfileForm profile={profile} onSave={save} />);
  fireEvent.changeText(screen.getByLabelText("Handicap index"), "-2");
  fireEvent.press(screen.getByLabelText("Handedness: LEFT"));
  fireEvent.press(screen.getByText("Save profile"));
  await waitFor(() => expect(screen.getByText("Profile saved.")).toBeTruthy());
  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({ handicap: -2, handedness: "LEFT" }),
  );
});
it("does not coerce an empty handicap to zero", () => {
  const save = jest.fn();
  const screen = render(<ProfileForm profile={profile} onSave={save} />);
  fireEvent.changeText(screen.getByLabelText("Handicap index"), "");
  fireEvent.press(screen.getByText("Save profile"));
  expect(save).not.toHaveBeenCalled();
});
it("shows save failures and permits retry", async () => {
  const save = jest.fn().mockRejectedValue(new Error("offline"));
  const screen = render(<ProfileForm profile={profile} onSave={save} />);
  fireEvent.press(screen.getByText("Save profile"));
  await waitFor(() =>
    expect(screen.getByText("Unable to save. Please retry.")).toBeTruthy(),
  );
  expect(screen.getByText("Save profile")).toBeTruthy();
});
