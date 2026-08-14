import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "settlement";

export const useGetSettlement = ({ bsYear, bsMonth, category, enabled = true } = {}) => useQuery({
    queryKey: ["getSettlement", bsYear, bsMonth, category],
    queryFn: async () => {
        const params = { bsYear, bsMonth };
        if (category) params.category = category;
        const response = await AxiosConfig.get(endpoint, { params });
        return response?.data;
    },
    enabled: !!bsYear && !!bsMonth && enabled,
});

export const useGetSettlementCalculations = ({ bsYear, bsMonth, category, enabled = true } = {}) => useQuery({
    queryKey: ["getSettlementCalculations", bsYear, bsMonth, category],
    queryFn: async () => {
        const params = { bsYear, bsMonth };
        if (category) params.category = category;
        const response = await AxiosConfig.get(`${endpoint}/calculations`, { params });
        return response?.data;
    },
    enabled: !!bsYear && !!bsMonth && enabled,
});

export const useSettleSettlement = () => useMutation({
    mutationKey: ["settleSettlement"],
    mutationFn: async ({ bsYear, bsMonth, category }) => {
        const response = await AxiosConfig.post(`${endpoint}/settle`, { bsYear, bsMonth, category });
        return response?.data;
    },
});

export const useUnsettleSettlement = () => useMutation({
    mutationKey: ["unsettleSettlement"],
    mutationFn: async ({ bsYear, bsMonth, category }) => {
        const response = await AxiosConfig.post(`${endpoint}/unsettle`, { bsYear, bsMonth, category });
        return response?.data;
    },
});
