// audioPlayerStore.ts imports resolveTuneAudioUrl from ../config/services.ts,
// which imports the react-native-config native module at module load time.
// That module ships an untransformed ESM build under node_modules (excluded
// from babel-jest's transform by default), so it must be mocked here too, not
// just in services.test.ts, or importing audioPlayerStore.ts blows up with a
// "SyntaxError: Unexpected token 'export'" from react-native-config/index.js.
jest.mock("react-native-config", () => ({
  API_HOST: "http://192.168.1.50:8080",
}));

import { classifyPlaybackFailure } from "./audioPlayerStore";

describe("classifyPlaybackFailure", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('resolves "unavailable" when fetch resolves with a 404 status', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 404 } as Response);

    const result = await classifyPlaybackFailure("http://example.com/tune.mp3");

    expect(result).toBe("unavailable");
  });

  it('resolves "error" when fetch resolves with a non-404 status', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 500 } as Response);

    const result = await classifyPlaybackFailure("http://example.com/tune.mp3");

    expect(result).toBe("error");
  });

  it('resolves "error" when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

    const result = await classifyPlaybackFailure("http://example.com/tune.mp3");

    expect(result).toBe("error");
  });

  it("calls fetch as a HEAD request with an abort signal", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ status: 200 } as Response);
    global.fetch = fetchMock;

    await classifyPlaybackFailure("http://example.com/tune.mp3");

    expect(fetchMock).toHaveBeenCalledWith("http://example.com/tune.mp3", {
      method: "HEAD",
      signal: expect.anything(),
    });
  });
});
