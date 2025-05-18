import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sensorApi } from "../api/sensorsApi";
import { AxiosError } from "axios";

export const useAddSensor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      container_id_filling: number;
      sensor_value: number;
    }) => sensorApi.addSensor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] });
    },
    onError: (error) => {
      console.error("Add station error:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response?.data);
      }
    },
  });
};
