import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "partners";

export const useGetPartners = ({ status = 'all' } = {}) => useQuery({
    queryKey: ["getPartners", status],
    queryFn: async () => {
        const response = await AxiosConfig.get(endpoint, { params: { status } });
        return response?.data?.partners;
    },
});

export const useGetPartner = ({ id, enabled = true }) => useQuery({
    queryKey: ["getPartner", id],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/${id}`);
        return response?.data?.partner;
    },
    enabled: !!id && enabled,
});

export const useCreatePartner = () => useMutation({
    mutationKey: ["createPartner"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.post(endpoint, values);
        return response?.data;
    }
});

export const useUpdatePartner = () => useMutation({
    mutationKey: ["updatePartner"],
    mutationFn: async ({ id, values }) => {
        const response = await AxiosConfig.put(`${endpoint}/${id}`, values);
        return response?.data;
    }
});

export const useDeletePartner = () => useMutation({
    mutationKey: ["deletePartner"],
    mutationFn: async ({ id }) => {
        const response = await AxiosConfig.delete(`${endpoint}/${id}`);
        return response?.data;
    }
});

export const useTogglePartnerStatus = () => useMutation({
    mutationKey: ["togglePartnerStatus"],
    mutationFn: async ({ id, status }) => {
        const response = await AxiosConfig.put(`${endpoint}/${id}`, { status });
        return response?.data;
    }
});

export const useGetPartnerExpenses = ({ id, bsYear, bsMonth, enabled = true }) => useQuery({
    queryKey: ["getPartnerExpenses", id, bsYear, bsMonth],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/${id}/expenses`, { params: { bsYear, bsMonth } });
        return response?.data?.expenses;
    },
    enabled: !!id && enabled,
});
