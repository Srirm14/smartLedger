import { Analytics } from "@vercel/analytics/react";
import { useLocation } from "react-router-dom";

/**
 * Vite + React Router — use `@vercel/analytics/react`, not `@vercel/analytics/next`
 * (the Next entry depends on `next/navigation` and will not run in this app).
 * Passes current path so client-side navigations send pageviews.
 */
export function VercelAnalytics() {
  const { pathname, search } = useLocation();
  const path = `${pathname}${search}`;
  return <Analytics framework="react" path={path} route={pathname} />;
}
