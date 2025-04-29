import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { collectionScheduleApi } from "../api/schedulesApi";
import { stationApi } from "features/stations/api/stationsApi";
import { CollectionSchedule } from "entities/schedule/scheduleTypes";
import { Station } from "entities/station/stationTypes";

export type EnrichedCollectionSchedule = CollectionSchedule & {
  station: Station | null;
};

export const useCollectionSchedulesQuery = (page: number) => {
  const previousData = useRef<EnrichedCollectionSchedule[] | null>(null);

  const query = useQuery<EnrichedCollectionSchedule[]>({
    queryKey: ["collectionSchedules", page],
    queryFn: async () => {
      const schedules = await collectionScheduleApi.getAllSchedules();

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

      previousData.current = enrichedSchedules;
      return enrichedSchedules;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
