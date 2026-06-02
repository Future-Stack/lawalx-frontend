"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle, MapPin, Globe, X, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSubmitEnterpriseRequestMutation } from "@/redux/api/enterpriseRequests/enterpriseRequestsApi";
import { toast } from "sonner";

export default function RequestCustomPlanPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitRequest, { isLoading }] = useSubmitEnterpriseRequestMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    industryType: "",
    companySize: "",
    location: "",
    website: "",
    deviceScreenSize: "",
    estimatedDevices: "",
    storageRequirements: "",
    implementationTimeline: "",
    specifyTimeline: "",
    estimatedBudget: 60,
    additionalRequirements: "",
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getPrice = (b: number) => {
    if (b >= 100) return 10000;
    const segment = b / 25;
    const index = Math.floor(segment);
    const stops = [0, 500, 1000, 5000, 10000];
    const remainder = segment - index;
    return Math.round(
      stops[index] + remainder * (stops[index + 1] - stops[index]),
    );
  };
  const displayPrice = getPrice(formData.estimatedBudget);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalTimeline = formData.implementationTimeline;
      if (finalTimeline === "others") {
        finalTimeline = formData.specifyTimeline || "";
      }

      if (
        !formData.name ||
        !formData.email ||
        !formData.phoneNumber ||
        !formData.industryType ||
        !formData.companySize ||
        !formData.location ||
        !formData.deviceScreenSize ||
        !formData.estimatedDevices ||
        !formData.storageRequirements ||
        !finalTimeline ||
        !formData.additionalRequirements
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        industryType: formData.industryType,
        companySize: formData.companySize,
        location: formData.location,
        website: formData.website || "",
        deviceScreenSize: formData.deviceScreenSize,
        estimatedDevices: Number(formData.estimatedDevices),
        storageRequirements: formData.storageRequirements,
        implementationTimeline: finalTimeline,
        estimatedBudget: displayPrice,
        additionalRequirements: formData.additionalRequirements,
      };

      const res = await submitRequest(payload).unwrap();
      if (res?.success) {
        setIsSubmitted(true);
        toast.success(res?.message || "Request submitted successfully");
      } else {
        toast.error(res?.message || "Failed to submit request.");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(
        error?.data?.message || "An error occurred. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-10 px-4 md:px-8">
          <div className="relative flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-[32px] font-semibold text-Heading font-inter leading-normal">
                Request Your Custom Enterprise Plan
              </h1>
              <p className="text-[16px] font-normal text-[#404040] font-inter leading-[24px] mt-2">
                Tell us about your needs and we&apos;ll create a tailored
                solution for your organization
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="group absolute right-0 top-0 p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 transition-all cursor-pointer rounded-full"
              aria-label="Close"
              title="Close"
            >
              <X className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {isSubmitted ? (
          <div className="mx-auto max-w-[540px] px-4 md:px-0 mt-8 mb-20">
            <div className="rounded-[16px] border border-[#D4D4D4] bg-white p-8 md:p-12 flex flex-col items-center text-center shadow-sm">
              <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-[1.5px] border-[#22C55E]/40 bg-[#22C55E]/10 mb-6">
                <Check className="h-8 w-8 text-[#22C55E]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[20px] sm:text-[24px] font-bold text-[#111827] font-inter mb-3">
                Request Submitted Successfully
              </h3>
              <p className="text-[14px] sm:text-[15px] font-normal text-[#4B5563] font-inter mb-8 leading-relaxed max-w-[400px]">
                Your request for enterprise plan has been submitted
                successfully. Our Support team will contact you within 48 hours.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-[50%] flex items-center justify-center rounded-[10px] bg-[#20A4FF] px-4 py-3 text-white font-semibold text-[16px] shadow-customShadow transition hover:bg-[#20A4FF]/90 active:scale-[0.98] cursor-pointer"
                >
                  Go to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/support")}
                  className="w-full sm:w-[50%] flex items-center justify-center rounded-[10px] border border-[#D4D4D4] bg-white px-4 py-3 text-[#111827] font-semibold text-[16px] transition hover:bg-gray-50 active:scale-[0.98] cursor-pointer"
                >
                  View Request
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-8 pb-20 max-w-3xl mx-auto px-4 lg:px-0"
          >
            {/* Company Information Section */}
            <div className="rounded-[16px] border border-[#D4D4D4] bg-[#FAFAFA] p-6 space-y-6">
              <h3 className="text-[24px] font-semibold text-Heading font-inter">
                Company Information
              </h3>

              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Company Name"
                    className="h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter">
                    E-mail <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="jonsmith@gmail.com"
                    type="email"
                    className="h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                  Your Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  placeholder="+21(256)2546325"
                  className="h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter">
                    Industry Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.industryType}
                    onValueChange={(val) =>
                      handleInputChange("industryType", val)
                    }
                  >
                    <SelectTrigger className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] px-3 text-[16px] text-body bg-white">
                      <SelectValue placeholder="Fintech" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fintech">Fintech</SelectItem>
                      <SelectItem value="health">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-full">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter">
                    Company Size <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(val) =>
                      handleInputChange("companySize", val)
                    }
                  >
                    <SelectTrigger className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] px-3 text-[16px] text-body bg-white">
                      <SelectValue placeholder="0 - 50 Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-50">0 - 50 Employee</SelectItem>
                      <SelectItem value="51-200">51 - 200 Employee</SelectItem>
                      <SelectItem value="201-500">
                        201 - 500 Employee
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative w-full">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737373]" />
                    <Input
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Enter your location"
                      className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] pl-10 pr-3 font-inter text-[16px] placeholder:text-[#737373] bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter">
                    Website
                  </Label>
                  <div className="relative w-full">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737373]" />
                    <Input
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://tape.io"
                      className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] pl-10 pr-3 font-inter text-[16px] placeholder:text-[#737373] bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Find a Custom Enterprise Plan Section */}
            <div className="rounded-[16px] border border-[#D4D4D4] bg-[#FAFAFA] p-6 space-y-6">
              <h3 className="text-[24px] font-semibold text-Heading font-inter text-center md:text-left">
                Find a Custom Enterprise Plan
              </h3>

              <div className="space-y-2">
                <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                  Device Screen Size <span className="text-red-500">*</span>{" "}
                  <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
                </Label>
                <Select
                  value={formData.deviceScreenSize}
                  onValueChange={(val) =>
                    handleInputChange("deviceScreenSize", val)
                  }
                >
                  <SelectTrigger className="w-full rounded-[10px] border border-[#D4D4D4] bg-white px-3 py-3 h-auto text-[16px] text-body">
                    <SelectValue placeholder='24"' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                    <SelectItem value="43">43</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 w-full">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                    Estimated Number of Devices{" "}
                    <span className="text-red-500">*</span>{" "}
                    <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
                  </Label>
                  <Input
                    value={formData.estimatedDevices}
                    onChange={(e) =>
                      handleInputChange("estimatedDevices", e.target.value)
                    }
                    placeholder="e.g. 100"
                    type="number"
                    className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                    Storage Requirements <span className="text-red-500">*</span>{" "}
                    <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
                  </Label>
                  <Input
                    value={formData.storageRequirements}
                    onChange={(e) =>
                      handleInputChange("storageRequirements", e.target.value)
                    }
                    placeholder="e.g. 500 GB"
                    type="text"
                    className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                    Implementation Timeline{" "}
                    <span className="text-red-500">*</span>{" "}
                    <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
                  </Label>
                  <Select
                    value={formData.implementationTimeline}
                    onValueChange={(val) =>
                      handleInputChange("implementationTimeline", val)
                    }
                  >
                    <SelectTrigger className="w-full rounded-[10px] border border-borderGray bg-white px-3 py-3 h-auto text-[16px] text-body">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.implementationTimeline === "others" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[16px] font-semibold text-[#404040] font-inter">
                      Specify Timeline <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.specifyTimeline}
                      onChange={(e) =>
                        handleInputChange("specifyTimeline", e.target.value)
                      }
                      placeholder="e.g. 6 Months"
                      className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Budget / Price Range Section */}
              <div className="space-y-4 pt-2">
                <Label
                  htmlFor="budget-range"
                  className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1"
                >
                  Estimated Budget / Price Range{" "}
                  <span className="text-red-500">*</span>{" "}
                  <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
                </Label>
                <div className="px-1 pt-10 pb-2">
                  <div className="relative w-full">
                    <div
                      className="absolute -top-[38px] -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none transition-all duration-75"
                      style={{
                        left: `calc(${formData.estimatedBudget || 0}% + ${
                          10 - (formData.estimatedBudget || 0) * 0.2
                        }px)`,
                      }}
                    >
                      <div className="bg-[#111827] text-white text-[13px] font-bold py-1 px-3 rounded-[6px] shadow-lg whitespace-nowrap">
                        ${displayPrice.toLocaleString()}
                      </div>
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#111827]" />
                    </div>
                    <input
                      id="budget-range"
                      type="range"
                      title="Estimated Budget"
                      aria-label="Estimated Budget"
                      min={0}
                      max={100}
                      step={1}
                      value={formData.estimatedBudget}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedBudget",
                          Number(e.target.value),
                        )
                      }
                      className="w-full h-2 appearance-none cursor-pointer rounded-full outline-none
                    [&::-webkit-slider-runnable-track]:rounded-full
                    [&::-webkit-slider-runnable-track]:h-2
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-bgBlue
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:-mt-[6px]
                    [&::-moz-range-thumb]:h-5
                    [&::-moz-range-thumb]:w-5
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-bgBlue
                    [&::-moz-range-thumb]:shadow-md"
                      style={{
                        background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${
                          ((formData.estimatedBudget || 0) / 100) * 100
                        }%, #E2E8F0 ${
                          ((formData.estimatedBudget || 0) / 100) * 100
                        }%, #E2E8F0 100%)`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="inline-block bg-[#EFF6FF] text-Heading text-[14px] font-semibold px-2 py-1 rounded-md">
                    $0.0
                  </span>
                  <span className="inline-block bg-[#EFF6FF] text-Heading text-[14px] font-semibold px-2 py-1 rounded-md">
                    $500
                  </span>
                  <span className="inline-block bg-[#EFF6FF] text-Heading text-[14px] font-semibold px-2 py-1 rounded-md">
                    $1,000
                  </span>
                  <span className="inline-block bg-[#EFF6FF] text-Heading text-[14px] font-semibold px-2 py-1 rounded-md">
                    $5,000
                  </span>
                  <span className="inline-block bg-[#EFF6FF] text-Heading text-[14px] font-semibold px-2 py-1 rounded-md">
                    $10,000
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="additional-requirements"
                  className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1"
                >
                  Additional Requirements & Comments{" "}
                  <span className="text-red-500">*</span>{" "}
                  <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
                </Label>
                <Textarea
                  value={formData.additionalRequirements}
                  onChange={(e) =>
                    handleInputChange("additionalRequirements", e.target.value)
                  }
                  id="additional-requirements"
                  placeholder="Tell us about any specific requirements, integration needs, or questions you have."
                  className="w-full min-h-[120px] rounded-[10px] border border-[#D4D4D4] p-3 text-[16px] placeholder:text-[#737373] bg-white resize-none"
                />
              </div>
              {/* Get My Quote Button - inside card */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full flex-col items-center justify-center gap-[6px] rounded-[10px] bg-[#111827] px-4 py-3 text-white font-semibold text-[16px] shadow-customShadow transition hover:bg-slate-800 active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Get My Quote"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
