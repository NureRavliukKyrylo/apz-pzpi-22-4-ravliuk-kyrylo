import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stationApi } from "../api/stationsApi";
import { AxiosError } from "axios";

export const useDeleteStationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId: number) => stationApi.deleteStationStatus(statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stationStatuses"] });
    },
    onError: (error) => {
      console.error("Delete station status error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response);
      }
    },
  });
};
