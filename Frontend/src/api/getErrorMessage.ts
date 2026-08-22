import { isAxiosError } from "axios";

/** Extracts the CSN envelope's `message` from a failed request, falling back to a generic string. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    // 413 usually has no CSN envelope body (nginx/the server rejects the request
    // before it reaches app code that would produce one) -- give a specific,
    // actionable message instead of falling through to the generic fallback.
    if (error.response?.status === 413) {
      return "File is too large. Please choose a smaller file.";
    }
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
