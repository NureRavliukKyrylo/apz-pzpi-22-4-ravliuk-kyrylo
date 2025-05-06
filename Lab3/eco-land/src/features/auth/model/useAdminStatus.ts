import { useQuery } from "@tanstack/react-query";
import { apiClient } from "shared/api/apiClient";

export const useAdminStatus = () => {
  return useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      const response = await apiClient.get("/check-admin/");
      return response.data.isAdmin;
    },
    staleTime: 3 * 60 * 1000,
    retry: false,
  });
};
