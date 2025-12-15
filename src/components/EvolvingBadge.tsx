"use client";

import { usePathname } from "next/navigation";

const ALLOWED_PAGES = [
  "/incident-reporting",
  "/cost-estimation",
  "/tool-catalogue",
  "/server-catalogue",
];

export function EvolvingBadge() {
  const pathname = usePathname();

  const shouldShow = ALLOWED_PAGES.includes(pathname);

  if (!shouldShow) return null;

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gradient-to-r from-violet-100/80 dark:from-violet-900/50 to-violet-200/80 dark:to-violet-800/50 backdrop-blur-sm text-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-violet-200/50 dark:border-violet-700/50 tracking-wide">
        Evolving Experience — Iterations in Progress
      </div>
    </div>
  );
}
