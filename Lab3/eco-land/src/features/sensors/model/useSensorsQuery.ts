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

export const useSensorsQuery = (page: number) => {
  const previousData = useRef<EnrichedSensor[] | null>(null);

  const query = useQuery<EnrichedSensor[]>({
    queryKey: ["sensors", page],
    queryFn: async () => {
      const sensors = await sensorApi.getAllSensors();

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

      previousData.current = enrichedSensors;
      return enrichedSensors;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
