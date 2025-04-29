import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stationApi } from "../api/stationsApi";
import { AxiosError } from "axios";

export const useUpdateStationStatusName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      station_status_name,
      statusId,
    }: {
      station_status_name: string;
      statusId: number;
    }) => stationApi.updateStationStatusName(statusId, station_status_name),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stationStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["stationStatusesAll"] });
    },

    onError: (error) => {
      console.error("Add status error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
