import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "settlement";

export const useGetSettlement = ({ bsYear, bsMonth, category, group, enabled = true } = {}) => useQuery({
    queryKey: ["getSettlement", bsYear, bsMonth, category, group],
    queryFn: async () => {
        const params = { bsYear, bsMonth };
        if (category) params.category = category;
        if (group) params.group = group;
        const response = await AxiosConfig.get(endpoint, { params });
        return response?.data;
    },
    enabled: !!bsYear && !!bsMonth && enabled,
});

export const useGetSettlementCalculations = ({ bsYear, bsMonth, category, group, enabled = true } = {}) => useQuery({
    queryKey: ["getSettlementCalculations", bsYear, bsMonth, category, group],
    queryFn: async () => {
        const params = { bsYear, bsMonth };
        if (category) params.category = category;
        if (group) params.group = group;
        const response = await AxiosConfig.get(`${endpoint}/calculations`, { params });
        return response?.data;
    },
    enabled: !!bsYear && !!bsMonth && enabled,
});

export const useSettleSettlement = () => useMutation({
    mutationKey: ["settleSettlement"],
    mutationFn: async ({ bsYear, bsMonth, category, group }) => {
        const response = await AxiosConfig.post(`${endpoint}/settle`, { bsYear, bsMonth, category, group });
        return response?.data;
    },
});

export const useUnsettleSettlement = () => useMutation({
    mutationKey: ["unsettleSettlement"],
    mutationFn: async ({ bsYear, bsMonth, category, group }) => {
        const response = await AxiosConfig.post(`${endpoint}/unsettle`, { bsYear, bsMonth, category, group });
        return response?.data;
    },
});
