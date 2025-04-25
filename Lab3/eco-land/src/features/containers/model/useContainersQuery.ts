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

export const useContainersQuery = (page: number) => {
  const previousData = useRef<EnrichedContainer[] | null>(null);

  const query = useQuery<EnrichedContainer[]>({
    queryKey: ["containers", page],
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
            if (status) {
              enrichedContainer.statusName = status.status_name;
            }
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
            if (station) {
              enrichedContainer.stationName =
                station.station_of_containers_name;
            }
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
