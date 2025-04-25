import { useMutation, useQueryClient } from "@tanstack/react-query";
import { containerApi } from "../api/containersApi";
import { AxiosError } from "axios";

export const useUpdateContainerTypeData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      typeName,
      typeId,
      typeVolume,
    }: {
      typeName: string;
      typeId: number;
      typeVolume: number;
    }) => containerApi.updateTypeContainerData(typeId, typeName, typeVolume),

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
