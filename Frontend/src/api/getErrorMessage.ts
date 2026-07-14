import { isAxiosError } from "axios";

/** Extracts the CSN envelope's `message` from a failed request, falling back to a generic string. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
