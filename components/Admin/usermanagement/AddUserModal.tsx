import { useState } from "react";
import { X, Users, Shield, User, CreditCard, Sliders, Building2, Upload, Info, Plus } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import { countries, getCountryByCode } from "@/constants/countries";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (data: any) => void;
}

export default function AddUserModal({ isOpen, onClose, onAddUser }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    // Personal Info
    organization: "",
    designation: "",
    location: "",
    phoneNumber: "+1",
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
    countryCode: "US",
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

  const handleSubmit = () => {
    onAddUser(formData);
    onClose();
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const country = getCountryByCode(formData.countryCode);
    if (!country) return;

    let val = e.target.value;
    
    // Ensure it always starts with the dial code
    if (!val.startsWith(country.dialCode)) {
      // If user tries to delete the dial code, put it back
      val = country.dialCode;
    } else {
      // Only allow digits after the dial code
      const subscriberPart = val.slice(country.dialCode.length).replace(/[^\d]/g, '');
      
      // Limit the length based on country metadata
      if (subscriberPart.length <= country.maxLength) {
        val = country.dialCode + subscriberPart;
      } else {
        // If exceeds limit, keep previous value
        val = formData.phoneNumber;
      }
    }
    
    setFormData({ ...formData, phoneNumber: val });
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Password *
                </label>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="TechCorp Inc."
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="CEO"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Location
                </label>
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
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="w-24">
                    <Dropdown
                      value={formData.countryCode}
                      options={countries.map(c => c.code)}
                      onChange={(val) => {
                        const country = getCountryByCode(val);
                        if (country) {
                          setFormData({ 
                            ...formData, 
                            countryCode: val,
                            phoneNumber: country.dialCode
                          });
                        }
                      }}
                      className="w-full h-[38px]"
                    />
                  </div>
                  <input
                    type="text"
                    inputMode="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="flex-1 px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
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
                  options={["Demo (For developers)","Free Trial", "Basic", "Pro", "Enterprise"]}
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
                            placeholder="TechCorp Inc."
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
                            placeholder="https://example.com"
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Company Location</label>
                          <input
                            type="text"
                            value={formData.companyLocation}
                            placeholder="City, Country"
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
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-customShadow"
          >
            <Plus className="w-4 h-4" /> Add User
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