"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  HelpCircle,
  Moon,
  Sun,
  User,
  Menu,
  X,
  ScreenShareIcon,
  FilePlus,
  CalendarPlus,
  FolderPlus,
  VideoIcon,
  UserRoundCogIcon,
  LogOutIcon,
  HelpCircleIcon,
  SettingsIcon,
  Monitor,
  Headphones,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useAppDispatch } from "@/redux/store/hook";
import { useGetUserProfileQuery } from "@/redux/api/users/userProfileApi";
import { logout } from "@/redux/features/auth/authSlice";
import { useGetMyNotificationsQuery, useReadAllNotificationsMutation, useReadNotificationMutation } from "@/redux/api/users/notificationApi";
import { formatDistanceToNow } from "date-fns";
import CommonLoader from "@/common/CommonLoader";
import NavbarNewDropdown from "./NavbarNewDropdown";
import { useNavbarActions } from "@/hooks/useNavbarActions";
import AddDeviceModal from "@/components/dashboard/AddDeviceModal";
import CreateScreenModal from "@/components/dashboard/CreateScreenModal";
import UploadFileModal from "@/components/content/UploadFileModal";
import CreateFolderDialog from "@/components/content/CreateFolderDialog";
import CreateScheduleDialog from "@/app/(User)/(user_content)/schedules/_components/CreateScheduleDialog";
import LogoutConfirmModal from "@/components/common/LogoutConfirmModal";


const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/devices", label: "Devices" },
  { href: "/content", label: "Content" },
  { href: "/programs", label: "Programs" },
  { href: "/schedules", label: "Schedules" },
];

