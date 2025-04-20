import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { stationApi } from "../api/stationsApi";
import { Station } from "entities/station/stationTypes";

export type EnrichedStation = Station & { statusName: string };

export const useStationsQuery = () => {
  const previousData = useRef<EnrichedStation[] | null>(null);

  const query = useQuery<EnrichedStation[]>({
    queryKey: ["stations"],
    queryFn: async () => {
      const rawStations = await stationApi.getAllStations();

      const enriched = await Promise.all(
        rawStations.map(async (station) => {
          const status = await stationApi.getStationStatusById(
            station.status_station
          );
          return {
            ...station,
            statusName: status.station_status_name,
          };
        })
      );

      previousData.current = enriched;
      return enriched;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
