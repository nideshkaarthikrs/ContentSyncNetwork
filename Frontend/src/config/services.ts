import Config from "react-native-config";

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

// NOTE: nginx (Backend/nginx/nginx.conf) does not itself route a `/csn` path
// prefix -- it expects requests at its own root. This value is only correct
// behind an outer reverse proxy (e.g. apps.vapko-ti.com) that strips/adds the
// `/csn` prefix in front of nginx. Deploying a release build against this host
// requires that outer proxy to exist and be configured for the prefix; until
// then this is a documentation placeholder, not a working production URL.
const PROD_HOST = "https://apps.vapko-ti.com/csn";

// Release builds default to production; dev builds must set the env var — a
// dev build silently talking to production (the old behavior when .env was
// missing) is exactly the kind of surprise this throw exists to prevent.
// `Config.API_HOST?.trim()` (not `??`) also treats a present-but-empty value
// (e.g. `API_HOST=` with nothing after it in .env) the same as an absent one --
// react-native-config reports that as `""`, which is falsy-but-defined and
// would otherwise slip past a `??` check and silently disable the dev guard.
const rawApiHost = Config.API_HOST?.trim();
const API_HOST = rawApiHost ? rawApiHost : __DEV__ ? "" : PROD_HOST;

export function apiOrigin(): string {
  if (!API_HOST) {
    throw new Error(
      "API_HOST is not set. Copy Frontend/.env.example to Frontend/.env and set it to your dev machine's LAN IP (with the gateway port), then rebuild the app.",
    );
  }
  return API_HOST;
}

export function serviceBaseUrl(service: ServiceName): string {
  return `${apiOrigin()}/${SERVICE_PREFIXES[service]}`;
}

// Services return asset paths (audio, avatars, project files, ...) as bare
// relative paths (e.g. "/uploads/xyz.mp3"), not absolute URLs -- resolve them
// against the owning service's gateway prefix before handing them to a media
// player, <Image>, or Linking.openURL. Guards against double-prefixing: if a
// caller already has an absolute URL (http(s)://...), it's returned unchanged.
export function resolveAssetUrl(service: ServiceName, url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `${serviceBaseUrl(service)}${url}`;
}

// tune-service returns audioUrl as a bare relative path -- kept as a thin
// wrapper so existing callers of this name keep working unchanged.
export function resolveTuneAudioUrl(audioUrl: string): string {
  return resolveAssetUrl("tune", audioUrl);
}
