import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { sensorApi } from "../api/sensorsApi";
import { containerApi } from "features/containers/api/containersApi";
import { stationApi } from "features/stations/api/stationsApi";
import { IoTSensor } from "entities/IoT/IoTtypes";
import { Station } from "entities/station/stationTypes";
import { TypeContainer } from "entities/container/containerTypes";

export type EnrichedSensor = IoTSensor & {
  containerType: TypeContainer | null;
  station: Station | null;
};

export type PaginatedSensorsResponse = {
  count: number;
  results: EnrichedSensor[];
};

export const useSensorsQuery = (
  page: number,
  searchTerm = "",
  typeName = ""
) => {
  const previousData = useRef<PaginatedSensorsResponse | null>(null);

  const query = useQuery<PaginatedSensorsResponse>({
    queryKey: ["sensors", page, searchTerm, typeName],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (page !== undefined) {
        params.append("page", page.toString());
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (typeName) {
        params.append(
          "container_id_filling__type_of_container_id__type_name_container",
          typeName
        );
      }

      const response = await sensorApi.getSensorsParams(params.toString());
      const sensors = response.results;
      const enrichedSensors = await Promise.all(
        sensors.map(async (sensor) => {
          if (!sensor.container_id_filling) {
            return {
              ...sensor,
              containerType: null,
              station: null,
            };
          }

          const container = await containerApi.getContainerById(
            sensor.container_id_filling
          );

          if (!container) {
            return {
              ...sensor,
              containerType: null,
              station: null,
            };
          }

          let station: Station | null = null;
          if (container.station_id !== null) {
            try {
              station = await stationApi.getStationById(container.station_id);
            } catch (error) {
              console.error(
                `Failed to fetch station for container ${container.id}`,
                error
              );
            }
          }

          let containerType: TypeContainer | null = null;
          if (container.type_of_container_id !== null) {
            try {
              containerType = await containerApi.getContainerTypeById(
                container.type_of_container_id
              );
            } catch (error) {
              console.error(
                `Failed to fetch container type for container ${container.id}`,
                error
              );
            }
          }

          return {
            ...sensor,
            containerType,
            station,
          };
        })
      );

      const enrichedResponse: PaginatedSensorsResponse = {
        results: enrichedSensors,
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
