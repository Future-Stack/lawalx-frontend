"use client";

import React from "react";

export interface TabItem<T extends string> {
  label: T;
  icon: React.ComponentType<React.ComponentPropsWithoutRef<"svg">>;
  onClick?: () => void;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  setActiveTab: (tab: T) => void;
}

const Tabs = <T extends string>({
  tabs,
  activeTab,
  setActiveTab,
}: TabsProps<T>) => {
  return (
    <div className="bg-navbarBg rounded-full border border-border p-1.5 inline-flex gap-2 overflow-x-auto max-w-full md:scrollbar-hide thin-gray-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.label;

        return (
          <button
            key={tab.label}
            onClick={() => {
              setActiveTab(tab.label);
              tab.onClick?.();
            }}
            className={`px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center gap-2 ${
              isActive
                ? "text-bgBlue dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800 shadow-customShadow bg-white dark:bg-gray-800"
                : "text-textGray dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
