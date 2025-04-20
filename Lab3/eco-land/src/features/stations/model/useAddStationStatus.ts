import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stationApi } from "../api/stationsApi";
import { AxiosError } from "axios";

export const useAddStationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (station_status_name: string) =>
      stationApi.addStationStatus(station_status_name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stationStatuses"] });
    },
    onError: (error) => {
      console.error("Add status error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
