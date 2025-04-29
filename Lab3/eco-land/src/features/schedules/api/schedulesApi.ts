import { CollectionSchedule } from "entities/schedule/scheduleTypes";
import { apiClient } from "shared/api/apiClient";
import { PaginatedCollectionScheduleResponse } from "../model/useCollectionSchedulesQuery";

export const collectionScheduleApi = {
  getAllSchedules: async (
    params: string
  ): Promise<PaginatedCollectionScheduleResponse> => {
    const response = await apiClient.get(`/collectionSchedules/?${params}`);
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
