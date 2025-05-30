import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ContentItem } from "@/types/content";

interface ContentResponse {
  data: ContentItem[];
  total: number;
  page: number;
  limit: number;
}

interface Report {
  id: string;
  reason: string;
  description: string;
  createdAt: string;
  reportedBy: {
    id: string;
    name: string;
    picture: string;
  };
}

interface ReportsResponse {
  data: Report[];
  total: number;
}

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
  }),
  tagTypes: ["Content"],
  endpoints: (builder) => ({
    getContents: builder.query<ContentResponse, { page: number; limit: number; token?: string }>({
      query: ({ page, limit, token }) => ({
        url: `/reel/many?page=${page}&limit=${limit}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      providesTags: ["Content"],
    }),
    getContentById: builder.query<ContentItem, { id: string; token?: string }>({
      query: ({ id, token }) => ({
        url: `/reel/${id}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      providesTags: (result, error, id) => [{ type: "Content", id }],
    }),
    getContentReports: builder.query<ReportsResponse, { contentId: string; token?: string }>({
      query: ({ contentId, token }) => ({
        url: `/reel/report/${contentId}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    }),
    deleteReel: builder.mutation<void, { id: string; token?: string }>({
      query: ({ id, token }) => ({
        url: `/reel/${id}`,
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: ['Content'],
    }),
    updateReel: builder.mutation<void, { id: string; data: any; token?: string }>({
      query: ({ id, data, token }) => ({
        url: `/reel/${id}`,
        method: 'PATCH',
        body: data,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: ['Content'],
    }),
  }),
});

export const {
  useGetContentsQuery,
  useGetContentByIdQuery,
  useGetContentReportsQuery,
  useDeleteReelMutation,
  useUpdateReelMutation,
} = contentApi; 