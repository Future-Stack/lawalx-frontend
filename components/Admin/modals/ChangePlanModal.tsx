"use client";

import { X, Shuffle, CreditCard, Info, Sliders, Building2, Upload, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Dropdown from "@/components/shared/Dropdown";

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: string;
  device: string;
  storage: string;
  status: string;
  organization?: string;
  designation?: string;
  location?: string;
  phone?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  userData: UserData | null;
}

export default function ChangePlanModal({ isOpen, onClose, onConfirm, userData }: Props) {
  const [formData, setFormData] = useState({
    // Subscription
    deviceSize: "24\"",
    plan: "Basic",
    deviceLimit: "50",
    storageLimit: "100",
    price: "$99",
    // Advance Customization
    advanceCustomization: false,
    imageLimit: "1000",
    maxImageSize: "20MB",
    imageFormat: "JPG, PNG, WEBP",
    videoLimit: "1000",
    maxVideoSize: "200MB",
    videoFormat: "MP4, MKV",
    audioLimit: "1000",
    maxAudioSize: "50MB",
    audioFormat: "MP3",
    // Branding & Company
    enableCustomBranding: false,
    companyName: "",
    industryType: "Select industry",
    website: "",
    companyLocation: "",
    companyLogo: null as File | null,
    companyLogoPreview: "" as string,
  });

  const [industries, setIndustries] = useState(["Technology", "Healthcare", "Finance", "Education", "Manufacturing", "Retail"]);
  const [industrySearchTerm, setIndustrySearchTerm] = useState("");
  const [showAddIndustryModal, setShowAddIndustryModal] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState("");

  const filteredIndustries = industries.filter(industry =>
    industry.toLowerCase().includes(industrySearchTerm.toLowerCase())
  );

  const handleIndustrySearchChange = (val: string) => {
    setIndustrySearchTerm(val);
    const exactMatch = industries.find(i => i.toLowerCase() === val.toLowerCase());
    if (exactMatch) {
      setFormData({ ...formData, industryType: exactMatch });
    }
  };

  const handleAddIndustry = () => {
    if (newIndustryName.trim() && !industries.includes(newIndustryName.trim())) {
      setIndustries([...industries, newIndustryName.trim()]);
      setFormData({ ...formData, industryType: newIndustryName.trim() });
      setNewIndustryName("");
      setShowAddIndustryModal(false);
    }
  };

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        deviceSize: "24\"",
        plan: userData.plan || "Basic",
        deviceLimit: userData.device?.split("/")?.[1] || (userData.plan === "Enterprise" ? "100" : "50"),
        storageLimit: userData.storage?.replace(" GB", "") || (userData.plan === "Enterprise" ? "200" : "100"),
        price: userData.plan === "Enterprise" ? "$5000" : "$99",
        advanceCustomization: userData.plan === "Enterprise",
        imageLimit: "1000",
        maxImageSize: "20MB",
        imageFormat: "JPG, PNG, WEBP",
        videoLimit: "1000",
        maxVideoSize: "200MB",
        videoFormat: "MP4, MKV",
        audioLimit: "1000",
        maxAudioSize: "50MB",
        audioFormat: "MP3",
        enableCustomBranding: userData.plan === "Enterprise",
        companyName: userData.organization || "",
        industryType: "Select industry",
        website: "https://example.com",
        companyLocation: userData.location || "City, Country",
        companyLogo: null,
        companyLogoPreview: "",
      });
    }
  }, [isOpen, userData]);

  const handleConfirm = () => {
    onConfirm(formData);
    onClose();
  };

  if (!isOpen || !userData) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-navbarBg rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="p-6 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Shuffle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Change Subscription Plan
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Update user subscription, usage limits and customization
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
          {/* Subscription Plan - Orange Theme */}
          <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscription Plan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Device Size
                </label>
                <Dropdown
                  value={formData.deviceSize}
                  options={["24\"", "32\"", "43\"", "55\""]}
                  onChange={(val) => setFormData({ ...formData, deviceSize: val })}
                  className="w-full h-10"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Choose Plan * <Info className="w-3 h-3 text-gray-400 cursor-help" />
                </label>
                <Dropdown
                  value={formData.plan}
                  options={["Demo (For developers)", "Basic", "Pro", "Enterprise"]}
                  onChange={(val) => setFormData({ ...formData, plan: val })}
                  className="w-full h-10"
                />
              </div>

              {formData.plan === "Enterprise" && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Device Limit
                    </label>
                    <input
                      type="text"
                      value={formData.deviceLimit}
                      onChange={(e) => setFormData({ ...formData, deviceLimit: e.target.value })}
                      className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Storage Limit (GB)
                    </label>
                    <input
                      type="text"
                      value={formData.storageLimit}
                      onChange={(e) => setFormData({ ...formData, storageLimit: e.target.value })}
                      className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Price
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advance Customization */}
          {formData.plan === "Enterprise" && (
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
                  {/* Limits Grid */}
                  {[
                    { label: "Image", limit: formData.imageLimit, size: formData.maxImageSize, format: formData.imageFormat, setterKey: "image" },
                    { label: "Video", limit: formData.videoLimit, size: formData.maxVideoSize, format: formData.videoFormat, setterKey: "video" },
                    { label: "Audio", limit: formData.audioLimit, size: formData.maxAudioSize, format: formData.audioFormat, setterKey: "audio" },
                  ].map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">{item.label} Limit</label>
                        <input
                          type="text"
                          value={item.limit}
                          onChange={(e) => setFormData({ ...formData, [`${item.setterKey}Limit` as any]: e.target.value })}
                          className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Max {item.label} Size</label>
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) => setFormData({ ...formData, [`max${item.label}Size` as any]: e.target.value })}
                          className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Format</label>
                        <div className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-500 dark:text-gray-400">
                          {item.format}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Custom Branding Checkbox */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableCustomBranding}
                        onChange={(e) => setFormData({ ...formData, enableCustomBranding: e.target.checked })}
                        className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">Enable Custom Branding</div>
                        <div className="text-[10px] text-gray-400">Allow custom logo, colors, and white-label features</div>
                      </div>
                    </label>
                  </div>

                  {/* Company Info */}
                  {formData.enableCustomBranding && (
                    <div className="space-y-4 pt-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        Company Info
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex justify-between items-center">
                            Industry Type
                          </label>
                          <div className="flex gap-2 mb-2">
                            <div className="flex-1">
                              <Dropdown
                                value={formData.industryType}
                                options={["Select industry", ...filteredIndustries]}
                                onChange={(val) => setFormData({ ...formData, industryType: val })}
                                className="w-full h-10"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowAddIndustryModal(true)}
                              className="w-10 h-10 flex shrink-0 items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-customShadow"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search industry..."
                              value={industrySearchTerm}
                              onChange={(e) => handleIndustrySearchChange(e.target.value)}
                              className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
                          <input
                            type="text"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Company Location</label>
                          <input
                            type="text"
                            value={formData.companyLocation}
                            onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })}
                            className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Logo Upload */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Company Logo</label>
                        <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors overflow-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormData({
                                  ...formData,
                                  companyLogo: file,
                                  companyLogoPreview: URL.createObjectURL(file)
                                });
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          {formData.companyLogoPreview ? (
                            <div className="relative w-full h-32 flex items-center justify-center bg-navbarBg rounded-lg">
                              <img
                                src={formData.companyLogoPreview}
                                alt="Logo Preview"
                                className="max-h-full object-contain"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData({ ...formData, companyLogo: null, companyLogoPreview: "" });
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-20"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-navbarBg rounded-lg flex items-center justify-center">
                                <Upload className="w-5 h-5 text-gray-400" />
                              </div>
                              <p className="text-xs text-blue-500 font-bold">Click to Upload <span className="text-gray-400 font-normal">or drag and drop</span></p>
                              <p className="text-[10px] text-gray-400">SVG, PNG, or JPG (Max 800 x 800px)</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-customShadow"
          >
            Update Plan
          </button>
        </div>

        {/* Add Industry Modal */}
        {showAddIndustryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-navbarBg border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Industry</h3>
              <input
                type="text"
                placeholder="Enter industry name..."
                value={newIndustryName}
                onChange={(e) => setNewIndustryName(e.target.value)}
                className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 mb-6"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddIndustryModal(false);
                    setNewIndustryName("");
                  }}
                  className="px-4 py-2 border border-border text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIndustry}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors shadow-customShadow"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}