import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionScheduleApi } from "../api/schedulesApi";
import { AxiosError } from "axios";

export const useUpdateCollectionScheduleDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      collection_date,
    }: {
      id: number;
      collection_date: string;
    }) => collectionScheduleApi.updateScheduleDate(id, { collection_date }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionSchedules"] });
    },
    onError: (error) => {
      console.error("Update status error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
