import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stationApi } from "../api/stationsApi";
import { AxiosError } from "axios";

export const useAddStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      station_of_containers_name: string;
      latitude_location: number;
      longitude_location: number;
      status_station: number;
    }) => stationApi.addStation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
    onError: (error) => {
      console.error("Add station error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