export default function UserDashboardNavbar() {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const {
    isAddDeviceOpen,
    setIsAddDeviceOpen,
    isCreateFolderOpen,
    setIsCreateFolderOpen,
    isCreateScheduleOpen,
    setIsCreateScheduleOpen,
    isCreateProgramOpen,
    setIsCreateProgramOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isPageLoading,
    setIsPageLoading,
    onboardingStep,
    startOnboarding,
    completeStep,
    handleUploadClick,
  } = useNavbarActions();

  // Dark Mode Setup
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Check for new user onboarding
    const isNewUser = localStorage.getItem("is_new_user");
    if (isNewUser === "true" && !onboardingStep) {
      startOnboarding();
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
  };

  // User Profile
  const { data: userProfile } = useGetUserProfileQuery();
  const userInfo = userProfile?.data;

  const isActive = (href: string) => pathname?.startsWith(href);

  // Notification Hooks
  const { data: notificationData } = useGetMyNotificationsQuery();
  const [readAllNotifications] = useReadAllNotificationsMutation();
  const [readNotification] = useReadNotificationMutation();

  const allNotifications = notificationData?.data || [];

  // Sort: Unread first, then by date (assuming API returns recent first or we sort by createdAt)
  const sortedNotifications = [...allNotifications].sort((a: any, b: any) => {
    if (a.isRead === b.isRead) {
      return new Date(b.notification.createdAt).getTime() - new Date(a.notification.createdAt).getTime();
    }
    return a.isRead ? 1 : -1;
  });

  const unreadCount = allNotifications.filter((n: any) => !n.isRead).length;

  // Icons Helper
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "USER": return User;
      case "DEVICE": return Monitor;
      case "SYSTEM": return SettingsIcon;
      default: return Bell;
    }
  };

  const handleReadAll = async () => {
    try {
      await readAllNotifications().unwrap();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await readNotification(id).unwrap();
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };

  return (
    <header className="bg-navbarBg border-b border-border sticky top-0 z-50 transition-colors">
      <div className="px-5 sm:px-8 py-2 sm:py-4 flex items-center justify-between ">
        {/* Left section - Logo & Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-8 flex-1">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center shrink-0">
            <Image
              src="/tape.png"
              alt="DigitalSignage Logo"
              width={120}
              height={60}
              className="h-18 w-auto"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-3 xl:px-3 ml-2 py-2 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap group
                  ${isActive(item.href)
                    ? "text-bgBlue dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 w-fit rounded"
                    : "text-navGray dark:text-gray-400 hover:text-bgBlue dark:hover:text-blue-400"
                  }
                `}
              >
                {item.label}
                <span
                  className={`
                    absolute left-0 bottom-0 h-0.5 bg-bgBlue dark:bg-blue-400 transition-all duration-300 ease-in-out
                    ${isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"}
                  `}
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 xl:gap-2">
          {/* Desktop Actions (Help, New) - Hidden on mobile */}
          <div className="hidden xl:flex items-center gap-1 xl:gap-2">
            {/* Help Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  setProfileOpen(false);
                  setNotificationOpen(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden lg:inline">
                  Help
                </span>
              </button>
              {helpOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setHelpOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden z-40 p-2">
                    <Link href="/faqs" onClick={() => setHelpOpen(false)}>
                      <button className="flex items-center w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 rounded border-b border-gray-200 dark:border-gray-700 cursor-pointer">
                        <HelpCircle className="w-4 h-4" />
                        <span className="ml-2">FAQs</span>
                      </button>
                    </Link>
                    <Link href="/video_tutorials" onClick={() => setHelpOpen(false)}>
                      <button className="flex items-center w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 rounded border-b border-gray-200 dark:border-gray-700 cursor-pointer">
                        <VideoIcon className="w-4 h-4" />
                        <span className="ml-2">Video Tutorials</span>
                      </button>
                    </Link>
                    <Link href="/support" onClick={() => setHelpOpen(false)}>
                      <button className="flex items-center w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 rounded border-b border-gray-200 dark:border-gray-700 cursor-pointer">
                        <Headphones className="w-4 h-4" />
                        <span className="ml-2">Support</span>
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* New Button */}
            <NavbarNewDropdown
              onAddDevice={() => setIsAddDeviceOpen(true)}
              onUploadContent={handleUploadClick}
              onSchedule={() => setIsCreateScheduleOpen(true)}
              onNewFolder={() => setIsCreateFolderOpen(true)}
              isUploading={isPageLoading}
            />
          </div>

          {/* Always Visible: Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setHelpOpen(false);
                setProfileOpen(false);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotificationOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden z-40">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    <button
                      onClick={handleReadAll}
                      className="text-sm text-bgBlue dark:text-blue-400 hover:text-blue-500 font-medium cursor-pointer"
                    >
                      Mark All Read
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-96">
                    {sortedNotifications.slice(0, 6).map((item: any) => {
                      const IconComponent = getNotificationIcon(item.notification.actorType || "SYSTEM");
                      return (
                        <div
                          key={item.notificationId}
                          onClick={() => handleNotificationClick(item.notificationId, item.isRead)}
                          className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${!item.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <IconComponent className="w-10 h-10 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full p-2" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-sm font-semibold mb-1 ${!item.isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>
                                {item.notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {item.notification.body}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {formatDistanceToNow(new Date(item.notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {!item.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-6 py-3 text-center border-t border-gray-200 dark:border-gray-700">
                    <Link href="/notifications">
                      <button className="text-sm text-bgBlue dark:text-blue-400 hover:text-blue-500 font-medium cursor-pointer">
                        View All
                      </button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Always Visible: Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 cursor-pointer group"
            aria-label="Toggle dark mode"
          >
            {!mounted ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500 rotate-0 scale-100 transition-all duration-500 group-hover:rotate-12" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 rotate-0 scale-100 transition-all duration-500 group-hover:-rotate-12" />
            )}
          </button>

          {/* Profile (Hidden on Mobile, moved to Mobile Menu) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setHelpOpen(false);
                setNotificationOpen(false);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full bg-gray-100 dark:bg-gray-800 transition-colors cursor-pointer"
            >
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden z-40">
                  <div className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                      {
                        userInfo?.image_url ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={userInfo.image_url}
                              alt={userInfo.full_name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">
                            {userInfo?.full_name?.substring(0, 2) || "JD"}
                          </div>
                        )
                      }
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {userInfo?.full_name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{userInfo?.username || "username"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        My Plans
                      </p>
                      <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Pro
                      </span>
                    </div>
                    <button className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Manage Plans
                    </button>
                  </div>

                  <div className="px-4">
                    <div className="border-t border-gray-200 dark:border-gray-700" />
                  </div>

                  <div className="py-1 space-y-1">
                    <div className="px-4">
                      <Link href="/profile-settings/general" className="flex items-center w-full text-left py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-2">
                        <UserRoundCogIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </div>
                    <div className="px-4">
                      <Link href="/profile-settings/general" className="flex items-center w-full text-left py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-2">
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </div>
                    <div className="px-4">
                      <Link href="/support" className="flex items-center w-full text-left py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-2">
                        <HelpCircleIcon className="w-4 h-4 mr-2" />
                        Support
                      </Link>
                    </div>
                  </div>

                  <div className="px-4">
                    <div className="border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="px-4 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 px-2 cursor-pointer"
                    >
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Visible on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Expanded */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-screen overflow-y-auto scrollbar-hide">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm rounded-md transition-colors ${isActive(item.href)
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Create New Section */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Create New</p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAddDeviceOpen(true);
                }}
                className="flex items-center w-full py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-bgBlue dark:hover:text-blue-400 cursor-pointer"
              >
                <ScreenShareIcon className="w-4 h-4 mr-3" /> Add Device
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleUploadClick();
                }}
                className="flex items-center w-full py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-bgBlue dark:hover:text-blue-400 cursor-pointer"
              >
                <FilePlus className="w-4 h-4 mr-3" /> Upload Content
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCreateScheduleOpen(true);
                }}
                className="flex items-center w-full py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-bgBlue dark:hover:text-blue-400 cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 mr-3" /> Schedule
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCreateFolderOpen(true);
                }}
                className="flex items-center w-full py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-bgBlue dark:hover:text-blue-400 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 mr-3" /> New Folder
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Help Section */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Help & Support</p>
              <Link href="/faqs" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-bgBlue dark:hover:text-blue-400">
                <HelpCircle className="w-4 h-4 mr-3" /> FAQs
              </Link>
              <Link href="/video_tutorials" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-bgBlue dark:hover:text-blue-400">
                <VideoIcon className="w-4 h-4 mr-3" /> Video Tutorials
              </Link>
              <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-bgBlue dark:hover:text-blue-400">
                <Headphones className="w-4 h-4 mr-3" /> Support
              </Link>
            </div>

          </nav>

          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-3">
            {/* Mobile Help/Support */}
            <div className="space-y-1">
              <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Support</p>
              <Link href="/faqs" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">FAQs</Link>
              <Link href="/video_tutorials" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">Video Tutorials</Link>
              <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">Help Center</Link>
            </div>

            {/* Mobile Quick Actions */}
            <div className="space-y-1">
              <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAddDeviceOpen(true);
                }}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex items-center gap-2 cursor-pointer"
              >
                <ScreenShareIcon className="w-4 h-4" /> Add Device
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleUploadClick();
                }}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex items-center gap-2 cursor-pointer"
              >
                <FilePlus className="w-4 h-4" /> Upload Content
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCreateScheduleOpen(true);
                }}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex items-center gap-2 cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" /> Schedule
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCreateFolderOpen(true);
                }}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" /> New Folder
              </button>
            </div>

            {/* Mobile Profile */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center px-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 mr-3 uppercase">
                  {userInfo?.full_name?.substring(0, 2) || "JD"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userInfo?.full_name || "User"}</p>
                  <p className="text-xs text-gray-500">@{userInfo?.username || "username"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <button onClick={() => setMobileMenuOpen(false)} className="w-full text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex items-center gap-2">
                  <UserRoundCogIcon className="w-4 h-4" /> Edit Profile
                </button>
                <button onClick={() => setMobileMenuOpen(false)} className="w-full text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" /> Settings
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center gap-2 cursor-pointer"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddDeviceModal
        isOpen={isAddDeviceOpen}
        onClose={() => {
          setIsAddDeviceOpen(false);
          completeStep("add-device");
        }}
      />
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          completeStep("upload");
        }}
        setIsPageLoading={setIsPageLoading}
      />
      <CreateScreenModal
        isOpen={isCreateProgramOpen}
        onClose={() => {
          setIsCreateProgramOpen(false);
          completeStep("program");
        }}
      />
      <CreateFolderDialog
        open={isCreateFolderOpen}
        setOpen={setIsCreateFolderOpen}
      />
      <CreateScheduleDialog
        open={isCreateScheduleOpen}
        setOpen={(open) => {
          setIsCreateScheduleOpen(open);
          if (!open) completeStep("schedule");
        }}
      />

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />

      {/* Full Page Loader Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-200 dark:border-gray-700">
            <CommonLoader size={56} text="Uploading files..." />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Please do not close this page</p>
          </div>
        </div>
      )}
    </header>

  );
}