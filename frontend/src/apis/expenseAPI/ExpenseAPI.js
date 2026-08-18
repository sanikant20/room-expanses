import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "expenses";

export const useGetExpenses = ({ bsYear, bsMonth, category, group, paidBy, search, enabled = true } = {}) => useQuery({
    queryKey: ["getExpenses", bsYear, bsMonth, category, group, paidBy, search],
    queryFn: async () => {
        const params = {};
        if (bsYear) params.bsYear = bsYear;
        if (bsMonth) params.bsMonth = bsMonth;
        if (category) params.category = category;
        if (group) params.group = group;
        if (paidBy) params.paidBy = paidBy;
        if (search) params.search = search;
        const response = await AxiosConfig.get(endpoint, { params });
        return response?.data?.expenses;
    },
    enabled,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
});

export const useGetExpense = ({ id, enabled = true }) => useQuery({
    queryKey: ["getExpense", id],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/${id}`);
        return response?.data?.expense;
    },
    enabled: !!id && enabled,
});

export const useCreateExpense = () => useMutation({
    mutationKey: ["createExpense"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.post(endpoint, values);
        return response?.data;
    }
});

export const useUpdateExpense = () => useMutation({
    mutationKey: ["updateExpense"],
    mutationFn: async ({ id, values }) => {
        const response = await AxiosConfig.put(`${endpoint}/${id}`, values);
        return response?.data;
    }
});

export const useDeleteExpense = () => useMutation({
    mutationKey: ["deleteExpense"],
    mutationFn: async ({ id }) => {
        const response = await AxiosConfig.delete(`${endpoint}/${id}`);
        return response?.data;
    }
});
