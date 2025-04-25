import { useMutation, useQueryClient } from "@tanstack/react-query";
import { containerApi } from "../api/containersApi";
import { AxiosError } from "axios";

export const useUpdateContainerStatusName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      status_name,
      statusId,
    }: {
      status_name: string;
      statusId: number;
    }) => containerApi.updateContainerStatusName(statusId, status_name),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containerStatuses"] });
    },

    onError: (error) => {
      console.error("Add status error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
