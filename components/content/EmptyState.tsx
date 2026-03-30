import { useState } from "react";
import { Folder, ListMusic, FileVideo, CloudUpload, FolderPlus, Video } from "lucide-react";
import ContentButton from "@/common/ContentButton";
import CreateFolderDialog from "./CreateFolderDialog";

interface EmptyStateProps {
  contentFilter: string;
  searchQuery: string;
  onUploadClick?: () => void;
}

const EmptyState = ({ contentFilter, searchQuery, onUploadClick }: EmptyStateProps) => {
  const [openFolderDialog, setOpenFolderDialog] = useState(false);



  const handleButtonClick = () => {
    if (contentFilter === "folders") {
      setOpenFolderDialog(true);
    } else {
      onUploadClick?.();
    }
  };

  const getEmptyStateContent = () => {
    switch (contentFilter) {
      case "folders":
        return {
          icon: Folder,
          title: "No Folders yet",
          description: searchQuery
            ? "Try adjusting your search criteria"
            : "Create your first folder to get started",
          buttonIcon: FolderPlus,
          buttonTitle: "Create Folder",
        };
      case "playlists":
        return {
          icon: ListMusic,
          title: "No Playlists yet",
          description: searchQuery
            ? "Try adjusting your search criteria"
            : "Create your first playlist to get started",
          buttonIcon: ListMusic,
          buttonTitle: "Create Playlist",
        };
      case "files":
        return {
          icon: Video,
          title: "No Files yet",
          description: searchQuery
            ? "Try adjusting your search criteria"
            : "Upload your first file to get started",
          buttonIcon: FileVideo,
          buttonTitle: "Upload Files",
        };
      default:
        return {
          icon: FileVideo,
          title: "No Files yet",
          description: searchQuery
            ? "Try adjusting your search or filter criteria"
            : "Upload your first video to get started",
          buttonIcon: CloudUpload,
          buttonTitle: "Upload Content",
        };
    }
  };

  const { icon: Icon, title, description, buttonIcon, buttonTitle } =
    getEmptyStateContent();

  return (
    <div className="bg-navbarBg border border-border rounded-xl p-16 flex justify-center">
      <div className="flex flex-col items-center justify-center text-center max-w-md w-full">
        <Icon className="w-20 h-20 text-gray-900 dark:text-gray-300 stroke-[1.5] mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          {description}
        </p>

        <ContentButton
          icon={buttonIcon}
          title={buttonTitle}
          onClick={handleButtonClick}
        />
      </div>

      {openFolderDialog && (
        <CreateFolderDialog open={openFolderDialog} setOpen={setOpenFolderDialog} />
      )}
    </div>
  );
};

export default EmptyState;



// import React from "react";
// import { Folder, ListMusic, FileVideo, CloudUpload } from "lucide-react";
// import ContentButton from "@/common/ContentButton";

// interface EmptyStateProps {
//   contentFilter: string;
//   searchQuery: string;
// }

// const EmptyState = ({ contentFilter, searchQuery }: EmptyStateProps) => {
//   const getEmptyStateContent = () => {
//     switch (contentFilter) {
//       case "folders":
//         return {
//           icon: Folder,
//           title: "No Folders yet",
//           description: searchQuery 
//             ? "Try adjusting your search criteria" 
//             : "Create your first folder to get started"
//         };
//       case "playlists":
//         return {
//           icon: ListMusic,
//           title: "No Playlists yet",
//           description: searchQuery 
//             ? "Try adjusting your search criteria" 
//             : "Create your first playlist to get started"
//         };
//       case "files":
//         return {
//           icon: FileVideo,
//           title: "No Videos yet",
//           description: searchQuery 
//             ? "Try adjusting your search criteria" 
//             : "Upload your first video to get started"
//         };
//       default:
//         return {
//           icon: FileVideo,
//           title: "No Files yet",
//           description: searchQuery 
//             ? "Try adjusting your search or filter criteria" 
//             : "Upload your first video to get started"
//         };
//     }
//   };

//   const { icon: Icon, title, description } = getEmptyStateContent();

//   return (
//     <div className="bg-white border border-gray-300 rounded-xl p-16 flex justify-center">
//       <div className="flex flex-col items-center justify-center text-center max-w-md w-full">
//         <Icon className="w-20 h-20 text-gray-900 stroke-[1.5] mb-6" />
//         <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
//         <p className="text-gray-500 text-sm mb-8">{description}</p>
//         <ContentButton icon={CloudUpload} title="Upload Content" />
//       </div>
//     </div>
//   );
// };

// export default EmptyState;