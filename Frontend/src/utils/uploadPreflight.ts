/** Which upload flow a file is being checked for -- each has its own server-side size limit. */
export type UploadService = "profile" | "tune" | "voice" | "project" | "video";

// Mirrors the per-service limits enforced server-side; checking client-side lets us
// reject an oversized file before spending the time/data to upload it, with a
// friendlier message than whatever a 413 response would otherwise produce.
const SIZE_LIMIT_MB: Record<UploadService, number> = {
  profile: 5,
  tune: 30,
  voice: 30,
  project: 50,
  video: 200,
};

// Some pickers (notably Android document pickers, for some providers) report
// `application/octet-stream` for audio files whose extension they don't recognize,
// instead of the real audio mime type. Map known audio extensions to their real
// mime type so the backend's mime-based validation doesn't reject a genuinely
// valid file just because of what the picker guessed.
const OCTET_STREAM_EXTENSION_MIME: Record<string, string> = {
  flac: "audio/flac",
  wav: "audio/wav",
};

export interface PreflightFile {
  name: string;
  type: string;
  /** File size in bytes, when the picker reports one (not all pickers do). */
  size?: number | null;
}

export interface PreflightResult<T extends PreflightFile> {
  ok: boolean;
  /** User-facing message when `ok` is false. */
  error?: string;
  /** The file, with `type` corrected if it needed the octet-stream fallback. */
  file: T;
}

function maxBytes(service: UploadService): number {
  return SIZE_LIMIT_MB[service] * 1024 * 1024;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

function normalizeMimeType(name: string, type: string): string {
  if (type !== "application/octet-stream") return type;
  const fallback = OCTET_STREAM_EXTENSION_MIME[extensionOf(name)];
  return fallback ?? type;
}

/**
 * Run before starting an upload: applies the octet-stream mime fallback and rejects
 * files over the per-service size limit. Always returns a `file`, even on failure,
 * with its mime type normalized -- callers that ignore `ok` still get the right type.
 */
export function preflightUpload<T extends PreflightFile>(service: UploadService, file: T): PreflightResult<T> {
  const normalized: T = { ...file, type: normalizeMimeType(file.name, file.type) };

  if (typeof file.size === "number" && file.size > maxBytes(service)) {
    return {
      ok: false,
      error: `File is too large. Maximum size for this upload is ${SIZE_LIMIT_MB[service]}MB.`,
      file: normalized,
    };
  }

  return { ok: true, file: normalized };
}
