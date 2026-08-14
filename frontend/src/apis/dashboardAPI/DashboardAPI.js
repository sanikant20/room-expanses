import { useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "dashboard";

export const useGetDashboardSummary = ({ bsYear, bsMonth, enabled = true } = {}) => useQuery({
    queryKey: ["getDashboardSummary", bsYear, bsMonth],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/summary`, { params: { bsYear, bsMonth } });
        return response?.data;
    },
    enabled: !!bsYear && !!bsMonth && enabled,
});
