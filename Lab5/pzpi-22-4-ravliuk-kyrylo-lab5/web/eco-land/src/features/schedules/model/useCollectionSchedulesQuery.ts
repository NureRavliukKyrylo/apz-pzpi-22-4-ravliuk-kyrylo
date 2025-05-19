import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { collectionScheduleApi } from "../api/schedulesApi";
import { stationApi } from "features/stations/api/stationsApi";
import { CollectionSchedule } from "entities/schedule/scheduleTypes";
import { Station } from "entities/station/stationTypes";

export type EnrichedCollectionSchedule = CollectionSchedule & {
  station: Station | null;
};

export type PaginatedCollectionScheduleResponse = {
  count: number;
  results: EnrichedCollectionSchedule[];
};

export const useCollectionSchedulesQuery = (
  page: number,
  searchTerm = "",
  ordering = ""
) => {
  const previousData = useRef<PaginatedCollectionScheduleResponse | null>(null);

  const query = useQuery<PaginatedCollectionScheduleResponse>({
    queryKey: ["collectionSchedules", page, searchTerm, ordering],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (page !== undefined) {
        params.append("page", page.toString());
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (ordering) {
        params.append("ordering", ordering);
      }

      const response = await collectionScheduleApi.getAllSchedules(
        params.toString()
      );

      const schedules = response.results;

      const enrichedSchedules = await Promise.all(
        schedules.map(async (schedule) => {
          let station: Station | null = null;
          if (schedule.station_of_containers_id !== null) {
            try {
              station = await stationApi.getStationById(
                schedule.station_of_containers_id
              );
            } catch (error) {
              console.error(
                `Failed to fetch station for schedule ${schedule.id}`,
                error
              );
            }
          }

          return {
            ...schedule,
            station,
          };
        })
      );

      const enrichedResponse: PaginatedCollectionScheduleResponse = {
        results: enrichedSchedules,
        count: response.count,
      };

      previousData.current = enrichedResponse;
      return enrichedResponse;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
