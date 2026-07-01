"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EditPersonalInfoModal from "@/components/Admin/modals/EditPersonalInfoModal";
import ResetPasswordModal from "@/components/Admin/modals/ResetPasswordModal";
import SuspendUserModal from "@/components/Admin/modals/SuspendUserModal";
import DeleteUserModal from "@/components/Admin/modals/DeleteUserModal";
import AddUserModal from "@/components/Admin/usermanagement/AddUserModal";
import {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useDeleteUserMutation,
  useLoginAsUserMutation,
  useAdminResetPasswordMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useLazyGetExportDataQuery,
  useUpdateUserMutation,
} from "@/redux/api/admin/usermanagementApi";
// Import refactored subcomponents
import UserManagementHeader from "@/components/Admin/usermanagement/UserManagementHeader";
import UserStatsCards from "@/components/Admin/usermanagement/UserStatsCards";
import UserFilterSection from "@/components/Admin/usermanagement/UserFilterSection";
import UserTable from "@/components/Admin/usermanagement/UserTable";
import UserMobileList from "@/components/Admin/usermanagement/UserMobileList";
import UserPagination from "@/components/Admin/usermanagement/UserPagination";
import { handleExportPDF as handleExportPDFUtil, handleExportExcel as handleExportExcelUtil } from "@/components/Admin/usermanagement/exportUtils";
import { type User, type UserPayment } from "@/types/admin/usermanagement";

export default function UserManagementPage() {
  const router = useRouter();

  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [storageFilter, setStorageFilter] = useState(0);

  const limit = 10;

  // API Queries
  const planQuery =
    planFilter === "All Plans"
      ? undefined
      : planFilter === "Free" || planFilter === "Free Trial"
      ? "FREE_TRIAL"
      : planFilter.toUpperCase().replace(" ", "_");

  const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
    plan: planQuery,
    storageUsage: storageFilter > 0 ? storageFilter : undefined,
  });

  const { data: statsData } = useGetUserStatsQuery({});

  // API Mutations
  const [deleteUser] = useDeleteUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [unsuspendUser] = useUnsuspendUserMutation();
  const [loginAsUser] = useLoginAsUserMutation();
  const [adminResetPassword] = useAdminResetPasswordMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleSavePersonalInfo = async (data: any) => {
    if (!selectedUser?.id) return;
    try {
      await updateUser({
        userId: selectedUser.id,
        data: {
          fullName: data.fullName,
          designation: data.designation,
          location: data.location,
          phoneNumber: data.phoneNumber,
          phoneCountry: data.phoneCountry,
          companyName: data.companyName,
          industryType: data.industryType,
          website: data.website,
          cityCountry: data.cityCountry,
        },
      }).unwrap();
      toast.success("User updated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user information");
      throw err;
    }
  };

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
    await handleExportPDFUtil({
      triggerExport,
      searchTerm,
      statusFilter,
      planFilter,
      storageFilter,
    });
  };

  const handleExportExcel = async () => {
    await handleExportExcelUtil({
      triggerExport,
      searchTerm,
      statusFilter,
      planFilter,
      storageFilter,
    });
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



  const handleLoginAsUser = async (userId: string) => {
    try {
      const res = await loginAsUser(userId).unwrap();
      if (res.success) {
        // 1. Save the admin's current token in sessionStorage so we can restore it later
        const adminToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1] || '';
        const adminRefreshToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('refreshToken='))
          ?.split('=')[1] || '';

        sessionStorage.setItem('impersonation_original_token', adminToken);
        sessionStorage.setItem('impersonation_original_refresh_token', adminRefreshToken);

        // 2. Set the impersonated user's tokens as the active session
        //    We use cookies (same as authSlice) so the app auth picks them up
        const newToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        // Write cookies with the same settings used by authSlice
        document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
        document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;

        toast.success(`Impersonating ${res.data.user?.email || 'user'}. Redirecting...`);

        // 3. Hard redirect to user dashboard or supporter portal — forces a full page reload
        //    so the app picks up the new cookies and renders as the user
        const role = res.data.user?.role?.toUpperCase() || 'USER';
        const targetUrl = role === 'SUPPORTER' ? '/supporter/overview' : '/dashboard';
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1000);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to login as user");
    }
  };

  return (
    <div className="min-h-screen">
      <UserManagementHeader
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onAddUserClick={() => setIsModalOpen(true)}
      />

      <UserStatsCards stats={stats} />

      <div className="bg-navbarBg rounded-lg border border-border">
        <UserFilterSection
          selectedUsersCount={selectedUsers.size}
          totalUsersCount={meta.total || 0}
          usersLength={users.length}
          toggleSelectAll={toggleSelectAll}
          handleBulkAction={handleBulkAction}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          storageFilter={storageFilter}
          setStorageFilter={setStorageFilter}
        />

        <UserTable
          users={users}
          isLoading={isUsersLoading}
          selectedUsers={selectedUsers}
          toggleSelectAll={toggleSelectAll}
          toggleSelectUser={toggleSelectUser}
          openActionMenu={openActionMenu}
          setOpenActionMenu={setOpenActionMenu}
          onEditUser={(user) => {
            setSelectedUser(user);
            setIsEditModalOpen(true);
          }}
          onImpersonateUser={handleLoginAsUser}
          onUnsuspendUser={async (userId) => {
            try {
              await unsuspendUser(userId).unwrap();
              toast.success("User unsuspended successfully");
            } catch (err: any) {
              toast.error(err?.data?.message || "Failed to unsuspend user");
            }
          }}
          onSuspendUser={(user) => {
            setSelectedUser(user);
            setIsSuspendModalOpen(true);
          }}
          onDeleteUser={(user) => {
            setSelectedUser(user);
            setIsDeleteModalOpen(true);
          }}
        />

        <UserMobileList
          users={users}
          isLoading={isUsersLoading}
          selectedUsers={selectedUsers}
          toggleSelectUser={toggleSelectUser}
          openActionMenu={openActionMenu}
          setOpenActionMenu={setOpenActionMenu}
          onEditUser={(user) => {
            setSelectedUser(user);
            setIsEditModalOpen(true);
          }}
          onImpersonateUser={handleLoginAsUser}
          onUnsuspendUser={async (userId) => {
            try {
              await unsuspendUser(userId).unwrap();
              toast.success("User unsuspended successfully");
            } catch (err: any) {
              toast.error(err?.data?.message || "Failed to unsuspend user");
            }
          }}
          onSuspendUser={(user) => {
            setSelectedUser(user);
            setIsSuspendModalOpen(true);
          }}
          onDeleteUser={(user) => {
            setSelectedUser(user);
            setIsDeleteModalOpen(true);
          }}
        />

        <UserPagination
          usersLength={users.length}
          totalCount={meta.total || 0}
          page={page}
          totalPages={meta.totalPages || 1}
          setPage={setPage}
        />
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Reusable Modals */}
      <EditPersonalInfoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={selectedUser}
        onSave={handleSavePersonalInfo}
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
