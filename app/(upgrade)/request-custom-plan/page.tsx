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
import { HelpCircle, MapPin, Globe, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RequestCustomPlanPage() {
  const router = useRouter();
  const [budget, setBudget] = useState(60);

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-10 px-4 md:px-8">
          <div className="relative flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-[32px] font-semibold text-[#171717] font-inter leading-normal">
                Request Your Custom Enterprise Plan
              </h1>
              <p className="text-[16px] font-normal text-[#404040] font-inter leading-[24px] mt-2">
                Tell us about your needs and we&apos;ll create a tailored solution for your organization
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

        <div className="space-y-8 pb-20 max-w-3xl mx-auto">
          {/* Company Information Section */}
          <div className="rounded-[16px] border border-[#D4D4D4] bg-[#FAFAFA] p-6 space-y-6">
            <h3 className="text-[24px] font-semibold text-[#171717] font-inter">Company Information</h3>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label className="text-[16px] font-semibold text-[#404040] font-inter">Name</Label>
                <Input placeholder="Jon Smith" className="h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white" />
              </div>
              <div className="space-y-2 w-full">
                <Label className="text-[16px] font-semibold text-[#404040] font-inter">E-mail</Label>
                <Input placeholder="jonsmith@gmail.com" type="email" className="h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                Your Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="+21(256)2546325" className="h-[48px] rounded-[10px] border-[#D4D4D4] px-3 font-inter text-[16px] placeholder:text-[#737373] bg-white" />
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label className="text-[16px] font-semibold text-[#404040] font-inter">Industry Type</Label>
                <Select>
                  <SelectTrigger className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] px-3 text-[16px] text-[#737373] bg-white">
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
                <Label className="text-[16px] font-semibold text-[#404040] font-inter">Company Size</Label>
                <Select>
                  <SelectTrigger className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] px-3 text-[16px] text-[#737373] bg-white">
                    <SelectValue placeholder="0 - 50 Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-50">0 - 50 Employee</SelectItem>
                    <SelectItem value="51-200">51 - 200 Employee</SelectItem>
                    <SelectItem value="201-500">201 - 500 Employee</SelectItem>
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
                  <Input placeholder="Enter your company name" className="w-full h-[48px] rounded-[10px] border-[#D4D4D4] pl-10 pr-3 font-inter text-[16px] placeholder:text-[#737373] bg-white" />
                </div>
              </div>
              <div className="space-y-2 w-full">
                <Label className="text-[16px] font-semibold text-[#404040] font-inter">Website</Label>
                <div className="flex w-full rounded-[10px] border border-[#D4D4D4] overflow-hidden">
                  <div className="flex items-center gap-1 bg-[#F8FAFC] px-3 text-[#737373] shrink-0 border-r border-[#D4D4D4]">
                    <Globe className="h-4 w-4" />
                    <span className="text-[14px] font-inter">https://</span>
                  </div>
                  <Input
                    placeholder="tape.io"
                    className="border-0 rounded-none flex-1 min-w-0 font-inter text-[16px] placeholder:text-[#737373] bg-white focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Find a Custom Enterprise Plan Section */}
          <div className="rounded-[16px] border border-[#D4D4D4] bg-[#FAFAFA] p-6 space-y-6">
            <h3 className="text-[24px] font-semibold text-[#171717] font-inter text-center md:text-left">Find a Custom Enterprise Plan</h3>

            <div className="space-y-2">
              <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                Device Screen Size <span className="text-red-500">*</span> <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
              </Label>
              <Select>
                <SelectTrigger className="w-full rounded-[10px] border border-[#D4D4D4] bg-white px-3 py-3 h-auto text-[16px] text-[#737373]">
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
                  Estimated Number of Devices <span className="text-red-500">*</span> <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
                </Label>
                <Select>
                  <SelectTrigger className="w-full rounded-[10px] border border-[#D4D4D4] bg-white px-3 py-3 h-auto text-[16px] text-[#737373]">
                    <SelectValue placeholder="100" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full">
                <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                  Storage Requirements <span className="text-red-500">*</span> <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
                </Label>
                <Select>
                  <SelectTrigger className="w-full rounded-[10px] border border-[#D4D4D4] bg-white px-3 py-3 h-auto text-[16px] text-[#737373]">
                    <SelectValue placeholder="100 GB" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 GB</SelectItem>
                    <SelectItem value="500">500 GB</SelectItem>
                    <SelectItem value="1000">1 TB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                Implementation Timeline <span className="text-red-500">*</span> <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
              </Label>
              <Select>
                <SelectTrigger className="w-full rounded-[10px] border border-[#D4D4D4] bg-white px-3 py-3 h-auto text-[16px] text-[#737373]">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget / Price Range Section */}
            <div className="space-y-4 pt-2">
              <Label htmlFor="budget-range" className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                Estimated Budget / Price Range <span className="text-red-500">*</span> <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
              </Label>
              <div className="relative px-1">
                <input
                  id="budget-range"
                  type="range"
                  title="Estimated Budget"
                  aria-label="Estimated Budget"
                  min={0}
                  max={5000}
                  step={100}
                  value={budget * 50}
                  onChange={(e) => setBudget(Number(e.target.value) / 50)}
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
                    background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${(budget / 100) * 100}%, #E2E8F0 ${(budget / 100) * 100}%, #E2E8F0 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between">
                <span className="inline-block bg-[#EFF6FF] text-[#171717] text-[14px] font-semibold px-2 py-1 rounded-md">$0.0</span>
                <span className="inline-block bg-[#EFF6FF] text-[#171717] text-[14px] font-semibold px-2 py-1 rounded-md">$500</span>
                <span className="inline-block bg-[#EFF6FF] text-[#171717] text-[14px] font-semibold px-2 py-1 rounded-md">$1000</span>
                <span className="inline-block bg-[#EFF6FF] text-[#171717] text-[14px] font-semibold px-2 py-1 rounded-md">$5000</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-requirements" className="text-[16px] font-semibold text-[#404040] font-inter flex items-center gap-1">
                Additional Requirements & Comments <span className="text-red-500">*</span> <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
              </Label>
              <Textarea
                id="additional-requirements"
                placeholder="Tell us about any specific requirements, integration needs, or questions you have."
                className="w-full min-h-[120px] rounded-[10px] border border-[#D4D4D4] p-3 text-[16px] placeholder:text-[#737373] bg-white resize-none"
              />
            </div>
            {/* Get My Quote Button - inside card */}
            <button
              className="flex w-full flex-col items-center justify-center gap-[6px] rounded-[10px] bg-[#111827] px-4 py-3 text-white font-semibold text-[16px] shadow-customShadow transition hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
            >
              Get My Quote
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
