import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = {
    auth: "auth",
    login: "login",
    register: "register",
    me: "me",
    changePassword: "change-password",
}

export const useLogin = () => useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.post(`${endpoint.auth}/${endpoint.login}`, values);
        return response?.data;
    }
});

export const useRegister = () => useMutation({
    mutationKey: ["register"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.post(`${endpoint.auth}/${endpoint.register}`, values);
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

export const useChangePassword = () => useMutation({
    mutationKey: ["changePassword"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.put(`${endpoint.auth}/${endpoint.changePassword}`, values);
        return response?.data;
    }
});
