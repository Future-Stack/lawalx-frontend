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
}: SubscriptionTabLayoutProps) => {
  const hasTopSection = Boolean(title || subtitle || actionButton || filters);

  return (
    <div className="bg-navbarBg rounded-xl border border-border overflow-hidden animate-in fade-in duration-500">
      {hasTopSection && (
        <div className="p-6 border-b border-border">
          {(title || actionButton || subtitle) && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              {actionButton}
            </div>
          )}

          {filters && (
            <div className={title || actionButton || subtitle ? "mt-4" : ""}>
              {filters}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto scrollbar-hide px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
        {children}
      </div>

      {pagination && (
        <div className="p-4 border-t border-border bg-navbarBg rounded-b-xl">
          {pagination}
        </div>
      )}
    </div>
  );
};

export default SubscriptionTabLayout;
