/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { X, Users, Shield, User, CreditCard, Sliders, Building2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { countries, getCountryByCode } from "@/constants/countries";
import Dropdown from "@/components/shared/Dropdown";
import { useAddUserMutation } from "@/redux/api/admin/usermanagementApi";
import { useGetActiveScreenSizesQuery } from "@/redux/api/users/plan/plan.api";

// ── Plan name mapping ─────────────────────────────────────────────────────────
const PLAN_OPTIONS = [
  "Free Trial",
  "Basic",
  "Premium",
  "Business",
  "Enterprise",
];
const PLAN_API_MAP: Record<string, string> = {
  "Free Trial": "FREE_TRIAL",
  Basic: "BASIC",
  Premium: "PREMIUM",
  Business: "BUSINESS",
  Enterprise: "ENTERPRISE",
};

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const [addUser, { isLoading }] = useAddUserMutation();
  const { data: screenSizesRes, isLoading: isLoadingSizes } = useGetActiveScreenSizesQuery();
  const screenSizes = screenSizesRes?.data ?? [];
  const screenSizeOptions = isLoadingSizes
    ? ["Loading..."]
    : screenSizes.map((s) => `${s.size}"`);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    // Personal Info
    organization: "",
    designation: "",
    location: "",
    phoneNumber: "+1",
    countryCode: "US",
    // Subscription
    deviceSize: "",
    billingCycle: "MONTHLY",
    plan: "Basic",
    deviceQuantity: 1,
    // Enterprise only
    deviceLimit: "",
    storageLimit: "",
    price: "",
    description: "",
    // Advance Customization (Enterprise only)
    advanceCustomization: false,
    templateLimit: "",
    photoLimit: "",
    audioLimit: "",
    videoLimit: "",
  });

  // Features state — like EditPlanDialog
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const isEnterprise = formData.plan === "Enterprise";

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const country = getCountryByCode(formData.countryCode);
    if (!country) return;
    let val = e.target.value;
    if (!val.startsWith(country.dialCode)) {
      val = country.dialCode;
    } else {
      const subscriberPart = val.slice(country.dialCode.length).replace(/[^\d]/g, "");
      if (subscriberPart.length <= country.maxLength) {
        val = country.dialCode + subscriberPart;
      } else {
        val = formData.phoneNumber;
      }
    }
    setFormData({ ...formData, phoneNumber: val });
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Full name, email, and password are required");
      return;
    }

    // Parse screen size number from e.g. "24""
    const screenSizeNum = parseInt(formData.deviceSize.replace(/[^\d]/g, ""), 10) || 0;
    if (screenSizeNum <= 0) {
      toast.error("Please select a screen size");
      return;
    }

    const payload: Record<string, any> = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      organization: formData.organization.trim() || undefined,
      designation: formData.designation.trim() || undefined,
      location: formData.location.trim() || undefined,
      phoneCountry: formData.countryCode,
      phoneNumber: formData.phoneNumber,
      planName: PLAN_API_MAP[formData.plan] || "BASIC",
      screenSize: screenSizeNum,
      billingCycle: formData.billingCycle,
      deviceQuantity: Number(formData.deviceQuantity) || 1,
    };

    if (isEnterprise) {
      payload.price = Number(formData.price) || 0;
      payload.storageLimitGb = Number(formData.storageLimit) || 0;
      payload.description = formData.description.trim() || undefined;

      if (formData.advanceCustomization) {
        payload.templateLimit = Number(formData.templateLimit) || 0;
        payload.photoLimit = Number(formData.photoLimit) || 0;
        payload.audioLimit = Number(formData.audioLimit) || 0;
        payload.videoLimit = Number(formData.videoLimit) || 0;
        payload.features = features;
      }
    }

    try {
      await addUser(payload).unwrap();
      toast.success("User created successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-navbarBg rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="p-6 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navbarBg rounded-full flex items-center justify-center border border-border">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Add New User
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Create a new user account with subscription and profile details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-6 overflow-y-auto scrollbar-hide flex-1">

          {/* User Credentials - Green Theme */}
          <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              User Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
                <input
                  type="password"
                  placeholder="Enter secured Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Personal Info - Blue Theme */}
          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Organization</label>
                <input
                  type="text"
                  placeholder="TechCorp Inc."
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
                <input
                  type="text"
                  placeholder="CEO"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="USA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                <div className="grid grid-cols-4 gap-1">
                  <div className="col-span-1">
                    <Dropdown
                      value={formData.countryCode}
                      options={countries.map((c) => c.code)}
                      onChange={(val) => {
                        const country = getCountryByCode(val);
                        if (country) {
                          setFormData({ ...formData, countryCode: val, phoneNumber: country.dialCode });
                        }
                      }}
                      className="w-full h-10"
                    />
                  </div>
                  <input
                    type="text"
                    inputMode="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="col-span-3 px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plan - Orange Theme */}
          <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscription Plan
            </h3>
            <div className="space-y-4">

              {/* Device Size + Device Quantity side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Device Size *
                  </label>
                  {isLoadingSizes ? (
                    <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-gray-400 bg-navbarBg h-10">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                  ) : (
                    <Dropdown
                      value={formData.deviceSize || (screenSizeOptions[0] ?? "")}
                      options={screenSizeOptions}
                      onChange={(val) => setFormData({ ...formData, deviceSize: val })}
                      className="w-full h-10"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Device Quantity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 5"
                    value={formData.deviceQuantity}
                    onChange={(e) => setFormData({ ...formData, deviceQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Billing Cycle
                </label>
                <div className="flex gap-2">
                  {["MONTHLY", "YEARLY"].map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setFormData({ ...formData, billingCycle: cycle })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                        formData.billingCycle === cycle
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-navbarBg text-gray-600 dark:text-gray-400 border-border hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {cycle === "MONTHLY" ? "Monthly" : "Yearly"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choose Plan */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Choose Plan *
                </label>
                <Dropdown
                  value={formData.plan}
                  options={PLAN_OPTIONS}
                  onChange={(val) => setFormData({ ...formData, plan: val })}
                  className="w-full h-10"
                />
              </div>

              {/* Enterprise only fields */}
              {isEnterprise && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Storage Limit (GB)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.storageLimit}
                      placeholder="e.g. 200"
                      onChange={(e) => setFormData({ ...formData, storageLimit: e.target.value })}
                      className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.price}
                      placeholder="e.g. 5000"
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      placeholder="Enterprise Plan"
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advance Customization — Enterprise only */}
          {isEnterprise && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Advance Customization</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.advanceCustomization}
                    onChange={(e) => setFormData({ ...formData, advanceCustomization: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {formData.advanceCustomization && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Template Limit</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.templateLimit}
                        placeholder="e.g. 1"
                        onChange={(e) => setFormData({ ...formData, templateLimit: e.target.value })}
                        className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Photo Limit</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.photoLimit}
                        placeholder="e.g. 5"
                        onChange={(e) => setFormData({ ...formData, photoLimit: e.target.value })}
                        className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Audio Limit</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.audioLimit}
                        placeholder="e.g. 10"
                        onChange={(e) => setFormData({ ...formData, audioLimit: e.target.value })}
                        className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Video Limit</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.videoLimit}
                        placeholder="e.g. 5"
                        onChange={(e) => setFormData({ ...formData, videoLimit: e.target.value })}
                        className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* Features — same pattern as EditPlanDialog */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Features</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a feature..."
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                        className="flex-1 px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1.5 mt-2 max-h-[120px] overflow-y-auto scrollbar-hide">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-border"
                        >
                          <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-2 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {features.length === 0 && (
                        <p className="text-[10px] text-gray-400 text-center py-1">No features added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-customShadow cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {isLoading ? "Creating..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}