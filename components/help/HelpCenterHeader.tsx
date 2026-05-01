"use client";

import React from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';

interface HelpCenterHeaderProps {
  title: string;
  description: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch?: () => void;
}

const HelpCenterHeader: React.FC<HelpCenterHeaderProps> = ({
  title,
  description,
  searchQuery,
  setSearchQuery,
  onSearch,
}) => {
  return (
    <div className="relative w-full help-header-bg overflow-hidden mb-8">
      <div className="px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 pt-8 lg:pt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-gray-600 mb-8 max-w-lg">
              {description}
            </p>

            <div className="flex w-full gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={onSearch}
                className="px-6 py-3 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-customShadow"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Content - Image Placeholder */}
          <div className="w-full lg:w-1/2 hidden lg:flex justify-center lg:justify-end relative">
             <div className="md:mr-2 lg:mr-4 xl:mr-10 md:block hidden">
                       <Image
                         src="/userDashboard/img3.webp"
                         alt="Dashboard Header"
                         height={250}
                         width={250}
                         style={{ transform: "scale(1.05)" }}
                       />
                     </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpCenterHeader;
