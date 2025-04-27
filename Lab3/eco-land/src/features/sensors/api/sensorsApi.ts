import { apiClient } from "shared/api/apiClient";
import { IoTSensor } from "entities/IoT/IoTtypes";

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
};
