import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { containerApi } from "../api/containersApi";
import { stationApi } from "features/stations/api/stationsApi";

import {
  Container,
  StatusContainer,
  TypeContainer,
} from "entities/container/containerTypes";
import { Station } from "entities/station/stationTypes";

export type EnrichedContainer = Container & {
  statusName: string;
  stationName: string;
  typeName: string;
  volume: number;
};

export type PaginatedContainersResponse = {
  count: number;
  results: EnrichedContainer[];
};

export const useContainersQuery = () => {
  const previousData = useRef<EnrichedContainer[] | null>(null);

  const query = useQuery<EnrichedContainer[]>({
    queryKey: ["containersAll"],
    queryFn: async () => {
      const rawContainers = await containerApi.getAllContainers();

      const enriched = await Promise.all(
        rawContainers.map(async (container) => {
          const enrichedContainer: EnrichedContainer = {
            ...container,
            statusName: "Unknown",
            typeName: "Unknown",
            volume: 0,
            stationName: "Unknown",
          };

          if (container.status_container_id !== null) {
            const status = await containerApi.getContainerStatusById(
              container.status_container_id
            );
            if (status) enrichedContainer.statusName = status.status_name;
          }

          if (container.type_of_container_id !== null) {
            const type = await containerApi.getContainerTypeById(
              container.type_of_container_id
            );
            if (type) {
              enrichedContainer.typeName = type.type_name_container;
              enrichedContainer.volume = type.volume_container;
            }
          }

          if (container.station_id !== null) {
            const station = await stationApi.getStationById(
              container.station_id
            );
            if (station)
              enrichedContainer.stationName =
                station.station_of_containers_name;
          }

          return enrichedContainer;
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

export const useContainersParamsQuery = (
  page?: number,
  searchTerm = "",
  statusName = "",
  typeName = ""
) => {
  const previousData = useRef<PaginatedContainersResponse | null>(null);

  const query = useQuery<PaginatedContainersResponse>({
    queryKey: ["containers", page, searchTerm, statusName, typeName],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page !== undefined) params.append("page", page.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (statusName)
        params.append("status_container_id__status_name", statusName);
      if (typeName)
        params.append("type_of_container_id__type_name_container", typeName);

      const rawContainers = await containerApi.getContainersWithParams(
        params.toString()
      );

      const enrichedResults = await Promise.all(
        rawContainers.results.map(async (container) => {
          const enrichedContainer: EnrichedContainer = {
            ...container,
            statusName: "Unknown",
            typeName: "Unknown",
            volume: 0,
            stationName: "Unknown",
          };

          if (container.status_container_id !== null) {
            const status = await containerApi.getContainerStatusById(
              container.status_container_id
            );
            if (status) enrichedContainer.statusName = status.status_name;
          }

          if (container.type_of_container_id !== null) {
            const type = await containerApi.getContainerTypeById(
              container.type_of_container_id
            );
            if (type) {
              enrichedContainer.typeName = type.type_name_container;
              enrichedContainer.volume = type.volume_container;
            }
          }

          if (container.station_id !== null) {
            const station = await stationApi.getStationById(
              container.station_id
            );
            if (station)
              enrichedContainer.stationName =
                station.station_of_containers_name;
          }

          return enrichedContainer;
        })
      );

      const response: PaginatedContainersResponse = {
        count: rawContainers.count,
        results: enrichedResults,
      };

      previousData.current = response;
      return response;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
