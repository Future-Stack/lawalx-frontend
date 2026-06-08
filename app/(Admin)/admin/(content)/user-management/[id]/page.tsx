"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Building2,
  User,
  Maximize2,
  HardDrive,
  MoreVertical,
  RotateCcw,
  Shuffle,
  Trash2,
  UserX,
  Home,
  ChevronRight,
  Activity,
} from "lucide-react";
import EditUserModal from "@/components/Admin/modals/EditUserModal";
import EditPersonalInfoModal from "@/components/Admin/modals/EditPersonalInfoModal";
import ResetPasswordModal from "@/components/Admin/modals/ResetPasswordModal";
import ChangePlanModal from "@/components/Admin/modals/ChangePlanModal";
import DeleteUserModal from "@/components/Admin/modals/DeleteUserModal";
import SuspendUserModal from "@/components/Admin/modals/SuspendUserModal";
import DetailsTab from "@/components/Admin/usermanagement/tabs/DetailsTab";
import SubscriptionTab from "@/components/Admin/usermanagement/tabs/SubscriptionTab";
import ContentTab from "@/components/Admin/usermanagement/tabs/ContentTab";
import DevicesTab from "@/components/Admin/usermanagement/tabs/DevicesTab";
import ActivityLogsTab from "@/components/Admin/usermanagement/tabs/ActivityLogsTab";
import Link from "next/link";
import { toast } from "sonner";
import {
  useLoginAsUserMutation,
  useDeleteUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useAdminResetPasswordMutation,
  useGetUserProfileQuery,
} from "@/redux/api/admin/usermanagementApi";

