import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "notifications";

export const useGetNotifications = ({ enabled = true, refetchInterval = 60_000 } = {}) => useQuery({
    queryKey: ["getNotifications"],
    queryFn: async () => {
        const response = await AxiosConfig.get(endpoint);
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