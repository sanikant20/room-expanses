import { useMutation, useQuery } from "@tanstack/react-query";
import AxiosConfig from "../../configurations/axiosConfig";

const endpoint = "groups";

export const useGetGroups = () => useQuery({
    queryKey: ["getGroups"],
    queryFn: async () => {
        const response = await AxiosConfig.get(endpoint);
        return response?.data?.groups;
    },
    staleTime: 5 * 60 * 1000,
});

export const useGetActiveGroups = () => useQuery({
    queryKey: ["getActiveGroups"],
    queryFn: async () => {
        const response = await AxiosConfig.get(endpoint, { params: { status: "active" } });
        return response?.data?.groups;
    },
    staleTime: 5 * 60 * 1000,
});

export const useGetGroup = ({ id, enabled = true }) => useQuery({
    queryKey: ["getGroup", id],
    queryFn: async () => {
        const response = await AxiosConfig.get(`${endpoint}/${id}`);
        return response?.data?.group;
    },
    enabled: !!id && enabled,
});

export const useCreateGroup = () => useMutation({
    mutationKey: ["createGroup"],
    mutationFn: async ({ values }) => {
        const response = await AxiosConfig.post(endpoint, values);
        return response?.data;
    }
});

export const useUpdateGroup = () => useMutation({
    mutationKey: ["updateGroup"],
    mutationFn: async ({ id, values }) => {
        const response = await AxiosConfig.put(`${endpoint}/${id}`, values);
        return response?.data;
    }
});

export const useDeleteGroup = () => useMutation({
    mutationKey: ["deleteGroup"],
    mutationFn: async ({ id }) => {
        const response = await AxiosConfig.delete(`${endpoint}/${id}`);
        return response?.data;
    }
});
