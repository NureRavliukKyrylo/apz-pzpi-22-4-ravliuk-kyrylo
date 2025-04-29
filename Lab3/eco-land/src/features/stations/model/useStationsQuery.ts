import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { stationApi } from "../api/stationsApi";
import { Station } from "entities/station/stationTypes";

export type EnrichedStation = Station & { statusName: string };

export type PaginatedStationsResponse = {
  count: number;
  results: EnrichedStation[];
};

export const useStationsQuery = () => {
  const previousData = useRef<EnrichedStation[] | null>(null);

  const query = useQuery<EnrichedStation[]>({
    queryKey: ["stationsAll"],
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

export const useStationsParamsQuery = (
  page?: number,
  searchTerm = "",
  statusName = ""
) => {
  const previousData = useRef<PaginatedStationsResponse | null>(null);

  const query = useQuery<PaginatedStationsResponse>({
    queryKey: ["stations", page, searchTerm, statusName],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (page !== undefined) {
        params.append("page", page.toString());
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (statusName) {
        params.append("status_station__station_status_name", statusName);
      }

      const response = await stationApi.getStationsWithParams(
        params.toString()
      );
      const rawStations = response.results;

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

      const enrichedResponse: PaginatedStationsResponse = {
        results: enriched,
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
