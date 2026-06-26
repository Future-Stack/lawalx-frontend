import React from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Edit, LogIn, UserCheck, UserX, Trash2 } from "lucide-react";

interface UserMobileListProps {
  users: any[];
  isLoading: boolean;
  selectedUsers: Set<string>;
  toggleSelectUser: (id: string) => void;
  openActionMenu: string | null;
  setOpenActionMenu: (id: string | null) => void;
  onEditUser: (user: any) => void;
  onImpersonateUser: (userId: string) => void;
  onUnsuspendUser: (userId: string) => void;
  onSuspendUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export const UserMobileList: React.FC<UserMobileListProps> = ({
  users,
  isLoading,
  selectedUsers,
  toggleSelectUser,
  openActionMenu,
  setOpenActionMenu,
  onEditUser,
  onImpersonateUser,
  onUnsuspendUser,
  onSuspendUser,
  onDeleteUser,
}) => {
  const router = useRouter();

  const handleCardClick = (user: any) => {
    const plan = user.plan || "No Plan";
    const deviceStr: string = user.device || "0/0";
    const storageStr: string = user.storage || "0GB/0GB";

    const [, deviceLimit] = deviceStr.split("/").map((v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0);
    const [, storageTotal] = storageStr.split("/").map((v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0);

    const deviceUsage = deviceLimit > 0 ? Math.min(100, Math.round((Number(deviceStr.split("/")[0].replace(/[^0-9.]/g, "")) / deviceLimit) * 100)) : 0;
    const storageUsage = storageTotal > 0 ? Math.min(100, Math.round((Number(storageStr.split("/")[0].replace(/[^0-9.]/g, "")) / storageTotal) * 100)) : 0;

    const q = new URLSearchParams({
      name: user.full_name || user.username,
      email: user.account?.email || "",
      plan,
      status: user.status,
      device: String(deviceLimit),
      storage: String(storageTotal),
      deviceUsage: String(deviceUsage),
      storageUsage: String(storageUsage),
      phone: user.phoneNumber || "",
      location: user.location || "",
      joinDate: user.account?.created_at || "",
    }).toString();
    router.push(`/admin/user-management/${user.id}?${q}`);
  };

  return (
    <div className="lg:hidden p-4 space-y-4">
      {isLoading ? (
        <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400 bg-navbarBg rounded-lg border border-border">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400 bg-navbarBg rounded-lg border border-border">
          No users found
        </div>
      ) : users.map((user: any, index: number) => {
        const isLastRows = index >= users.length - 2;

        const plan = user.plan || "No Plan";
        const deviceStr: string = user.device || "0/0";
        const storageStr: string = user.storage || "0GB/0GB";

        const [deviceUsed, deviceLimit] = deviceStr.split("/").map((v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0);
        const [storageUsed, storageTotal] = storageStr.split("/").map((v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0);

        const deviceUsage = deviceLimit > 0 ? Math.min(100, Math.round((deviceUsed / deviceLimit) * 100)) : 0;
        const storageUsage = storageTotal > 0 ? Math.min(100, Math.round((storageUsed / storageTotal) * 100)) : 0;
        const statusStr = user.status.charAt(0) + user.status.slice(1).toLowerCase();

        return (
          <div
            key={user.id}
            onClick={() => handleCardClick(user)}
            className="bg-navbarBg rounded-xl border border-border p-4 space-y-4 cursor-pointer hover:shadow-md transition-all"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 items-start flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelectUser(user.id)}
                  className="rounded border-gray-300 dark:border-gray-600 mt-1 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white truncate">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.account?.email || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-bold border ${user.status === "ACTIVE"
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    : user.status === "SUSPENDED"
                      ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    }`}
                >
                  {statusStr}
                </span>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenActionMenu(
                        openActionMenu === user.id ? null : user.id
                      );
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-border"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  {openActionMenu === user.id && (
                    <>
                      <div
                        className="fixed inset-0 z-[60]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenu(null);
                        }}
                      />
                      <div
                        className={`absolute right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[70] ${isLastRows ? "bottom-full mb-2" : "mt-2"}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(user);
                          }}
                          className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors border-b border-border/50"
                        >
                          <Eye className="w-4 h-4" />
                          View Profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditUser(user);
                            setOpenActionMenu(null);
                          }}
                          className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors border-b border-border/50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit User
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onImpersonateUser(user.id);
                            setOpenActionMenu(null);
                          }}
                          className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors border-b border-border/50"
                        >
                          <LogIn className="w-4 h-4" />
                          Impersonate User
                        </button>
                        {user.status === "SUSPENDED" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnsuspendUser(user.id);
                              setOpenActionMenu(null);
                            }}
                            className="w-full cursor-pointer px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors border-b border-border/50"
                          >
                            <UserCheck className="w-4 h-4" />
                            Unsuspend User
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSuspendUser(user);
                              setOpenActionMenu(null);
                            }}
                            className="w-full cursor-pointer px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors border-b border-border/50"
                          >
                            <UserX className="w-4 h-4" />
                            Suspend User
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteUser(user);
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
              </div>
            </div>

            {/* Info Rows */}
            <div className="flex items-center justify-between text-xs py-2 border-y border-border/50">
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-medium">Current Plan:</span>
                {(() => {
                  const p = plan.toLowerCase();
                  const cls = p.includes("premium") ? "text-purple-600 dark:text-purple-400"
                    : p.includes("enterprise") ? "text-indigo-600 dark:text-indigo-400"
                    : p.includes("business") ? "text-orange-600 dark:text-orange-400"
                    : p.includes("basic") ? "text-teal-600 dark:text-teal-400"
                    : p.includes("free") || p.includes("trial") ? "text-gray-500 dark:text-gray-400"
                    : "text-blue-600 dark:text-blue-400";
                  return <span className={`ml-2 font-bold ${cls}`}>{plan}</span>;
                })()}
              </div>
              {user.issues && user.issues.length > 0 && user.issues[0] !== "No issues" && (
                <div className="flex gap-1">
                  {user.issues.slice(0, 1).map((issue: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-[10px] font-bold border border-orange-100">
                      {issue}
                    </span>
                  ))}
                  {user.issues.length > 1 && <span className="text-[10px] text-muted">+{user.issues.length - 1} more</span>}
                </div>
              )}
            </div>

            {/* Usage Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight text-gray-500">
                  <span>Device Used</span>
                  <span>{deviceStr}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-border/30">
                  <div className={`h-full transition-all duration-500 ${deviceUsage >= 80 ? "bg-red-500" : deviceUsage >= 50 ? "bg-orange-500" : "bg-blue-500"}`} style={{ width: `${deviceUsage}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight text-gray-500">
                  <span>Storage Used</span>
                  <span>{storageStr}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-border/30">
                  <div className={`h-full transition-all duration-500 ${storageUsage >= 80 ? "bg-red-500" : storageUsage >= 50 ? "bg-orange-500" : "bg-blue-500"}`} style={{ width: `${storageUsage}%` }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserMobileList;
