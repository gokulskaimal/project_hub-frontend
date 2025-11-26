// This utility dynamically loads SweetAlert2 to replace window.confirm()
// Uses standard window.confirm as fallback
type SwalResult = { isConfirmed?: boolean };
type SwalModule = {
  fire: (options: Record<string, unknown>) => Promise<SwalResult>;
};

declare global {
  interface Window {
    Swal?: SwalModule;
  }
}

export async function confirmWithAlert(
  message: string,
  confirmText = "Yes",
  cancelText = "Cancel",
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Dynamic import to avoid SSR issues
  const ensureSwal = (): Promise<SwalModule | null> =>
    new Promise((resolve) => {
      if (window.Swal) return resolve(window.Swal);
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js";
      script.async = true;
      script.onload = () => resolve(window.Swal ?? null);
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });

  try {
    const Swal = await ensureSwal();
    if (!Swal) return window.confirm(message);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: "#d33",
    });
    return !!result?.isConfirmed;
  } catch {
    // Fallback if dynamic loading fails
    return window.confirm(message);
  }
}
