import { X, Edit2, Shield, User, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import Dropdown from "@/components/shared/Dropdown";
import { countries, getCountryByCode } from "@/constants/countries";

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
  onSave: (data: any) => void;
  userData: UserData | null;
}

export default function EditPersonalInfoModal({ isOpen, onClose, onSave, userData }: Props) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    // Personal Info
    organization: "",
    designation: "",
    location: "",
    phoneNumber: "",
    countryCode: "US",
  });

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        fullName: userData.name || "",
        email: userData.email || "",
        password: "",
        organization: userData.organization || "TechCorp Inc.",
        designation: userData.designation || "CEO",
        location: userData.location || "USA",
        phoneNumber: userData.phone || "+10101010101",
        countryCode: "US", // Default or extract from phone if possible
      });
    }
  }, [isOpen, userData]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const country = getCountryByCode(formData.countryCode);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Organization
                </label>
                <input
                  type="text"
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
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-customShadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
