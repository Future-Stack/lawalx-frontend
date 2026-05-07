import { ListTree, Settings } from "lucide-react";

interface ProgramTabsProps {
  activeTab: "timeline" | "settings";
  setActiveTab: (tab: "timeline" | "settings") => void;
}

const ProgramTabs = ({ activeTab, setActiveTab }: ProgramTabsProps) => {
  return (
    <div className="bg-navbarBg rounded-full border border-border p-1 mb-6 inline-flex overflow-x-auto w-fit">
      {(["timeline", "settings"] as const).map((tab) => {
        const isActiveTab = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm sm:text-base rounded-full gap-2 font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${isActiveTab
              ? "bg-blue-50 dark:bg-blue-900/20 shadow-customShadow"
              : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            <span
              className={`flex items-center gap-2 ${isActiveTab ? "text-bgBlue" : "text-muted hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              {tab === "timeline" && <ListTree className="w-4 h-4" />}
              {tab === "settings" && <Settings className="w-4 h-4" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ProgramTabs;
