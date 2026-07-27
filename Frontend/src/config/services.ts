export type ServiceName =
  | "identity"
  | "profile"
  | "tune"
  | "lyrics"
  | "voice"
  | "video"
  | "project"
  | "chat"
  | "voting"
  | "feed"
  | "rights"
  | "payment"
  | "notification";

// Path prefixes the nginx gateway routes on (Backend/nginx/nginx.conf) --
// every backend service now sits behind one host:port instead of its own port.
const SERVICE_PREFIXES: Record<ServiceName, string> = {
  identity: "identity",
  profile: "profile",
  tune: "tune",
  lyrics: "lyrics",
  voice: "voice",
  video: "video",
  project: "project",
  chat: "chat",
  voting: "voting",
  feed: "feed",
  rights: "rights",
  payment: "payment",
  notification: "notification",
};

const PROD_HOST = "https://apps.vapko-ti.com/csn";

// Release builds default to production; dev builds must set the env var — a
// dev build silently talking to production (the old behavior when .env was
// missing) is exactly the kind of surprise this throw exists to prevent.
const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? (__DEV__ ? "" : PROD_HOST);

export function apiOrigin(): string {
  if (!API_HOST) {
    throw new Error(
      "EXPO_PUBLIC_API_HOST is not set. Copy Frontend/.env.example to Frontend/.env and set it to your dev machine's LAN IP (with the gateway port).",
    );
  }
  return API_HOST;
}

export function serviceBaseUrl(service: ServiceName): string {
  return `${apiOrigin()}/${SERVICE_PREFIXES[service]}`;
}

// tune-service returns audioUrl as a bare relative path (e.g. "/uploads/xyz.mp3"),
// not an absolute URL -- resolve it against the gateway before handing it to a
// media player.
export function resolveTuneAudioUrl(audioUrl: string): string {
  if (/^https?:\/\//i.test(audioUrl)) {
    return audioUrl;
  }
  return `${serviceBaseUrl("tune")}${audioUrl}`;
}
