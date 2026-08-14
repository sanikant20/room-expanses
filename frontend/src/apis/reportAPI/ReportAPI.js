import { useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "reports";

export const useGetMonthlyReport = ({ bsYear, bsMonth, category, paidBy, enabled = true } = {}) => useQuery({
    queryKey: ["getMonthlyReport", bsYear, bsMonth, category, paidBy],
    queryFn: async () => {
        const params = { bsYear, bsMonth };
        if (category) params.category = category;
        if (paidBy) params.paidBy = paidBy;
        const response = await AxiosConfig.get(`${endpoint}/monthly`, { params });
        return response?.data;
    },
    enabled: !!bsYear && !!bsMonth && enabled,
});

export const useGetPartnerReport = ({ partnerId, bsYear, bsMonth, enabled = true } = {}) => useQuery({
    queryKey: ["getPartnerReport", partnerId, bsYear, bsMonth],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/partner`, { params: { partnerId, bsYear, bsMonth } });
        return response?.data;
    },
    enabled: !!bsYear && !!bsMonth && !!partnerId && enabled,
});

export const useGetSettlementReport = ({ bsYear, bsMonth, enabled = true } = {}) => useQuery({
    queryKey: ["getSettlementReport", bsYear, bsMonth],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/settlement`, { params: { bsYear, bsMonth } });
        return response?.data;
    },
    enabled: !!bsYear && !!bsMonth && enabled,
});

export const useGetCategoryReport = ({ category, group, bsYear, bsMonth, enabled = true } = {}) => useQuery({
    queryKey: ["getCategoryReport", category, group, bsYear, bsMonth],
    queryFn: async () => {
        const params = { category, bsYear, bsMonth };
        if (group) params.group = group;
        const response = await AxiosConfig.get(`${endpoint}/category`, { params });
        return response?.data;
    },
    enabled: !!category && !!bsYear && !!bsMonth && enabled,
});
