"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EditUserModal from "@/components/Admin/modals/EditUserModal";
import ResetPasswordModal from "@/components/Admin/modals/ResetPasswordModal";
import SuspendUserModal from "@/components/Admin/modals/SuspendUserModal";
import DeleteUserModal from "@/components/Admin/modals/DeleteUserModal";
import AddUserModal from "@/components/Admin/usermanagement/AddUserModal";
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  Search,
  MoreVertical,
  Eye,
  Edit,
  LogIn,
  RotateCcw,
  UserX,
  Trash2,
  Home,
  ChevronRight,
  UserRoundPlus,
  CloudDownload,
  FileSpreadsheet,
} from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import Link from "next/link";
import {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useDeleteUserMutation,
  useLoginAsUserMutation,
  useAdminResetPasswordMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useLazyGetExportDataQuery,
} from "@/redux/api/admin/usermanagementApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface UserPayment {
  id: string;
  amount: number;
  transactionId: string;
  cardNumber: string | null;
  durationDays: number | null;
  email: string;
  subscription: boolean;
  userId: string;
  planName: string;
  billingCycle: string;
  deviceLimit: number;
  storageGB: number;
  uploadFileLimit: number | null;
  createdAt: string;
  updatedAt: string;
  imageLimit: number;
  imageMaxSizeMb: number;
  imageAllowedFormats: string[];
  videoLimit: number;
  videoMaxSizeMb: number;
  videoAllowedFormats: string[];
  audioLimit: number;
  audioMaxSizeMb: number;
  audioAllowedFormats: string[];
  enableCustomBranding: boolean;
  status: string;
}

interface UserAccount {
  email: string;
  is_verified: boolean;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  full_name: string | null;
  company_name: string | null;
  image_url: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  designation: string | null;
  location: string | null;
  phoneCountry: string | null;
  phoneNumber: string | null;
  officialName: string | null;
  industryType: string | null;
  totalEmployees: string | null;
  website: string | null;
  cityCountry: string | null;
  companyLogoUrl: string | null;
  advanceCustomizationEnabled: boolean;
  account: UserAccount;
  payments: UserPayment[];
  issues: string[];
}

