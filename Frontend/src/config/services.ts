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

const API_HOST = "https://apps.vapko-ti.com/csn"; // process.env.EXPO_PUBLIC_API_HOST;

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
