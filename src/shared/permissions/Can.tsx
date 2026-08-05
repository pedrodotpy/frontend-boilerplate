import type { ReactNode } from "react";

import { useHasPermission } from "@/shared/auth/useMe";

interface CanProps {
  perm: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ perm, children, fallback = null }: CanProps) {
  const allowed = useHasPermission(perm);
  return allowed ? children : fallback;
}
