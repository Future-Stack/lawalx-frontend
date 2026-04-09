// create folder type definition
export type CreateFolderPayload = {
  name: string;
  parentId?: string;
};
// Upload payload will be sent as FormData (files + optional folderId/programId)
export type UploadFilePayload = FormData | { formData: FormData; folderId?: string; programId?: string };

// all content get route type definition
export type ContentType = "FOLDER" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";

export interface ContentItem {
  id: string;
  name: string;
  isFolder: boolean;

  filename: string | null;
  url: string | null;
  filePath: string | null;
  fileType: string | null;
  size: number | null;

  type: ContentType;
  duration: number | null;

  parentId: string | null;
  userId: string;

  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyContentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ContentItem[];
}

// get all content 
export type FileType = "IMAGE" | "VIDEO" | "AUDIO";

export interface FileItem {
  id: string;
  url: string;
  filePath: string;
  fileType: string;
  originalName: string;
  size: number;
  type: FileType;
  duration: number;
  userId: string;
  folderId: string | null;
  programId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  files: FileItem[];
}

export interface GetAllDataResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    folders: Folder[];
    rootFiles: FileItem[];
  };
}

// single folder get data type 

export interface FileItemSingle {
  id: string;
  url: string;
  filePath: string;
  fileType: string; // image/jpeg | video/mp4 | audio/mpeg
  originalName: string;
  size: number;
  type: FileType;
  duration: number;
  userId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetSingleFolderFilesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: FileItemSingle[];
}

export interface GetSingleFilesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: FileItemSingle;
}

// get all files 

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export type GetFilesResponse = ApiResponse<FileItem[]>;



// All success response 
export interface SuccessResponse {
  success: boolean;
  message: string;
}