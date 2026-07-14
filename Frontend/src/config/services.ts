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

const SERVICE_PORTS: Record<ServiceName, number> = {
  identity: 3001,
  profile: 3002,
  tune: 3003,
  lyrics: 3004,
  voice: 3005,
  video: 3006,
  project: 3007,
  chat: 3008,
  voting: 3009,
  feed: 3010,
  rights: 3011,
  payment: 3012,
  notification: 3013,
};

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;

export function serviceBaseUrl(service: ServiceName): string {
  if (!API_HOST) {
    throw new Error(
      "EXPO_PUBLIC_API_HOST is not set. Copy Frontend/.env.example to Frontend/.env and set it to your dev machine's LAN IP.",
    );
  }
  return `${API_HOST}:${SERVICE_PORTS[service]}`;
}
