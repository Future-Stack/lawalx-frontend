/** Display order: Free Trial → Basic → Premium → Business → Enterprise */
const PLAN_SORT_INDEX: Record<string, number> = {
  freetrial: 1,
  basic: 2,
  premium: 3,
  business: 4,
  enterprise: 5,
};

/** Normalize plan name / enum for comparison (FREE_TRIAL, free trial, etc.) */
export function normalizePlanKey(name: string | null | undefined): string {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

/** Sort index for tier ordering; unknown plans sort last. */
export function getPlanSortIndex(name: string | null | undefined): number {
  const key = normalizePlanKey(name);
  if (!key) return 99;
  if (key in PLAN_SORT_INDEX) return PLAN_SORT_INDEX[key];
  if (key.includes("freetrial") || key === "trial") return PLAN_SORT_INDEX.freetrial;
  if (key.includes("demo")) return 0;
  return 99;
}

export function sortPlansByTier<T extends { name?: string | null }>(
  plans: T[],
): T[] {
  return [...plans].sort(
    (a, b) => getPlanSortIndex(a.name) - getPlanSortIndex(b.name),
  );
}

export function sortByPlanNameField<T extends { planName?: string | null }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => getPlanSortIndex(a.planName) - getPlanSortIndex(b.planName),
  );
}

export function sortByPlanField<T extends { plan?: string | null }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => getPlanSortIndex(a.plan) - getPlanSortIndex(b.plan),
  );
}
