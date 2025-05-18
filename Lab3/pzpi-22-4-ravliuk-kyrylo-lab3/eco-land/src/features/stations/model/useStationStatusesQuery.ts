import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { stationApi } from "../api/stationsApi";
import { StationStatus } from "entities/station/stationTypes";

export type PaginatedStationStatusesResponse = {
  count: number;
  results: StationStatus[];
};

export const useStationStatusesQuery = () => {
  const previousData = useRef<StationStatus[] | null>(null);

  const query = useQuery<StationStatus[]>({
    queryKey: ["stationStatusesAll"],
    queryFn: async () => {
      const statuses = await stationApi.getAllStationStatuses();

      previousData.current = statuses;
      return statuses;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};

export const useStationStatusesParamsQuery = (page?: number) => {
  const previousData = useRef<PaginatedStationStatusesResponse | null>(null);

  const query = useQuery<PaginatedStationStatusesResponse>({
    queryKey: ["stationStatuses", page],
    queryFn: async () => {
      const params = page ? `page=${page}` : "";
      const data = await stationApi.getStationStatusesWithParams(params);

      previousData.current = data;
      return data;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
