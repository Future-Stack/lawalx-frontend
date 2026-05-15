import type { UserPlan } from "@/redux/api/users/plan/plan.type";

export function formatPlanName(name: string) {
  if (!name) return name;
  return name.charAt(0) + name.slice(1).toLowerCase();
}

const PLAN_UI: Record<
  string,
  { buttonColor: string; borderColor: string; highlight?: boolean }
> = {
  BASIC: {
    buttonColor:
      "bg-primary text-gray-500 hover:bg-gray-600 shadow-customShadow",
    borderColor: "border-color",
  },
  BUSINESS: {
    buttonColor: "bg-bgBlue text-white hover:opacity-90 shadow-customShadow",
    borderColor: "border-color",
  },
  PREMIUM: {
    buttonColor: "bg-[#7F56D9] text-white hover:opacity-90 shadow-customShadow",
    borderColor: "border-[#7F56D9] border-2",
    highlight: true,
  },
};

const DEFAULT_UI = {
  buttonColor: "bg-bgBlue text-white hover:opacity-90 shadow-customShadow",
  borderColor: "border-color",
};

export function getPlanUi(plan: UserPlan) {
  const key = plan.name.toUpperCase();
  return PLAN_UI[key] ?? DEFAULT_UI;
}
