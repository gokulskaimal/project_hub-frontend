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
    if (typeof data === "string" && data.trim()) {
      serverMsg = data;
    } else if (data && typeof data === "object") {
      const body: ErrorBody = data as ErrorBody;
      serverMsg =
        body.error ||
        body.message ||
        body.detail ||
        (Array.isArray(body.errors) ? body.errors[0]?.message : undefined);
    }
    if (serverMsg && typeof serverMsg === "string") return serverMsg;
    switch (status) {
      case 400:
        return "There was a problem with your request. Please check the details and try again.";
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "We could not find what you were looking for.";
      case 409:
        return "This action conflicts with an existing state. Please refresh and try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};
