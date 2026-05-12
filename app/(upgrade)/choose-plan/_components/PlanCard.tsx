import {
  Monitor,
  Database,
  Video,
  LayoutTemplate,
  Loader2,
  Image as ImageIcon,
  Music,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Plan {
  title: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  buttonColor: string;
  borderColor: string;
  cardStyle: string;
  highlight?: boolean;
  devices: number;
  storage: string;
  templates: number;
  photoLimit: number;
  audioLimit: number;
  videoLimit: number;
  features: string[];
}

interface PlanCardProps {
  plan: Plan;
  isAnnual: boolean;
  onChoose: (plan: Plan) => void;
  isLoading: boolean;
  isSelected: boolean;
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

export default function PlanCard({
  plan,
  isAnnual,
  onChoose,
  isLoading,
  isSelected,
  selectedSize,
  onSizeChange,
}: PlanCardProps) {
  const value = isAnnual
    ? plan.yearlyPrice.toLocaleString("en-NG")
    : plan.monthlyPrice.toLocaleString("en-NG");
  const label = isAnnual ? "/year" : "/month";

  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden rounded-[24px] border bg-navbarBg transition-all duration-300 ${plan.borderColor} ${isSelected ? "ring-2 ring-primary-action" : ""}`}
    >
      {/* Header Section */}
      <div className="p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <h2 className="font-inter text-[20px] font-bold leading-normal text-headings">
              {plan.title}
            </h2>
            {plan.highlight && (
              <div className="rounded-full bg-[#7F56D9] px-3 py-1 text-[11px] font-semibold text-white">
                Most Popular
              </div>
            )}
          </div>
          <p className="font-inter text-[14px] font-normal leading-[20px] text-muted max-w-[240px]">
            {plan.description}
          </p>
        </div>
      </div>

      <div className="border-t border-color" />

      {/* Pricing & Selection Section */}
      <div className="p-6 space-y-6">
        <Select value={selectedSize} onValueChange={onSizeChange}>
          <SelectTrigger className="flex w-full items-center justify-between rounded-[12px] border border-color bg-navbarBg px-5 py-[14px] h-auto text-sm font-medium text-body transition hover:bg-hover focus:ring-0 outline-none">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent className="bg-navbarBg border-color">
            <SelectItem value="30 inches" className="hover:bg-hover cursor-pointer text-body">30 inches</SelectItem>
            <SelectItem value="40 inches" className="hover:bg-hover cursor-pointer text-body">40 inches</SelectItem>
            <SelectItem value="others" className="hover:bg-hover cursor-pointer text-body">others</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex w-full items-baseline justify-center gap-1 rounded-[8px] bg-cardBackground2 px-4 py-5">
          <span className="font-inter text-[32px] font-bold leading-normal text-headings">
            ₦{value}
          </span>
          <span className="font-inter text-[16px] font-normal leading-[24px] text-muted">
            {label}
          </span>
        </div>
      </div>

      {/* Main Stats Section */}
      <div className="px-6 pb-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Monitor className="h-6 w-6 text-body" />
            <div>
              <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                Devices
              </p>
              <p className="font-inter text-[14px] font-bold leading-[20px] text-headings">
                {plan.devices}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-body" />
            <div>
              <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                Storage
              </p>
              <p className="font-inter text-[14px] font-bold leading-[20px] text-headings">
                {plan.storage}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-color pt-4">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="h-6 w-6 text-body" />
            <div>
              <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                Templates
              </p>
              <p className="font-inter text-[14px] font-bold leading-[20px] text-headings">
                {plan.templates}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-color mx-6" />

      {/* Upload Limits Section */}
      <div className="p-6 pt-5">
        <p className="font-inter text-[12px] font-bold tracking-wider text-muted mb-4 uppercase">
          UPLOAD LIMITS
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-headings" />
            <span className="text-[13px] font-medium text-headings">
              {plan.photoLimit} Photo
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Music className="h-4 w-4 text-headings" />
            <span className="text-[13px] font-medium text-headings">
              {plan.audioLimit} Audio
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4 text-headings" />
            <span className="text-[13px] font-medium text-headings">
              {plan.videoLimit} Video
            </span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="p-6 pt-0">
        <p className="font-inter text-[12px] font-bold tracking-wider text-gray mb-4 uppercase">
          Features
        </p>
        <div className="rounded-[14px] bg-cardBackground2 p-4 space-y-3 border border-color">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-bgGreen" />
              <span className="text-[14px] font-medium text-body">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto p-6">
        <button
          type="button"
          onClick={() => onChoose(plan)}
          disabled={isLoading}
          className={`flex w-full cursor-pointer items-center justify-center rounded-[12px] px-4 py-4 text-[16px] font-bold transition-all active:scale-[0.98] ${plan.buttonColor}`}
        >
          {isLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Processing...
            </span>
          ) : (
            "Get Started"
          )}
        </button>
      </div>
    </div>
  );
}
