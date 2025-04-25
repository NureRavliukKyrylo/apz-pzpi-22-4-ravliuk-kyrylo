import { useMutation, useQueryClient } from "@tanstack/react-query";
import { containerApi } from "../api/containersApi";
import { AxiosError } from "axios";

export const useAddContainerType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type_name_container: string;
      volume_container: number;
    }) => containerApi.addContainerType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containerTypes"] });
    },
    onError: (error) => {
      console.error("Add status error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
