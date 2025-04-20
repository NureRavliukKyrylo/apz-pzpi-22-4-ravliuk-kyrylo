import { apiClient } from "shared/api/apiClient";
import { Station, StationStatus } from "entities/station/stationTypes";

export const stationApi = {
  getAllStations: async (): Promise<Station[]> => {
    const response = await apiClient.get<Station[]>("/stationOfContainers/");
    return response.data;
  },
  getAllStationStatuses: async (): Promise<StationStatus[]> => {
    const response = await apiClient.get<StationStatus[]>(
      "/stationOfContainersStatuses/"
    );
    return response.data;
  },
  getStationStatusById: async (id: number): Promise<StationStatus> => {
    const response = await apiClient.get<StationStatus>(
      `/stationOfContainersStatuses/${id}/`
    );
    return response.data;
  },
  addStation: async (data: {
    station_of_containers_name: string;
    latitude_location: number;
    longitude_location: number;
    status_station: number;
  }): Promise<void> => {
    await apiClient.post("/stationOfContainers/", data);
  },
  addStationStatus: async (statusName: string): Promise<void> => {
    await apiClient.post("/stationOfContainersStatuses/", {
      station_status_name: statusName,
    });
  },
  updateStationStatus: async (
    stationId: number,
    status_station: number
  ): Promise<void> => {
    await apiClient.patch(`/stationOfContainers/${stationId}/update-status/`, {
      status_station,
    });
  },
  deleteStation: async (stationId: number): Promise<void> => {
    await apiClient.delete(`/stationOfContainers/${stationId}/`);
  },

  deleteStationStatus: async (statusId: number): Promise<void> => {
    await apiClient.delete(`/stationOfContainersStatuses/${statusId}/`);
  },
  updateStationStatusName: async (
    statusId: number,
    statusName: string
  ): Promise<void> => {
    await apiClient.put(`/stationOfContainersStatuses/${statusId}/`, {
      station_status_name: statusName,
    });
  },
};
