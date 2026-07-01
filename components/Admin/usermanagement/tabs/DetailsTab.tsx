"use client";

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  CreditCard,
  Activity,
  Globe,
  Users,
  Image as ImageIcon,
  Edit2,
  Briefcase,
} from "lucide-react";

interface DetailsTabProps {
  user: any;
  onEdit: () => void;
  onEditPersonalInfo: () => void;
}

export default function DetailsTab({ user, onEdit, onEditPersonalInfo }: DetailsTabProps) {
  // Use user data or fallbacks
  const personalInfo = {
    email: user.email || "N/A",
    phone: user.phone || "N/A",
    location: user.location || "N/A",
    joinDate: user.joinDate || "N/A",
    organization: user.organization || "N/A",
    plan: user.plan || "N/A",
    monthlyPayment: user.revenue || "N/A",
    status: user.status || "N/A",
  };

  const enterpriseInfo = {
    companyName: user.companyName || "N/A",
    industryType: user.industryType || "N/A",
    website: user.website || "N/A",
    companyLocation: user.companyLocation || "N/A",
    companyLogo: user.companyLogo || "N/A",
  };

  return (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <div className="bg-navbarBg rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-border p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Personal Info
          </h2>
          <button
            onClick={onEditPersonalInfo}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors cursor-pointer shadow-customShadow"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 p-4">
          {/* Email */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {personalInfo.email}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Phone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {personalInfo.phone}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {personalInfo.location}
            </div>
          </div>

          {/* Join Date */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Join Date</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {personalInfo.joinDate}
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>Organization</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {personalInfo.organization}
            </div>
          </div>

          {/* Plan */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Plan</span>
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium border border-orange-200 dark:border-orange-800">
                {personalInfo.plan}
              </span>
            </div>
          </div>

          {/* Monthly Payment */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Monthly Payment</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {personalInfo.monthlyPayment}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Status</span>
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800 flex items-center gap-1.5 w-fit">
                {personalInfo.status}
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Info Card */}
      <div className="bg-navbarBg rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-border p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Company Info
          </h2>
          {/* <button
            onClick={onEdit}
            className="px-4 shadow-customShadow py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 p-4">
          {/* Company Name */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Company Name (Shows on the app)</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {enterpriseInfo.companyName}
            </div>
          </div>

          {/* Industry Type */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>Industry Type</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {enterpriseInfo.industryType}
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {enterpriseInfo.website}
            </div>
          </div>

          {/* Company Location */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Company Location</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {enterpriseInfo.companyLocation}
            </div>
          </div>

          {/* Company Logo */}
          {/* <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Company Logo</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {enterpriseInfo.companyLogo}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
