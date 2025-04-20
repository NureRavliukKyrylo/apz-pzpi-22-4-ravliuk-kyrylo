import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stationApi } from "../api/stationsApi";
import { AxiosError } from "axios";

export const useDeleteStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stationId: number) => stationApi.deleteStation(stationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
    onError: (error) => {
      console.error("Delete station error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response);
      }
    },
  });
};
