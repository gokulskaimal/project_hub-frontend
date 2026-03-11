import axios from "axios";

export const getFriendlyError = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    type ErrorBody = {
      error?: string;
      message?: string;
      detail?: string;
      errors?: Array<{ message?: string }>;
    };
    const data = err.response?.data as ErrorBody | string | undefined;
    let serverMsg: string | undefined;

    // 1. Try to extract detailed message from backend response body
    if (typeof data === "string" && data.trim()) {
      serverMsg = data;
    } else if (data && typeof data === "object") {
      const body = data as {
        error?: string | { message?: string };
        message?: string;
        detail?: string;
        errors?: Array<{ message?: string }>;
      };
      serverMsg =
        (typeof body.error === "object" ? body.error?.message : body.error) || // Standardized backend error OR Legacy
        body.message ||
        body.detail ||
        (Array.isArray(body.errors) ? body.errors[0]?.message : undefined);
    }

    if (serverMsg && typeof serverMsg === "string") return serverMsg;

    // 2. Fallback to the message mutated by axios interceptor (api.ts)

    if (
      err.message &&
      !err.message.includes("Request failed with status code") &&
      !err.message.includes("Network Error")
    ) {
      return err.message;
    }

    // 3. Fallback to generic HTTP status message
    switch (status) {
      case 400:
        return "There was a problem with your request. Please check the details and try again.";
      case 401:
        // Distinguish between Login (Credentials) and Session (Token) if possible,
        // but if no message was returned, safer to say "Authentication failed".
        return "Authentication failed. Please check your credentials.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "We could not find what you were looking for.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  // 3. Fallback to general error message
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};
