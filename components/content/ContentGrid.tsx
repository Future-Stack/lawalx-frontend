import { ContentItem } from "@/types/content";
import MyContentCard from "./MyContentCard";

interface ContentGridProps {
  items: ContentItem[];
  viewMode: "grid" | "list";
  onItemSelect?: (id: string) => void;
  onItemMenuClick?: (id: string, action: string) => void;
  onAssignClick?: (id: string) => void;
}

const ContentGrid = ({ items, viewMode, onItemSelect, onItemMenuClick, onAssignClick }: ContentGridProps) => {
  // LIST VIEW
  if (viewMode === "list") {
    return (
      <div className="w-full">
        {items.map((item) => (
          <MyContentCard
            key={item.id}
            item={item}
            viewMode="list"
            onSelect={onItemSelect}
            onMenuClick={onItemMenuClick}
            onAssignClick={onAssignClick}
          />
        ))}
      </div>
    );
  }

  // GRID VIEW
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <MyContentCard
          key={item.id}
          item={item}
          viewMode="grid"
          onSelect={onItemSelect}
          onMenuClick={onItemMenuClick}
          onAssignClick={onAssignClick}
        />
      ))}
    </div>
  );
};

export default ContentGrid;