import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "turn";

export const useGetTurnState = ({ type = "water", enabled = true } = {}) => useQuery({
    queryKey: ["getTurnState", type],
    queryFn: async () => {
        const response = await AxiosConfig.get(endpoint, { params: { type } });
        return response?.data;
    },
    enabled,
});

export const useGetPublicTurnState = ({ type = "water", enabled = true } = {}) => useQuery({
    queryKey: ["getPublicTurnState", type],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/public`, { params: { type } });
        return response?.data;
    },
    enabled,
});

export const useGetTurnHistory = ({ type = "water", enabled = true } = {}) => useQuery({
    queryKey: ["getTurnHistory", type],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/history`, { params: { type } });
        return response?.data;
    },
    enabled,
});

export const useCreateTurn = () => useMutation({
    mutationKey: ["createTurn"],
    mutationFn: async ({ type = "water", partners }) => {
        const response = await AxiosConfig.post(endpoint, { type, partners });
        return response?.data;
    },
});

export const useUpdateTurn = () => useMutation({
    mutationKey: ["updateTurn"],
    mutationFn: async ({ id, type = "water", partners, status }) => {
        const body = { type };
        if (partners) body.partners = partners;
        if (status) body.status = status;
        const response = await AxiosConfig.put(`${endpoint}/${id}`, body);
        return response?.data;
    },
});

export const useCompleteTurn = () => useMutation({
    mutationKey: ["completeTurn"],
    mutationFn: async ({ type = "water", partnerId } = {}) => {
        const body = { type };
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