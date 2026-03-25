"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LibraryRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/artifacts");
  }, [router]);
  return null;
}
