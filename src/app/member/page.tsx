"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemberPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/member/dashboard");
  }, [router]);

  return null;
}
