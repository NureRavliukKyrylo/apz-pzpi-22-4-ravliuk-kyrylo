import { apiClient } from "shared/api/apiClient";
import { IoTSensor } from "entities/IoT/IoTtypes";
import { PaginatedSensorsResponse } from "../model/useSensorsQuery";
export const sensorApi = {
  getAllSensors: async (): Promise<IoTSensor[]> => {
    const response = await apiClient.get<IoTSensor[]>("/iotFillingContainers/");
    return response.data;
  },

  deleteSensor: async (sensorId: number): Promise<void> => {
    await apiClient.delete(`/iotFillingContainers/${sensorId}/`);
  },

  addSensor: async (data: {
    container_id_filling: number;
    sensor_value: number;
  }): Promise<void> => {
    await apiClient.post("/iotFillingContainers/", data);
  },
  getSensorsParams: async (
    params: string
  ): Promise<PaginatedSensorsResponse> => {
    const response = await apiClient.get(`/iotFillingContainers/?${params}`);
    return response.data;
  },
};
