/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import countryList from 'react-select-country-list'
import Image from "next/image";
import { Upload, User } from "lucide-react";
import BaseSelect from "@/common/BaseSelect";
import { toast } from "sonner";
import { useGetPreferencesQuery } from "@/redux/api/users/settings/preferencesApi";
import { useGetSettingsUserProfileQuery, useUpdateSettingsProfilePreferencesMutation, useUpdateSittingsProfileMutation } from "@/redux/api/users/settings/settingsApi";
import { getUrl } from "@/lib/content-utils";

export default function General() {
    const [mounted, setMounted] = useState(false);

    // Forms
    const { register, handleSubmit, setValue, watch, reset: resetProfile } = useForm({
        defaultValues: {
            full_name: "",
            designation: "",
            region: "",
            timeZone: ""
        }
    });

    const { handleSubmit: handleSubmitPref, setValue: setValuePref, watch: watchPref, reset: resetPref } = useForm({
        defaultValues: {
            theme: "LIGHT",
            language: "en",
            timeFormat: "H12",
            dateFormat: "DMY"
        }
    });

    const region = watch("region");
    const timeZone = watch("timeZone");
    const theme = watchPref("theme");
    const language = watchPref("language");
    const timeFormat = watchPref("timeFormat");
    const dateFormat = watchPref("dateFormat");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const countryOptions = useMemo(() => {
        const options = countryList().getData();
        if (region && !options.find(opt => opt.value === region)) {
            return [{ value: region, label: region }, ...options];
        }
        return options;
    }, [region]);

    // API hooks
    const { data: profileData, isLoading: profileLoading } = useGetSettingsUserProfileQuery(undefined);
    const { data: preferencesData, isLoading: preferencesLoading } = useGetPreferencesQuery();
    const [updateProfile, { isLoading: updatingProfile }] = useUpdateSittingsProfileMutation();
    const [updatePreferences, { isLoading: updatingPreferences }] = useUpdateSettingsProfilePreferencesMutation();  

    // Set mounted state
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize profile data
    useEffect(() => {
        if (profileData?.data) {
            const data = profileData.data;
            resetProfile({
                full_name: data.full_name || "",
                designation: data.designation || data.role || "",
                region: data.cityCountry || "",
                timeZone: data.timeZone || "UTC"
            });
            setPreviewUrl(getUrl(data.image_url) || "");

            // Also initialize preferences if available in profile data
            if (data.preferences) {
                resetPref({
                    theme: data.preferences.theme || "LIGHT",
                    language: data.preferences.language || "en",
                    timeFormat: data.preferences.timeFormat || "H12",
                    dateFormat: data.preferences.dateFormat || "DMY"
                });
            }
        }
    }, [profileData, resetProfile, resetPref]);

    // Initialize preferences data
    useEffect(() => {
        if (preferencesData?.data) {
            const data = preferencesData.data;
            resetPref({
                theme: data.theme || "LIGHT",
                language: data.language || "en",
                timeFormat: data.timeFormat || "H12",
                dateFormat: data.dateFormat || "DMY"
            });
        }
    }, [preferencesData, resetPref]);

    const onUpdateProfile = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append("full_name", data.full_name);
            if (selectedFile) {
                formData.append("image_url", selectedFile);
            }
            formData.append("designation", data.designation);
            formData.append("cityCountry", data.region);
            formData.append("timeZone", data.timeZone);

            const result = await updateProfile(formData).unwrap();

            if (result.success) {
                toast.success(result.message || "Profile updated successfully");
                setSelectedFile(null);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update profile");
        }
    };

    const onUpdatePreferences = async (data: any) => {
        try {
            // Remove notifications from payload
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { emailNotification, pushNotification, ...payload } = data;
            const result = await updatePreferences(payload).unwrap();

            if (result.success) {
                toast.success(result.message || "Preferences updated successfully");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update preferences");
        }
    };

    // Prevent hydration mismatch by showing loading state
    if (!mounted || profileLoading || preferencesLoading) {
        return (
            <div className="space-y-8 border border-border bg-navbarBg rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-body">Loading...</div>
                </div>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const userInfo = profileData?.data;

    return (
        <div className="space-y-8 border border-border bg-navbarBg rounded-xl p-4 md:p-6">
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-headings">Personal Information</h2>
                    <button
                        onClick={handleSubmit(onUpdateProfile)}
                        disabled={updatingProfile}
                        className="px-4 py-2 md:px-6 md:py-3 bg-bgBlue text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors shadow-customShadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updatingProfile ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Profile Photo</label>
                        <div className="flex items-center gap-6">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-border flex items-center justify-center">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <label className="flex-1 border border-border border-dashed bg-navbarBg rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-bgBlue transition-colors group">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className="w-8 h-8 mb-2 bg-navbarBg rounded-lg flex items-center justify-center border border-border group-hover:border-bgBlue transition-colors">
                                    <Upload className="w-4 h-4 text-gray-500 group-hover:text-bgBlue" />
                                </div>
                                <p className="text-sm">
                                    <span className="text-bgBlue font-medium">Click to Upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted mt-1">SVG, PNG, or JPG (Max 800 x 800px)</p>
                            </label>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Name</label>
                        <input
                            type="text"
                            placeholder="Full Name"
                            {...register("full_name")}
                            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-bgBlue bg-transparent dark:bg-gray-800 text-body font-medium"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={userInfo?.email || ""}
                            readOnly
                            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed text-gray-500 font-medium"
                        />
                    </div>

                    {/* Designation */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Designation</label>
                        <input
                            type="text"
                            placeholder={userInfo?.designation || ""}
                            {...register("designation")}
                            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-bgBlue bg-transparent dark:bg-gray-800 text-body font-medium"
                        />
                    </div>

                    {/* Region */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Region</label>
                        <div className="flex-1">
                            <BaseSelect
                                value={region}
                                onChange={(val) => setValue("region", val)}
                                options={countryOptions}
                                placeholder={userInfo?.cityCountry || "Select Region"}
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Time Zone */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Time Zone</label>
                        <div className="flex-1">
                            <BaseSelect
                                value={timeZone}
                                onChange={(val) => setValue("timeZone", val)}
                                options={[
                                    { value: "UTC", label: "Coordinated Universal Time (UTC)" },
                                    { value: "Pacific Standard Time (PST)", label: "Pacific Standard Time (PST) UTC-08:00" },
                                    { value: "Eastern Standard Time (EST)", label: "Eastern Standard Time (EST) UTC-05:00" }
                                ]}
                                placeholder="Select Time Zone"
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Preferences Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-headings">Preferences</h2>
                    <button
                        onClick={handleSubmitPref(onUpdatePreferences)}
                        disabled={updatingPreferences}
                        className="px-4 py-2 md:px-6 md:py-3 bg-bgBlue text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors shadow-customShadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updatingPreferences ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Theme */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Theme</label>
                        <div className="flex-1">
                            <BaseSelect
                                value={theme}
                                onChange={(val) => setValuePref("theme", val)}
                                options={[
                                    { value: "LIGHT", label: "Light" },
                                    { value: "DARK", label: "Dark" }
                                ]}
                                placeholder="Select Theme"
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Language */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Language</label>
                        <div className="flex-1">
                            <BaseSelect
                                value={language}
                                onChange={(val) => setValuePref("language", val)}
                                options={[
                                    { value: "en", label: "English" },
                                    { value: "es", label: "Spanish" },
                                    { value: "fr", label: "French" }
                                ]}
                                placeholder="Select Language"
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Time format */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Time format</label>
                        <div className="flex-1">
                            <BaseSelect
                                value={timeFormat}
                                onChange={(val) => setValuePref("timeFormat", val)}
                                options={[
                                    { value: "H12", label: "12 Hours (02:00 PM)" },
                                    { value: "H24", label: "24 Hours (14:00)" }
                                ]}
                                placeholder="Select Time Format"
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Date format */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Date format</label>
                        <div className="flex-1">
                            <BaseSelect
                                value={dateFormat}
                                onChange={(val) => setValuePref("dateFormat", val)}
                                options={[
                                    { value: "DMY", label: "DD/MM/YYYY (15/01/2025)" },
                                    { value: "MDY", label: "MM/DD/YYYY (01/15/2025)" },
                                    { value: "YMD", label: "YYYY/MM/DD (2025/01/15)" }
                                ]}
                                placeholder="Select Date Format"
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Email Notifications */}
                    {/* <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Email Notifications</label>
                        <div className="flex-1">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={emailNotification}
                                        onChange={(e) => setValuePref("emailNotification", e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-bgBlue after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </div>
                                <span className="text-sm text-body">Receive email notifications</span>
                            </label>
                        </div>
                    </div> */}

                    {/* Push Notifications */}
                     {/* <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6">
                        <label className="w-full md:w-1/3 text-sm font-semibold text-body">Push Notifications</label>
                        <div className="flex-1">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={pushNotification}
                                        onChange={(e) => setValuePref("pushNotification", e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-bgBlue after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </div>
                                <span className="text-sm text-body">Receive push notifications</span>
                            </label>
                        </div>
                    </div> */}
                </div>
            </section>
        </div>
    );
}