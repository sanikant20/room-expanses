import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "notifications";

export const useGetNotifications = ({ enabled = true, refetchInterval = 60_000, status } = {}) => useQuery({
    queryKey: ["getNotifications", status || "all"],
    queryFn: async () => {
        const response = await AxiosConfig.get(endpoint, { params: status ? { status } : {} });
        return response?.data;
    },
    enabled,
    refetchInterval,
});

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["markNotificationRead"],
        mutationFn: async ({ id }) => {
            const response = await AxiosConfig.put(`${endpoint}/${id}/read`);
            return response?.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getNotifications"] });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteNotification"],
        mutationFn: async ({ id }) => {
            const response = await AxiosConfig.delete(`${endpoint}/${id}`);
            return response?.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getNotifications"] });
        },
    });
};

export const useDeleteExpiredNotifications = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteExpiredNotifications"],
        mutationFn: async () => {
            const response = await AxiosConfig.delete(`${endpoint}/read/expired`);
            return response?.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getNotifications"] });
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["markAllNotificationsRead"],
        mutationFn: async () => {
            const response = await AxiosConfig.put(`${endpoint}/read-all`);
            return response?.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getNotifications"] });
        },
    });
};