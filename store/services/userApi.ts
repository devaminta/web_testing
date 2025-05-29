import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the User type based on your backend response
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  username: string;
  bio?: string;
  profilePic?: string;
  following: string[];
  followers: string[];
  createdAt: string;
  updatedAt: string;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/auth/profiles" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: (token) => ({
        url: "/",
        method: "GET",
         headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = userApi; 