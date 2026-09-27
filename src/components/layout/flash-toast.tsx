"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const PARAM = "success";

function FlashToastInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const message = searchParams.get(PARAM);

  useEffect(() => {
    if (!message) return;
    toast.success(message);

    const params = new URLSearchParams(searchParams);
    params.delete(PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // Only re-run when the flash message itself changes — re-including
    // searchParams/router/pathname would refire every time this component
    // strips the param and Next.js hands back a new (but now message-less)
    // searchParams instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return null;
}

export function FlashToast() {
  return (
    <Suspense fallback={null}>
      <FlashToastInner />
    </Suspense>
  );
}
