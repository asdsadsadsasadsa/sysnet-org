"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NavLogoLink() {
  const [href, setHref] = useState("/");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setHref("/feed");
    });
  }, []);

  return (
    <Link href={href} className="text-2xl font-bold tracking-tighter text-brand-navy font-headline">
      SYLEN
    </Link>
  );
}
