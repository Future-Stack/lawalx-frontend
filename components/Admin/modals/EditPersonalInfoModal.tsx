import { X, Edit2, User, Building2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Dropdown from "@/components/shared/Dropdown";
import { countries, getCountryByCode } from "@/constants/countries";

interface UserData {
  id: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  phoneCountry?: string;
  company_name?: string;
  companyName?: string;
  organization?: string;
  industryType?: string;
  website?: string;
  location?: string;
  cityCountry?: string;
  designation?: string;
  plan?: string;
  status?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void | Promise<void>;
  userData: UserData | null;
}

export default function EditPersonalInfoModal({ isOpen, onClose, onSave, userData }: Props) {
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "",
    location: "",
    cityCountry: "",
    companyName: "",
    industryType: "",
    website: "",
    phoneNumber: "",
    phoneCountry: "US",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        fullName: userData.fullName || userData.full_name || userData.name || "",
        designation: userData.designation || "",
        location: userData.location || "",
        cityCountry: userData.cityCountry || "",
        companyName: userData.companyName || userData.company_name || userData.organization || "",
        industryType: userData.industryType || "",
        website: userData.website || "",
        phoneNumber: userData.phoneNumber || userData.phone || "",
        phoneCountry: userData.phoneCountry || "US",
      });
    }
  }, [isOpen, userData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Rejections are handled by caller
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const country = getCountryByCode(formData.phoneCountry);
    if (!country) return;

    let val = e.target.value;
    
    // Ensure it always starts with the dial code
    if (!val.startsWith(country.dialCode)) {
      val = country.dialCode;
    } else {
      const subscriberPart = val.slice(country.dialCode.length).replace(/[^\d]/g, '');
      if (subscriberPart.length <= country.maxLength) {
        val = country.dialCode + subscriberPart;
      } else {
        val = formData.phoneNumber;
      }
    }
    
    setFormData({ ...formData, phoneNumber: val });
  };

  if (!isOpen || !userData) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-navbarBg rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="p-6 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Edit Personal Info
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Update user account and personal details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-6 overflow-y-auto scrollbar-hide flex-1">
          {/* User Details - Green Theme */}
          <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              User Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Company Location
                </label>
                <input
                  type="text"
                  value={formData.cityCountry}
                  onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Company & Contact Info - Blue Theme */}
          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company & Contact Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Industry Type
                </label>
                <input
                  type="text"
                  value={formData.industryType}
                  onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Website
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="w-24">
                    <Dropdown
                      value={formData.phoneCountry}
                      options={countries.map(c => c.code)}
                      onChange={(val) => {
                        const country = getCountryByCode(val);
                        if (country) {
                          setFormData({ 
                            ...formData, 
                            phoneCountry: val,
                            phoneNumber: country.dialCode
                          });
                        }
                      }}
                      className="w-full h-[38px]"
                      disabled={isSaving}
                    />
                  </div>
                  <input
                    type="text"
                    inputMode="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="flex-1 px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="cursor-pointer px-6 py-2 border border-border text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="cursor-pointer px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
