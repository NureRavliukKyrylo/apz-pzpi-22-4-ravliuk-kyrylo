import { useMutation, useQueryClient } from "@tanstack/react-query";
import { containerApi } from "../api/containersApi";
import { AxiosError } from "axios";

export const useAddContainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      container_name: string;
      type_of_container_id: number;
      status_container_id: number;
      volume_container: number;
    }) => containerApi.addContainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    },
    onError: (error) => {
      console.error("Add station error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