type TabType = "Details" | "Subscription & Billing" | "Content" | "Devices" | "Activity Logs";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const currency = useSelector((state: any) => state.settings.currency);

  const { data: profileData, isLoading } = useGetUserProfileQuery({ userId, currency });
  const profile = profileData?.data;

  const [activeTab, setActiveTab] = useState<TabType>("Details");
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditPersonalInfoOpen, setIsEditPersonalInfoOpen] = useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);

  const [loginAsUser] = useLoginAsUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [unsuspendUser] = useUnsuspendUserMutation();
  const [adminResetPassword] = useAdminResetPasswordMutation();

  const handleLoginAsUser = async (id: string) => {
    try {
      const res = await loginAsUser(id).unwrap();
      if (res.success) toast.success("Login tokens generated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to login as user");
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">User not found.</p>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || "Unknown";
  const currentSub = profile.currentSubscription;
  const storagePct = profile.stats?.storage?.usagePercentage || 0;

  const formatPrice = (price: any): string => {
    if (!price) return "N/A";
    if (typeof price === "string") {
      const num = parseFloat(price);
      return isNaN(num) ? price : `$${num.toFixed(2)}`;
    }
    if (typeof price === "number") return `$${price.toFixed(2)}`;
    if (typeof price === "object") {
      if (currency === "NGN") {
        const amt = price.amount ?? price.originalAmount;
        return amt != null ? `₦${Number(amt).toFixed(2)}` : "N/A";
      } else {
        const amt = price.originalAmount ?? price.amount;
        return amt != null ? `$${Number(amt).toFixed(2)}` : "N/A";
      }
    }
    return "N/A";
  };

  const planPrice = currentSub?.plan?.price
    ? `${formatPrice(currentSub.plan.price)}/month`
    : profile.currentPlan?.price
      ? `${formatPrice(profile.currentPlan.price)}/month`
      : "N/A";

  const user = {
    id: profile.id,
    name: displayName,
    userId: `U${profile.id.toUpperCase().slice(0, 6)}`,
    email: profile.personalInfo?.email || profile.account?.email || "",
    phone: profile.personalInfo?.phone || profile.phoneNumber || "N/A",
    location: profile.personalInfo?.location || profile.location || "N/A",
    joinDate: profile.personalInfo?.joinDate
      ? new Date(profile.personalInfo.joinDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "N/A",
    organization: profile.organization || profile.planInfo?.companyName || "N/A",
    plan: profile.planName || profile.personalInfo?.plan || "N/A",
    status: profile.status,
    revenue: planPrice,
    activeScreens: {
      used: profile.device?.length || 0,
      total: currentSub?.deviceLimit || 0,
      percentage: currentSub?.deviceLimit > 0
        ? Math.min(100, Math.round(((profile.device?.length || 0) / currentSub.deviceLimit) * 100))
        : 0,
    },
    storage: {
      used: `${profile.stats?.storage?.totalUsedGB ?? ((profile.stats?.storage?.totalUsedBytes || 0) / (1024 * 1024 * 1024)).toFixed(4)} GB`,
      total: `${profile.stats?.storage?.totalLimitGB || 0} GB`,
      percentage: storagePct,
    },
    companyName: profile.planInfo?.companyName,
    industryType: profile.planInfo?.industryType || profile.industryType,
    website: profile.planInfo?.website || profile.website,
    companyLocation: profile.planInfo?.companyLocation || profile.location,
    companyLogo: profile.planInfo?.companyLogo || profile.companyLogoUrl,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/admin/dashboard">
            <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/admin/user-management" className="hover:text-bgBlue cursor-pointer">
            User Management
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-bgBlue">{user.name}</span>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {profile.image_url ? (
              <img src={profile.image_url} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-lg">
                {getInitials(displayName)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.userId}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleLoginAsUser(user.id)}
              className="cursor-pointer px-6 py-2 bg-primary-action text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-customShadow"
            >
              <User className="w-4 h-4" />
              Login as user
            </button>
            <div className="relative">
              <button
                onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                className="p-2 border-none bg-transparent rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              {isActionMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsActionMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <button onClick={() => { setIsResetPasswordOpen(true); setIsActionMenuOpen(false); }} className="w-full cursor-pointer px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                      <RotateCcw className="w-4 h-4" /> Reset Password
                    </button>
                    <button onClick={() => { setIsChangePlanOpen(true); setIsActionMenuOpen(false); }} className="w-full cursor-pointer px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 transition-colors">
                      <Shuffle className="w-4 h-4" /> Change Plan
                    </button>
                    <button onClick={() => { setIsSuspendOpen(true); setIsActionMenuOpen(false); }} className="w-full cursor-pointer px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-orange-600 dark:text-orange-400 border-t border-gray-200 dark:border-gray-700 transition-colors">
                      <UserX className="w-4 h-4" /> Suspend User
                    </button>
                    <button onClick={() => { setIsDeleteUserOpen(true); setIsActionMenuOpen(false); }} className="w-full cursor-pointer px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 transition-colors rounded-b-lg">
                      <Trash2 className="w-4 h-4" /> Delete User
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-navbarBg rounded-full border border-border p-1.5 mb-6 inline-flex overflow-x-auto max-w-full">
        {(["Details", "Subscription & Billing", "Content", "Devices", "Activity Logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-full mr-2 font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
              activeTab === tab
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-customShadow"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab === "Details" && <Activity className="w-4 h-4" />}
              {tab === "Subscription & Billing" && <Building2 className="w-4 h-4" />}
              {tab === "Content" && <HardDrive className="w-4 h-4" />}
              {tab === "Devices" && <Maximize2 className="w-4 h-4" />}
              {tab === "Activity Logs" && <RotateCcw className="w-4 h-4" />}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "Details" && (
          <DetailsTab
            user={user}
            onEdit={() => setIsEditModalOpen(true)}
            onEditPersonalInfo={() => setIsEditPersonalInfoOpen(true)}
          />
        )}
        {activeTab === "Subscription & Billing" && (
          <SubscriptionTab
            onOpenChangePlan={() => setIsChangePlanOpen(true)}
            currentPlan={profile.currentPlan}
            paymentHistory={profile.paymentHistory}
            monthlyPayment={planPrice}
            currency={currency}
            userId={userId}
          />
        )}
        {activeTab === "Content" && (
          <ContentTab files={profile.files} stats={profile.stats} />
        )}
        {activeTab === "Devices" && (
          <DevicesTab devices={profile.device} />
        )}
        {activeTab === "Activity Logs" && <ActivityLogsTab activities={profile.activities} />}
      </div>

      <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} userData={profile} onSave={() => {}} />
      <EditPersonalInfoModal
        isOpen={isEditPersonalInfoOpen}
        onClose={() => setIsEditPersonalInfoOpen(false)}
        onSave={() => toast.success("Personal information updated successfully")}
        userData={profile}
      />
      <ChangePlanModal isOpen={isChangePlanOpen} onClose={() => setIsChangePlanOpen(false)} userData={profile} onConfirm={() => setIsChangePlanOpen(false)} />
      <SuspendUserModal
        isOpen={isSuspendOpen}
        onClose={() => setIsSuspendOpen(false)}
        userName={user.name}
        onConfirm={async () => {
          try {
            await suspendUser(userId).unwrap();
            toast.success("User suspended successfully");
            setIsSuspendOpen(false);
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to suspend user");
          }
        }}
      />
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        onConfirm={async (newPassword: string) => {
          try {
            await adminResetPassword({ userId, data: { newPassword } }).unwrap();
            toast.success("Password reset successfully");
            setIsResetPasswordOpen(false);
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to reset password");
          }
        }}
      />
      <DeleteUserModal
        isOpen={isDeleteUserOpen}
        onClose={() => setIsDeleteUserOpen(false)}
        userName={user.name}
        onConfirm={async () => {
          try {
            await deleteUser(userId).unwrap();
            toast.success("User deleted successfully");
            setIsDeleteUserOpen(false);
            router.push("/admin/user-management");
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete user");
          }
        }}
      />
    </div>
  );
}
