import { CollectionSchedule } from "entities/schedule/scheduleTypes";
import { apiClient } from "shared/api/apiClient";

export const collectionScheduleApi = {
  getAllSchedules: async (): Promise<CollectionSchedule[]> => {
    const response = await apiClient.get<CollectionSchedule[]>(
      "/collectionSchedules/"
    );
    return response.data;
  },

  deleteSchedule: async (scheduleId: number): Promise<void> => {
    await apiClient.delete(`/collectionSchedules/${scheduleId}/`);
  },

  addSchedule: async (data: {
    station_of_containers_id: number;
    collection_date: string;
  }): Promise<void> => {
    await apiClient.post("/collectionSchedules/", data);
  },

  updateScheduleDate: async (
    id: number,
    data: {
      collection_date: string;
    }
  ): Promise<void> => {
    await apiClient.patch(
      `/collectionSchedules/${id}/update-collection-date/`,
      data
    );
  },
};
