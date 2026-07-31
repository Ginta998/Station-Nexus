import { useQuery } from "@tanstack/react-query";
import { getEntitlements } from "@/lib/api";

// Returns the current user's purchases + membership status.
// Safe when logged out (returns empty entitlements, no request).
export function useEntitlements() {
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("sx_token");
  const { data, refetch } = useQuery({
    queryKey: ["entitlements"],
    queryFn: getEntitlements,
    enabled: hasToken,
    staleTime: 30_000,
  });
  const owned = new Set(data?.owned || []);
  const membershipActive = !!data?.membership_active;
  return {
    owned,
    membershipActive,
    refetch,
    // has full access to a creation's paid content
    hasAccess: (item) => !item?.is_paid || owned.has(item.id) || membershipActive,
    // is a given chapter index locked for this viewer
    chapterLocked: (item, index) =>
      !!item?.is_paid && !owned.has(item.id) && !membershipActive && index >= (item.free_chapters || 0),
  };
}
