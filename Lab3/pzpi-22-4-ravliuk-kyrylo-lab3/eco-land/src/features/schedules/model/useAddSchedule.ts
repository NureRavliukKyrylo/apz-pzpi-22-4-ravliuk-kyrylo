import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionScheduleApi } from "../api/schedulesApi";
import { AxiosError } from "axios";

export const useAddSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      station_of_containers_id: number;
      collection_date: string;
    }) => collectionScheduleApi.addSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectionSchedules"] });
    },
    onError: (error) => {
      console.error("Add station error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
