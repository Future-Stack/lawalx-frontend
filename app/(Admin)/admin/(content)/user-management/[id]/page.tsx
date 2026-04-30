"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  User,
  Maximize2,
  HardDrive,
  MoreVertical,
  RotateCcw,
  Edit2,
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
import MonitoringTab from "@/components/Admin/usermanagement/tabs/MonitoringTab";
import SubscriptionTab from "@/components/Admin/usermanagement/tabs/SubscriptionTab";
import ContentTab from "@/components/Admin/usermanagement/tabs/ContentTab";
import DevicesTab from "@/components/Admin/usermanagement/tabs/DevicesTab";
import ActivityLogsTab from "@/components/Admin/usermanagement/tabs/ActivityLogsTab";
import Link from "next/link";
import { formatBytes } from "@/lib/content-utils";
import { toast } from "sonner";
import {
  useLoginAsUserMutation,
  useDeleteUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useAdminResetPasswordMutation,
} from "@/redux/api/admin/usermanagementApi";

type TabType =
  | "Details"
  | "Subscription & Billing"
  | "Content"
  | "Devices"
  | "Activity Logs";

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: string;
  device: string;
  deviceUsage: number;
  storage: string;
  storageUsage: number;
  status: string;
  issues?: string[];
  phone?: string;
  location?: string;
  joinDate?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.id as string;

  const [userData, setUserData] = useState<UserData | null>(null);
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

  const handleLoginAsUser = async (id: string) => {
    try {
      const res = await loginAsUser(id).unwrap();
      if (res.success) {
        toast.success("Login tokens generated successfully");
        // Store tokens and redirect if needed
        console.log("Tokens:", res.data);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to login as user");
    }
  };

  // Load user data from localStorage or URL params
  useEffect(() => {
    // Try to get from localStorage first
    const storedUser = localStorage.getItem("selectedUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
      // Clear after reading
      localStorage.removeItem("selectedUser");
    } else {
      // Fallback to URL params
      const name = searchParams.get("name");
      const email = searchParams.get("email");
      const plan = searchParams.get("plan");
      const status = searchParams.get("status");
      const device = searchParams.get("device");
      const storage = searchParams.get("storage");
      const deviceUsage = searchParams.get("deviceUsage");
      const storageUsage = searchParams.get("storageUsage");

      const phone = searchParams.get("phone");
      const location = searchParams.get("location");
      const joinDate = searchParams.get("joinDate");

      if (name && email) {
        setUserData({
          id: userId,
          name,
          email,
          plan: plan || "Starter",
          device: device || "0/50",
          deviceUsage: Number(deviceUsage) || 0,
          storage: storage || "100 GB",
          storageUsage: Number(storageUsage) || 0,
          status: status || "Active",
          phone: phone || "N/A",
          location: location || "N/A",
          joinDate: joinDate || "N/A",
        });
      }
    }
  }, [userId, searchParams]);

  // Form states
  const [editFormData, setEditFormData] = useState({
    fullName: "John Smith",
    email: "john.smith@techcorp.com",
    password: "",
    plan: "Enterprise",
    deviceLimit: "30",
    storageLimit: "200",
    price: "$299",
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
    enableCustomBranding: false,
    companyName: "",
    industryType: "Select industry",
    website: "https://example.com",
    locationType: "City, Country",
  });

  const [newPassword, setNewPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("Enterprise");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Use userData instead of hardcoded user object
  const user = userData
    ? {
      id: userData.id,
      name: userData.name,
      userId: `U${userData.id.toUpperCase().slice(0, 6)}`,
      email: userData.email,
      phone: userData.phone || "+1 (555) 123-4567",
      location: userData.location || "Not specified",
      joinDate: userData.joinDate && userData.joinDate !== "N/A"
        ? new Date(userData.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : "January 15, 2025",
      organization: "TechCorp Inc.",
      role: "Administrator",
      plan: userData.plan,
      status: userData.status,
      activeScreens: {
        used: parseInt(userData.device.split("/")[0]) || 0,
        total: parseInt(userData.device.split("/")[1]) || 50,
        percentage: userData.deviceUsage,
      },
      storage: {
        used: formatBytes((userData.storageUsage * (parseInt(userData.storage) || 0) * 1024 * 1024 * 1024) / 100),
        total: userData.storage,
        percentage: userData.storageUsage,
      },
      uptime: "99.8%",
      uptimeInfo: "Above SLA target Last 30 days",
      revenue: "$299",
      revenueInfo: "+2.4% vs last month",
    }
    : null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading state while data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  // Update editFormData initial values based on userData
  // useEffect(() => {
  //   if (userData) {
  //     setEditFormData((prev) => ({
  //       ...prev,
  //       fullName: userData.name,
  //       email: userData.email,
  //       plan: userData.plan,
  //       deviceLimit: userData.device.split("/")[1] || "50",
  //       storageLimit: userData.storage.replace(" GB", "") || "200",
  //     }));
  //   }
  // }, [userData]);

  const paymentHistory = [
    {
      invoice: "INV-2023-1245",
      amount: "$299.00",
      status: "Paid",
      date: "Nov 15, 2025",
    },
    {
      invoice: "INV-2023-1245",
      amount: "$299.00",
      status: "Paid",
      date: "Oct 15, 2024",
    },
    {
      invoice: "INV-2023-1245",
      amount: "$299.00",
      status: "Failed",
      date: "Sep 15, 2024",
    },
    {
      invoice: "INV-2023-1245",
      amount: "$299.00",
      status: "Paid",
      date: "Aug 15, 2024",
    },
  ];

  const handleResetPassword = () => {
    if (newPassword.trim()) {
      console.log("Password reset:", newPassword);
      setIsResetPasswordOpen(false);
      setNewPassword("");
    }
  };

  const handleChangePlan = (data: any) => {
    console.log("Plan updated:", data);
    setIsChangePlanOpen(false);
  };

  const handleDeleteUser = () => {
    if (deleteConfirmText === "DELETE") {
      console.log("User deleted");
      setIsDeleteUserOpen(false);
      router.push("/admin/user-management");
    }
  };

  const handleSuspend = () => {
    alert("User suspended");
    setIsSuspendOpen(false);
    router.push("/admin/user-management");
  };

  const handleEditUser = () => {
    console.log("User updated:", editFormData);
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 border-b border-border pb-4">
        {/* <button
          onClick={() => router.push("/user-management")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button> */}

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/admin/dashboard">
            <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href="/admin/user-management"
            className=" hover:text-bgBlue cursor-pointer"
          >
            User Management
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-bgBlue">{user.name}</span>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-lg">
              {getInitials(user.name)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {user.userId}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {/* <button
              onClick={() => setIsEditModalOpen(true)}
              className="cursor-pointer px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit User
            </button> */}
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
                    <button
                      onClick={() => {
                        setIsResetPasswordOpen(true);
                        setIsActionMenuOpen(false);
                      }}
                      className="w-full cursor-pointer px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset Password
                    </button>
                    <button
                      onClick={() => {
                        setIsChangePlanOpen(true);
                        setIsActionMenuOpen(false);
                      }}
                      className="w-full cursor-pointer px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 transition-colors"
                    >
                      <Shuffle className="w-4 h-4" /> Change Plan
                    </button>
                    <button
                      onClick={() => {
                        setIsSuspendOpen(true);
                        setIsActionMenuOpen(false);
                      }}
                      className="w-full cursor-pointer px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-orange-600 dark:text-orange-400 border-t border-gray-200 dark:border-gray-700 transition-colors"
                    >
                      <UserX className="w-4 h-4" /> Suspend User
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteUserOpen(true);
                        setIsActionMenuOpen(false);
                      }}
                      className="w-full cursor-pointer px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 transition-colors rounded-b-lg"
                    >
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
        {([
          "Details",
          "Subscription & Billing",
          "Content",
          "Devices",
          "Activity Logs",
        ] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-full mr-2 font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${activeTab === tab
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-customShadow"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
          >
            {tab === "Details" && (
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 ml-0.5" />
                Details
              </span>
            )}
            {tab === "Subscription & Billing" && (
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 ml-0.5" />
                {tab}
              </span>
            )}
            {tab === "Content" && (
              <span className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 ml-0.5" />
                {tab}
              </span>
            )}
            {tab === "Devices" && (
              <span className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 ml-0.5" />
                {tab}
              </span>
            )}
            {tab === "Activity Logs" && (
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 ml-0.5" />
                {tab}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="">
        {activeTab === "Details" && (
          <DetailsTab
            user={user}
            onEdit={() => setIsEditModalOpen(true)}
            onEditPersonalInfo={() => setIsEditPersonalInfoOpen(true)}
          />
        )}
        {activeTab === "Subscription & Billing" && (
          <SubscriptionTab onOpenChangePlan={() => setIsChangePlanOpen(true)} />
        )}
        {activeTab === "Content" && <ContentTab />}
        {activeTab === "Devices" && <DevicesTab />}
        {activeTab === "Activity Logs" && <ActivityLogsTab />}
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
        onSave={() => { }}
      />
      <EditPersonalInfoModal
        isOpen={isEditPersonalInfoOpen}
        onClose={() => setIsEditPersonalInfoOpen(false)}
        onSave={(data) => {
          console.log("Saving personal info:", data);
          toast.success("Personal information updated successfully");
        }}
        userData={userData}
      />
      <ChangePlanModal
        isOpen={isChangePlanOpen}
        onClose={() => setIsChangePlanOpen(false)}
        userData={userData}
        onConfirm={handleChangePlan}
      />
      <SuspendUserModal
        isOpen={isSuspendOpen}
        onClose={() => setIsSuspendOpen(false)}
        userName={user?.name || ""}
        onConfirm={() => { }}
      />
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        onConfirm={() => { }}
      />
      <DeleteUserModal
        isOpen={isDeleteUserOpen}
        onClose={() => setIsDeleteUserOpen(false)}
        userName={user?.name || ""}
        onConfirm={() => { }}
      />
    </div>
  );
}