"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@components/auth/auth-context";

export function RoleRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) return;
    const map = {
      patient: "/patient",
      staff: "/staff",
      admin: "/admin",
      dentist: "/dentist",
    } as const;
    const path = map[user.role];
    router.push(path);
  }, [user, router]);
  return null;
}