export default function UserManagementPage() {
  const router = useRouter();

  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [storageFilter, setStorageFilter] = useState(">80% Storage");

  const limit = 10;

  // API Queries
  const planQuery = planFilter === "All Plans"
    ? undefined
    : planFilter === "Free Trial"
      ? "FREE_TRIAL"
      : planFilter === "Trial"
        ? "TRIAL"
        : planFilter;

  const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
    plan: planQuery,
    storageUsage: storageFilter,
  });

  const { data: statsData } = useGetUserStatsQuery({});

  // API Mutations
  const [deleteUser] = useDeleteUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [unsuspendUser] = useUnsuspendUserMutation();
  const [loginAsUser] = useLoginAsUserMutation();
  const [adminResetPassword] = useAdminResetPasswordMutation();

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const users = usersData?.data || [];
  const meta = usersData?.meta || {};
  const stats = statsData?.data || {};

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u: any) => u.id)));
    }
  };

  const [triggerExport] = useLazyGetExportDataQuery();

  const handleExportPDF = async () => {
    try {
      const { data: exportData, isError } = await triggerExport({
        search: searchTerm,
        status: statusFilter,
        plan: planFilter,
        storageUsage: storageFilter,
      });

      if (isError || !exportData?.success) {
        toast.error("Failed to fetch export data");
        return;
      }

      const users = exportData.data?.users?.users || [];
      const doc = new jsPDF();

      // Add Title
      doc.setFontSize(18);
      doc.text('User Management Report', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Exported At: ${new Date().toLocaleString()}`, 14, 30);

      // Define table columns
      const tableColumn = ["Index", "User ID", "Name", "Email", "Plan", "Role", "Status"];
      const tableRows: any[] = [];

      users.forEach((user: any, index: number) => {
        const userData = [
          index + 1,
          user.id || 'N/A',
          user.full_name || user.username || 'N/A',
          user.account?.email || 'N/A',
          (user.payments?.[0]?.plan?.name || "Free Trial").replace("_", " "),
          user.role || 'N/A',
          user.status || 'N/A'
        ];
        tableRows.push(userData);
      });

      // Generate Table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }, // Blue-500
        styles: { fontSize: 8 }
      });

      // Save PDF
      doc.save(`user-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("User report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred while exporting the report");
    } finally {
      setShowExportMenu(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const { data: exportData, isError } = await triggerExport({
        search: searchTerm,
        status: statusFilter,
        plan: planFilter,
        storageUsage: storageFilter,
      });

      if (isError || !exportData?.success) {
        toast.error("Failed to fetch export data");
        return;
      }

      const users = exportData.data?.users?.users || [];
      const wb = XLSX.utils.book_new();
      const wsData: any[] = [
        ["Index", "User ID", "Name", "Email", "Plan", "Role", "Status"],
        ...users.map((user: any, index: number) => [
          index + 1,
          user.id || 'N/A',
          user.full_name || user.username || 'N/A',
          user.account?.email || 'N/A',
          (user.payments?.[0]?.plan?.name || "Free Trial").replace("_", " "),
          user.role || 'N/A',
          user.status || 'N/A'
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      XLSX.writeFile(wb, `user-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("User report exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("An error occurred while exporting the report");    } finally {
      setShowExportMenu(false);    }
  };

  const toggleSelectUser = (id: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = async (action: "suspend" | "unsuspend") => {
    toast.info(`Bulk ${action} for ${selectedUsers.size} users (Processing...)`);
    try {
      for (const userId of Array.from(selectedUsers)) {
        if (action === "suspend") {
          await suspendUser(userId).unwrap();
        } else {
          await unsuspendUser(userId).unwrap();
        }
      }
      toast.success(`Bulk ${action} successful`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${action} some users`);
    }
    setSelectedUsers(new Set());
  };

  const handleAddUser = (data: any) => {
    // Current API doesn't have an add user endpoint in usermanagementApi.ts provided in the prompt
    // Assuming it's handled elsewhere or needs to be added later.
    toast.info("Add user functionality not yet connected to backend.");
    setIsModalOpen(false);
  };

  const handleLoginAsUser = async (userId: string) => {
    try {
      const res = await loginAsUser(userId).unwrap();
      if (res.success) {
        toast.success("Login tokens generated successfully");
        // Store tokens and redirect if needed
        console.log("Tokens:", res.data);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to login as user");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/admin/dashboard">
            <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-500 dark:text-blue-400">
            User Management
          </span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage user accounts, subscriptions, and permissions
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(prev => !prev)}
                className="px-4 py-2 shadow-customShadow cursor-pointer bg-white dark:bg-gray-800 text-nowrap rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <CloudDownload className="w-4 h-4" />
                <span className="hidden lg:block">Export Report</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 bg-navbarBg border border-border rounded-lg shadow-lg z-10 min-w-[140px]">
                  <button onClick={handleExportPDF} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg cursor-pointer">📄 PDF</button>
                  <button onClick={handleExportExcel} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg cursor-pointer">📊 Excel</button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 shadow-customShadow cursor-pointer bg-blue-500 hover:bg-blue-600 text-nowrap text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <UserRoundPlus className="w-4 h-4" />
              <span className="hidden lg:block">Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-navbarBg p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Users
            </span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 dark:text-white">
            {stats.totalUsers?.count || 0}
          </div>
          <div className={`text-sm ${(stats.totalUsers?.change || 0) < 0 ? 'text-red-500' : 'text-green-500'} flex items-center gap-1 mt-1`}>
            <span>{(stats.totalUsers?.change || 0) < 0 ? '↓' : '↑'} {Math.abs(stats.totalUsers?.change || 0)} %</span>
            <span className="text-gray-500 dark:text-gray-400">
              From Last Month
            </span>
          </div>
        </div>

        <div className="bg-navbarBg p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Active Users
            </span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 dark:text-white">
            {stats.activeUsers?.count || 0}
          </div>
          <div className={`text-sm ${(stats.activeUsers?.change || 0) < 0 ? 'text-red-500' : 'text-green-500'} flex items-center gap-1 mt-1`}>
            <span>{(stats.activeUsers?.change || 0) < 0 ? '↓' : '↑'} {Math.abs(stats.activeUsers?.change || 0)} %</span>
            <span className="text-gray-500 dark:text-gray-400">
              From Last Month
            </span>
          </div>
        </div>

        <div className="bg-navbarBg p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Trial Users
            </span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 dark:text-white">
            {stats.trialUsers?.count || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
            <span>{stats.trialUsers?.conversionRate || 0} %</span>
            <span className="text-gray-500 dark:text-gray-400">
              Conversion rate
            </span>
          </div>
        </div>

        <div className="bg-navbarBg p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Need Attention
            </span>
          </div>
          <div className="text-3xl font-semibold text-gray-900 dark:text-white">
            {stats.needAttention?.count || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overdue, Offline, Errors
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-navbarBg rounded-lg border border-border">
        {/* Table Header */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedUsers.size > 0
                ? `Selected (${selectedUsers.size})`
                : `All Users (${meta.total || 0})`}
            </h2>
            {selectedUsers.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("unsuspend")}
                  className="px-4 cursor-pointer py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Unsuspend
                </button>
                <button
                  onClick={() => handleBulkAction("suspend")}
                  className="px-4 cursor-pointer py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Suspend
                </button>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border bg-navbarBg rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
            <Dropdown
              value={planFilter}
              options={["All Plans", "Premium", "Free Trial"]}
              onChange={setPlanFilter}
            />
            <Dropdown
              value={statusFilter}
              options={["All Status", "Active", "Suspended"]}
              onChange={setStatusFilter}
            />
            {/* <Dropdown
              value={storageFilter}
              options={[">80% Storage", "50% Storage", "90% Storage"]}
              onChange={setStorageFilter}
            /> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUsers.size === users.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Storage (GB)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Issues
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isUsersLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : users.map((user: any, index: number) => {
                const isFirstRows = index < 2;
                const isLastRows = index >= users.length - 2;

                // Derive fields from API response
                const payment = user.payments?.[0];
                const plan = (payment?.planName || "Free Trial").replace("_", " ");
                const deviceLimit = payment?.deviceLimit || 0;
                const storageGB = payment?.storageGB || 0;

                const deviceUsedRaw = user.device ?? user.deviceUsage ?? 0;
                const deviceUsed = Number(String(deviceUsedRaw).replace(/[^0-9.]/g, '')) || 0;
                const storageUsedRaw = user.storage ?? user.storageUsage ?? 0;
                const storageUsed = Number(String(storageUsedRaw).replace(/[^0-9.]/g, '')) || 0;

                const deviceUsage = deviceLimit > 0 ? Math.min(100, Math.round((deviceUsed / deviceLimit) * 100)) : 0;
                const storageUsage = storageGB > 0 ? Math.min(100, Math.round((storageUsed / storageGB) * 100)) : 0;
                const statusStr = user.status.charAt(0) + user.status.slice(1).toLowerCase();

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-nowrap">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.account?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                        {plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white mb-1">
                        {`${deviceUsed}/${deviceLimit || 0}`}
                      </div>
                      <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${deviceUsage > 80
                            ? "bg-red-500"
                            : deviceUsage > 60
                              ? "bg-orange-500"
                              : "bg-blue-500"
                            }`}
                          style={{ width: `${deviceUsage}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white mb-1">
                        {`${storageUsed}GB/${storageGB || 0}GB`}
                      </div>
                      <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${storageUsage > 80
                            ? "bg-red-500"
                            : storageUsage > 60
                              ? "bg-orange-500"
                              : "bg-blue-500"
                            }`}
                          style={{ width: `${storageUsage}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-medium border ${user.status === "ACTIVE"
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                          : user.status === "SUSPENDED"
                            ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE"
                            ? "bg-green-500"
                            : user.status === "SUSPENDED"
                              ? "bg-red-500"
                              : "bg-gray-500"
                            }`}
                        />
                        {statusStr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.issues && user.issues.length > 0 && user.issues[0] !== "No issues" ? (
                        <div className="flex gap-2">
                          {user.issues.map((issue: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs text-nowrap"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No issues
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenActionMenu(
                              openActionMenu === user.id ? null : user.id
                            )
                          }
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </button>
                        {openActionMenu === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenActionMenu(null)}
                            />
                            <div
                              className={`absolute right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 ${isFirstRows
                                ? "mt-2"
                                : isLastRows
                                  ? "bottom-full mb-2"
                                  : "mt-2"
                                }`}
                            >
                              <button
                                onClick={() => {
                                  router.push(
                                    `/admin/user-management/${user.id
                                    }?name=${encodeURIComponent(
                                      user.full_name || user.username
                                    )}&email=${encodeURIComponent(
                                      user.account?.email || ""
                                    )}&plan=${plan}&status=${user.status
                                    }&device=${deviceLimit || 0}&storage=${storageGB || 0}
                                    }&deviceUsage=${deviceUsage
                                    }&storageUsage=${storageUsage}`
                                  );
                                }}
                                className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Profile
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditModalOpen(true);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                Edit User
                              </button>

                              <button
                                onClick={() => {
                                  handleLoginAsUser(user.id);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                              >
                                <LogIn className="w-4 h-4" />
                                Login as user
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsResetPasswordOpen(true);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Reset Password
                              </button>

                              {user.status === "SUSPENDED" ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      await unsuspendUser(user.id).unwrap();
                                      toast.success("User unsuspended successfully");
                                    } catch (err: any) {
                                      toast.error(err?.data?.message || "Failed to unsuspend user");
                                    }
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full cursor-pointer px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Unsuspend User
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsSuspendModalOpen(true);
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full cursor-pointer px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                >
                                  <UserX className="w-4 h-4" />
                                  Suspend User
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteModalOpen(true);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full cursor-pointer px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex justify-between items-center bg-navbarBg rounded-b-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {users.length} of {meta.total || 0} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => (meta.totalPages && prev < meta.totalPages) ? prev + 1 : prev)}
              disabled={page === (meta.totalPages || 1)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />

      {/* Reusable Modals */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={selectedUser}
        onSave={(updatedData) => {
          console.log("User updated:", updatedData);
          setIsEditModalOpen(false);
          toast.info("Edit user functionality not yet connected to specialized backend endpoint.");
        }}
      />

      <ResetPasswordModal
        {...({
          isOpen: isResetPasswordOpen,
          onClose: () => setIsResetPasswordOpen(false),
          userName: selectedUser?.full_name || selectedUser?.username || "",
          onConfirm: async (newPassword: string) => {
            try {
              await adminResetPassword({ userId: selectedUser.id, data: { newPassword } }).unwrap();
              toast.success("Password reset successfully");
              setIsResetPasswordOpen(false);
            } catch (err: any) {
              toast.error(err?.data?.message || "Failed to reset password");
            }
          },
        } as any)}
      />

      <SuspendUserModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        userName={selectedUser?.full_name || selectedUser?.username || ""}
        onConfirm={async () => {
          try {
            await suspendUser(selectedUser.id).unwrap();
            toast.success("User suspended successfully");
            setIsSuspendModalOpen(false);
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to suspend user");
          }
        }}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userName={selectedUser?.full_name || selectedUser?.username || ""}
        onConfirm={async () => {
          try {
            await deleteUser(selectedUser.id).unwrap();
            toast.success("User deleted successfully");
            setIsDeleteModalOpen(false);
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete user");
          }
        }}
      />
    </div>
  );
}
