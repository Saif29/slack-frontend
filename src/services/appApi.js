import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseDomain } from "../baseDomain";

const appApi = createApi({
    reducerPath: "appApi",
    baseQuery: fetchBaseQuery({
        baseUrl: baseDomain(),
    }),
    endpoints: (builder) => ({
        signupUser: builder.mutation({
            query: (user) => ({
                url: "/users",
                method: "POST",
                body: user,
            }),
        }),
        loginUser: builder.mutation({
            query: (user) => ({
                url: "/users/login",
                method: "POST",
                body: user,
            }),
        }),
        logoutUser: builder.mutation({
            query: (payload) => ({
                url: "/logout",
                method: "DELETE",
                body: payload,
            }),
        }),
        editUser: builder.mutation({
            query: (user) => ({
                url: "/users/edit",
                method: "POST",
                body: user,
            }),
        })
    }),
});

export const {
    useSignupUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useEditUserMutation,
} = appApi;

export default appApi;