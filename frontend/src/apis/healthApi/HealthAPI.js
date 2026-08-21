import { useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "health";

export const useGetHealthStatus = () => useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
        const response = await AxiosConfig.get(endpoint);
        return response?.data;
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
    retry: 1,
    retryDelay: 1000,
});
