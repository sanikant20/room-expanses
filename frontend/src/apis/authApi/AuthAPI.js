import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = {
    auth: "auth",
    login: "login",
    partnerLogin: "partner-login",
    me: "me",
    profile: "profile",
    changePassword: "change-password",
}

export const useLogin = () => useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.post(`${endpoint.auth}/${endpoint.login}`, values);
        return response?.data;
    }
});

export const usePartnerLogin = () => useMutation({
    mutationKey: ["partnerLogin"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.post(`${endpoint.auth}/${endpoint.partnerLogin}`, values);
        return response?.data;
    }
});

export const useGetCurrentUser = ({ enabled = true } = {}) => useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint.auth}/${endpoint.me}`);
        return response?.data?.user;
    },
    enabled,
    retry: false,
});

export const useUpdateProfile = () => useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async ({ formData }) => {
        const response = await AxiosConfig.put(`${endpoint.auth}/${endpoint.profile}`, formData);
        return response?.data;
    }
});

export const useChangePassword = () => useMutation({
    mutationKey: ["changePassword"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.put(`${endpoint.auth}/${endpoint.changePassword}`, values);
        return response?.data;
    }
});

export const useLogout = () => useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
        const response = await AxiosConfig.post(`${endpoint.auth}/logout`);
        return response?.data;
    }
});
