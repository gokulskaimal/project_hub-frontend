"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AcceptInviteRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      const encoded = encodeURIComponent(token);
      router.replace(`/invite/accept/${encoded}`);
      return;
    }
    router.replace("/login");
  }, [router, token]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Redirecting...
    </div>
  );
}
