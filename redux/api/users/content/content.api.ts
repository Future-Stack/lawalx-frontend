/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../baseApi";
import { CreateFolderPayload, GetAllDataResponse, GetFilesResponse, GetSingleFilesResponse, GetSingleFolderFilesResponse, MyContentResponse, SuccessResponse, UploadFilePayload } from "./content.type";

const contentAPI = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createFolder: build.mutation<any, CreateFolderPayload>({
      query: (data) => ({
        url: "/content/create-folder",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Content"],
    }),
    uploadFile: build.mutation<any, UploadFilePayload>({
      query: (arg) => {
        const isObject = !(arg instanceof FormData);
        const body = isObject ? (arg as any).formData : arg;
        const folderId = isObject ? (arg as any).folderId : undefined;
        return {
          url: `/content/upload-file${folderId ? `?folderId=${folderId}` : ""}`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Content"],
    }),
    getAllContentData: build.query<GetAllDataResponse, void>({
      query: () => ({
        url: "/content/all",
        method: "GET",
      }),
      providesTags: ["Content"],
    }),
    getAllFiles: build.query<GetFilesResponse, void>({
      query: () => ({
        url: "/content/files",
        method: "GET",
      }),
      providesTags: ["Content"],
    }),
    getSingleContentFolderData: build.query<GetSingleFolderFilesResponse, string>({
      query: (id) => ({
        url: `/content/folder/${id}/files`,
        method: "GET",
      }),
      providesTags: ["Content"],
    }),
    getSingleFilesData: build.query<GetSingleFilesResponse, string>({
      query: (id) => ({
        url: `/content/file/${id}`,
        method: "GET",
      }),
      providesTags: ["Content"],
    }),
    getSingleFileDetails: build.query<MyContentResponse, string>({
      query: (id) => ({
        url: `/file/detail/${id}`,
        method: "GET",
      }),
      providesTags: ["Content"],
    }),
    updateFileName: build.mutation<any, { name: string; id: string }>({
      query: ({ id, name }) => ({
        url: `/content/content/${id}/rename`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: ["Content"],
    }),
    updateFolderName: build.mutation<any, { name: string; id: string }>({
      query: ({ id, name }) => ({
        url: `/content/update-folder-name/${id}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: ["Content"],
    }),
    assignProgram: build.mutation<any, { id: string; programId: string }>({
      query: ({ id, programId }) => ({
        url: `/content/${id}/assign-program`,
        method: "PATCH",
        body: { programId },
      }),
      invalidatesTags: ["Content"],
    }),
    moveToFolder: build.mutation<any, { id: string; targetFolderId: string }>({
      query: ({ id, targetFolderId }) => ({
        url: `/content/file/${id}/move`,
        method: "PATCH",
        body: { targetFolderId },
      }),
      invalidatesTags: ["Content"],
    }),
    deleteFile: build.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/content/delete-file/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Content"],
    }),
    deleteFolder: build.mutation<any, SuccessResponse>({
      query: (id) => ({
        url: `/content/delete-folder/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Content"],
    }),
  }),
});

export const { useCreateFolderMutation, useUploadFileMutation, useGetAllContentDataQuery, useGetAllFilesQuery, useGetSingleContentFolderDataQuery, useGetSingleFilesDataQuery, useGetSingleFileDetailsQuery, useUpdateFileNameMutation, useUpdateFolderNameMutation, useAssignProgramMutation, useDeleteFileMutation, useDeleteFolderMutation, useMoveToFolderMutation } = contentAPI;
