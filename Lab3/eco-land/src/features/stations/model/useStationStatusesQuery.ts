import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { stationApi } from "../api/stationsApi";
import { StationStatus } from "entities/station/stationTypes";

export const useStationStatusesQuery = () => {
  const previousData = useRef<StationStatus[] | null>(null);

  const query = useQuery<StationStatus[]>({
    queryKey: ["stationStatuses"],
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
