import { useMutation, useQueryClient } from "@tanstack/react-query";
import { containerApi } from "../api/containersApi";
import { AxiosError } from "axios";

export const useAddContainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      station_id: number;
      type_of_container_id: number;
      status_container_id: number;
    }) => containerApi.addContainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["containersAll"] });
    },
    onError: (error) => {
      console.error("Add station error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
