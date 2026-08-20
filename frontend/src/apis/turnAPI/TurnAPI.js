import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "turn";

export const useGetTurnState = ({ enabled = true } = {}) => useQuery({
    queryKey: ["getTurnState"],
    queryFn: async () => {
        const response = await AxiosConfig.get(endpoint);
        return response?.data;
    },
    enabled,
});

export const useGetPublicTurnState = ({ enabled = true } = {}) => useQuery({
    queryKey: ["getPublicTurnState"],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/public`);
        return response?.data;
    },
    enabled,
});

export const useGetTurnHistory = ({ enabled = true } = {}) => useQuery({
    queryKey: ["getTurnHistory"],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/history`);
        return response?.data;
    },
    enabled,
});

export const useCreateTurn = () => useMutation({
    mutationKey: ["createTurn"],
    mutationFn: async ({ partners }) => {
        const response = await AxiosConfig.post(endpoint, { partners });
        return response?.data;
    },
});

export const useUpdateTurn = () => useMutation({
    mutationKey: ["updateTurn"],
    mutationFn: async ({ id, partners, status }) => {
        const body = {};
        if (partners) body.partners = partners;
        if (status) body.status = status;
        const response = await AxiosConfig.put(`${endpoint}/${id}`, body);
        return response?.data;
    },
});

export const useCompleteTurn = () => useMutation({
    mutationKey: ["completeTurn"],
    mutationFn: async ({ partnerId } = {}) => {
        const body = {};
        if (partnerId) body.partnerId = partnerId;
        const response = await AxiosConfig.post(`${endpoint}/complete`, body);
        return response?.data;
    },
});

export const useResetTurnEvent = () => useMutation({
    mutationKey: ["resetTurnEvent"],
    mutationFn: async ({ eventId }) => {
        const response = await AxiosConfig.post(`${endpoint}/reset`, { eventId });
        return response?.data;
    },
});