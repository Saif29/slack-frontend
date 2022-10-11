import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const appApi = createApi({
    reducerPath: "appApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://slack-clone1.herokuapp.com/",
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