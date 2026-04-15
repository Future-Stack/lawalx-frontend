"use client";

import React, { useState } from "react";
import { plans } from "../_data";
import { Monitor, Database, UploadCloud, Layout, Edit, Crown, Search } from "lucide-react";
import CreatePlanDialog from "./CreatePlanDialog";

const PlansTab = () => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [yearlyDiscount, setYearlyDiscount] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState("30");
    const [allPlansActive, setAllPlansActive] = useState(true);

    const handleEditClick = (plan: any) => {
        setSelectedPlan(plan);
        setEditModalOpen(true);
    };

    return (
        <div className="bg-navbarBg rounded-xl border border-border">
            {/* Header / Actions - Redesigned to match image */}
            <div className="flex justify-between items-center p-6 border-b border-border">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Plans</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Your plan has been upgraded successfully. New features are now available.
                    </p>
                </div>
                <button
                    onClick={() => setAllPlansActive(!allPlansActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${allPlansActive ? "bg-[#3B82F6]" : "bg-gray-200 dark:bg-gray-700"}`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${allPlansActive ? "translate-x-5" : "translate-x-0"}`}
                    />
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 md:p-6 border-t border-border">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-navbarBg rounded-2xl border border-borderGray p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-headings mb-1">{plan.name}</h3>
                            <p className="text-sm text-muted line-clamp-2">{plan.description}</p>
                        </div>

                        <div className="flex items-baseline justify-between mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-headings">{plan.price}</span>
                                <span className="text-sm text-muted">/month</span>
                            </div>
                            <div className="text-headings font-semibold text-sm">
                                {plan.users} <span className="text-muted font-normal ml-1">Users</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-grow">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-muted" />
                                    <div>
                                        <div className="text-[10px] text-muted uppercase font-bold">Devices</div>
                                        <div className="text-sm font-semibold text-headings">{plan.devices}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-muted" />
                                    <div>
                                        <div className="text-[10px] text-muted uppercase font-bold">Storage</div>
                                        <div className="text-sm font-semibold text-headings">{plan.storage}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UploadCloud className="w-4 h-4 text-muted" />
                                    <div>
                                        <div className="text-[10px] text-muted uppercase font-bold">Upload Limits</div>
                                        <div className="text-sm font-semibold text-headings">{plan.uploadLimits}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-muted" />
                                    <div>
                                        <div className="text-[10px] text-muted uppercase font-bold">Templates</div>
                                        <div className="text-sm font-semibold text-headings">{plan.templates}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleEditClick(plan)}
                            className="w-full py-2.5 border border-border rounded-lg font-medium text-headings flex items-center justify-center gap-2 transition-colors shadow-customShadow cursor-pointer hover:text-bgBlue"
                        >
                            <Edit className="w-4 h-4" /> Edit
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Yearly Discount Section */}
                <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-orange-900 dark:text-orange-200 font-bold">Yearly Discount</h3>
                        <button
                            onClick={() => setYearlyDiscount(!yearlyDiscount)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${yearlyDiscount ? "bg-bgBlue" : "bg-gray-300"}`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${yearlyDiscount ? "translate-x-5" : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                    <p className="text-sm text-orange-800/70 dark:text-orange-300/60 mb-6">Offer a discount for yearly billing.</p>

                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-bold text-headings">Discount Percentage %</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={discountPercentage}
                                    onChange={(e) => setDiscountPercentage(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-900 border border-borderGray dark:border-gray-700 rounded-lg py-3 px-4 focus:outline-none text-headings"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-muted pointer-events-none">
                                    <span className="leading-none cursor-pointer text-[8px]">▲</span>
                                    <span className="leading-none cursor-pointer text-[8px]">▼</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="h-[46px] flex items-center gap-2 px-6 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out"
                        >
                            Create New Plan
                        </button>
                    </div>
                </div>

                {/* Pagination Placeholder (As requested "use pagination") */}
                {/* <div className="flex items-center justify-between p-4 md:p-6 bg-navbarBg rounded-xl border border-border">
                    <div className="text-sm text-muted">Showing {plans.length} of {plans.length} plans</div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out" disabled>Previous</button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out">Next</button>
                    </div>
                </div> */}
            </div>

            <CreatePlanDialog
                open={createModalOpen}
                setOpen={setCreateModalOpen}
            />

            <CreatePlanDialog
                open={editModalOpen}
                setOpen={setEditModalOpen}
                editMode={true}
                initialData={selectedPlan}
            />
        </div>
    );
};

export default PlansTab;
