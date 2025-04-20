import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stationApi } from "../api/stationsApi";
import { AxiosError } from "axios";

export const useUpdateStationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stationId,
      status_station,
    }: {
      stationId: number;
      status_station: number;
    }) => stationApi.updateStationStatus(stationId, status_station),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
    onError: (error) => {
      console.error("Update status error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
