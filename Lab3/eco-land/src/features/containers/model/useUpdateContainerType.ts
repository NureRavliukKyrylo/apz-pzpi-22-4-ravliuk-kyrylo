import { useMutation, useQueryClient } from "@tanstack/react-query";
import { containerApi } from "../api/containersApi";
import { AxiosError } from "axios";

export const useUpdateContainerType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      containerId,
      type_of_container_id,
    }: {
      containerId: number;
      type_of_container_id: number;
    }) => containerApi.updateContainerType(containerId, type_of_container_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    },
    onError: (error) => {
      console.error("Update container type error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
