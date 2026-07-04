import React from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Edit, LogIn, UserCheck, UserX, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserTableProps {
  users: any[];
  isLoading: boolean;
  selectedUsers: Set<string>;
  toggleSelectAll: () => void;
  toggleSelectUser: (id: string) => void;
  openActionMenu: string | null;
  setOpenActionMenu: (id: string | null) => void;
  onEditUser: (user: any) => void;
  onImpersonateUser: (userId: string) => void;
  onUnsuspendUser: (userId: string) => void;
  onSuspendUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  selectedUsers,
  toggleSelectAll,
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

  const handleRowClick = (user: any) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) return;

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
    <div className="overflow-x-auto thin-gray-scrollbar hidden lg:block">
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
          {isLoading ? (
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
            const isFirstRows = index < 3;
            const isLastRows = index >= users.length - 3;

            const plan = user.plan || "No Plan";
            const deviceStr: string = user.device || "0/0";
            const storageStr: string = user.storage || "0GB/0GB";

            const [deviceUsed, deviceLimit] = deviceStr.split("/").map((v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0);
            const [storageUsed, storageTotal] = storageStr.split("/").map((v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0);

            const deviceUsage = deviceLimit > 0 ? Math.min(100, Math.round((deviceUsed / deviceLimit) * 100)) : 0;
            const storageUsage = storageTotal > 0 ? Math.min(100, Math.round((storageUsed / storageTotal) * 100)) : 0;
            const statusStr = user.status.charAt(0) + user.status.slice(1).toLowerCase();

            return (
              <tr
                key={user.id}
                onClick={() => handleRowClick(user)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <td className="px-4 py-3 text-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelectUser(user.id)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-4 py-3 text-nowrap">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.full_name || user.username}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.account?.email || "N/A"}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-nowrap">
                  {(() => {
                    const p = plan.toLowerCase();
                    const cls = p.includes("premium") ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : p.includes("enterprise") ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                      : p.includes("business") ? "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                      : p.includes("basic") ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                      : p.includes("free") || p.includes("trial") ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
                    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{plan}</span>;
                  })()}
                </td>
                <td className="px-4 py-3 text-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white mb-1">{deviceStr}</div>
                  <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${deviceUsage >= 80 ? "bg-red-500" : deviceUsage >= 50 ? "bg-orange-500" : "bg-blue-500"}`} style={{ width: `${deviceUsage}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white mb-1">{storageStr}</div>
                  <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${storageUsage >= 80 ? "bg-red-500" : storageUsage >= 50 ? "bg-orange-500" : "bg-blue-500"}`} style={{ width: `${storageUsage}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-nowrap">
                  <span
                    className={`flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-medium border ${user.status === "ACTIVE"
                      ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                      : user.status === "SUSPENDED"
                        ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                  >
                    {/* <span
                      className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE"
                        ? "bg-green-500"
                        : user.status === "SUSPENDED"
                          ? "bg-red-500"
                          : "bg-gray-500"
                        }`}
                    /> */}
                    {statusStr}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.issues && user.issues.length > 0 && user.issues[0] !== "No issues" ? (
                    <div className="flex flex-wrap gap-1.5">
                      {user.issues.map((issue: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs whitespace-nowrap"
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
                <td className="px-4 py-3 text-nowrap">
                  <DropdownMenu
                    open={openActionMenu === user.id}
                    onOpenChange={(open) => setOpenActionMenu(open ? user.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(user);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditUser(user);
                          setOpenActionMenu(null);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onImpersonateUser(user.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <LogIn className="w-4 h-4" />
                        Impersonate User
                      </DropdownMenuItem>

                      {user.status === "SUSPENDED" ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnsuspendUser(user.id);
                            setOpenActionMenu(null);
                          }}
                          className="text-green-600 dark:text-green-400 focus:text-white dark:focus:text-white"
                        >
                          <UserCheck className="w-4 h-4" />
                          Unsuspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onSuspendUser(user);
                            setOpenActionMenu(null);
                          }}
                          className="text-orange-600 dark:text-orange-400 focus:text-white dark:focus:text-white"
                        >
                          <UserX className="w-4 h-4" />
                          Suspend User
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteUser(user);
                          setOpenActionMenu(null);
                        }}
                        className="text-red-600 dark:text-red-400 focus:text-white dark:focus:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
