"use client";

import React from "react";

interface SubscriptionTabLayoutProps {
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  pagination?: React.ReactNode;
  showDivider?: boolean;
}

const SubscriptionTabLayout = ({
  title,
  subtitle,
  actionButton,
  filters,
  children,
  pagination,
  showDivider = true,
}: SubscriptionTabLayoutProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 border border-borderGray p-5 rounded-[24px]">
      {/* Header Section */}
      {(title || actionButton) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-3 px-1">
          <div>
            {title && <h2 className="text-[20px] font-bold text-headings">{title}</h2>}
            {subtitle && <p className="text-muted text-[14px] mt-1">{subtitle}</p>}
          </div>
          {actionButton}
        </div>
      )}

      {showDivider && (title || actionButton) && (
        <hr className="border-borderGray w-[calc(100%+2.5rem)] -mx-5 mb-4" />
      )}

      {/* Main Content Container */}
      <div className="rounded-[24px] border border-borderGray bg-navbarBg overflow-hidden p-6">
        {/* Filters Section */}
        {filters && <div className="mb-8">{filters}</div>}

        {/* Content (Table, etc.) */}
        <div className="overflow-x-auto">
          {children}
        </div>

        {/* Pagination Section */}
        {pagination && (
          <div className="mt-6 pt-6 border-t border-border">
            {pagination}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionTabLayout;
