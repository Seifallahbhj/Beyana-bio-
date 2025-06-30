"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WishlistRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/account/wishlist");
  }, [router]);
  return null;
}
