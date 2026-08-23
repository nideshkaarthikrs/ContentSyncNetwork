jest.mock("react-native-config", () => ({
  API_HOST: "http://192.168.1.50:8080",
}));

import { resolveAssetUrl, resolveTuneAudioUrl } from "./services";

describe("resolveAssetUrl", () => {
  it("passes an https:// URL through unchanged", () => {
    expect(resolveAssetUrl("tune", "https://cdn.example.com/foo.mp3")).toBe(
      "https://cdn.example.com/foo.mp3",
    );
  });

  it("passes an http:// URL through unchanged", () => {
    expect(resolveAssetUrl("tune", "http://cdn.example.com/foo.mp3")).toBe(
      "http://cdn.example.com/foo.mp3",
    );
  });

  it("prefixes a relative URL with the service base URL", () => {
    expect(resolveAssetUrl("tune", "/uploads/abc.mp3")).toBe(
      "http://192.168.1.50:8080/tune/uploads/abc.mp3",
    );
  });

  it("uses the given service's own prefix, not hardcoded to tune", () => {
    expect(resolveAssetUrl("profile", "/uploads/avatar.jpg")).toBe(
      "http://192.168.1.50:8080/profile/uploads/avatar.jpg",
    );
  });
});

describe("resolveTuneAudioUrl", () => {
  it("wraps resolveAssetUrl('tune', ...)", () => {
    expect(resolveTuneAudioUrl("/uploads/xyz.wav")).toBe(
      resolveAssetUrl("tune", "/uploads/xyz.wav"),
    );
  });
});
