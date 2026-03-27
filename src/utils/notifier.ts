import { toast, ToastOptions } from "react-hot-toast";
import { extractErrorMessage } from "./api";

/**
 * Unified notification utility wrapper for react-hot-toast.
 * Centralizes styling and error extraction logic.
 */
export const notifier = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, options);
  },

  error: (err: unknown, fallback: string, options?: ToastOptions) => {
    const message = extractErrorMessage(err, fallback);
    return toast.error(message, options);
  },

  info: (message: string, options?: ToastOptions) => {
    return toast(message, {
      ...options,
      icon: options?.icon || "ℹ️",
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, options);
  },

  dismiss: (id?: string) => {
    return toast.dismiss(id);
  },

  /**
   * Wrapper for toast.promise to standardize messages
   */
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
    options?: ToastOptions,
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: (err) => extractErrorMessage(err, messages.error),
      },
      options,
    );
  },
};
