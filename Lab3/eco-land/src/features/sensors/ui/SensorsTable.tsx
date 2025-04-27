import { useState } from "react";
import { useSensorsQuery } from "../model/useSensorsQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { sensorApi } from "../api/sensorsApi";
import styles from "./SensorsTable.module.scss";
import { Pagination } from "shared/ui/pagination/Pagination";
import { useSortableData } from "shared/utils/useSortableData";

const SENSORS_PER_PAGE = 8;

export const SensorsTable = () => {
  const [page, setPage] = useState(1);

  const {
    data: sensors,
    isLoading,
    isError,
    isFetching,
  } = useSensorsQuery(page);

  const {
    sortedItems: sortedSensors,
    sortBy,
    sortOrder,
    requestSort,
  } = useSortableData(sensors || []);

  const totalPages = Math.ceil(sortedSensors.length / 8);
  const start = (page - 1) * SENSORS_PER_PAGE;
  const currentSensors = sortedSensors.slice((page - 1) * 8, page * 8);

  if (isLoading || isFetching) {
    return (
      <div className={styles.sensorsContainer}>
        <SpinnerLoading centered />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.sensorsContainer}>
        <div className={styles.error}>Error fetching sensors.</div>
      </div>
    );
  }

  return (
    <div className={styles.sensorsContainer}>
      <h1>Sensors</h1>
      <table className={styles.sensorsTable}>
        <thead>
          <tr>
            <th onClick={() => requestSort("sensor_value")}>Sensor Value</th>
            <th onClick={() => requestSort("time_of_detect")}>Detected At</th>
            <th
              onClick={() => requestSort("containerType.type_name_container")}
            >
              Container Type
            </th>
            <th
              onClick={() => requestSort("station.station_of_containers_name")}
            >
              Station Name
            </th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentSensors.map((sensor) => (
            <tr key={sensor.id}>
              <td>{sensor.sensor_value}</td>
              <td>{new Date(sensor.time_of_detect).toLocaleString()}</td>
              <td>{sensor.containerType?.type_name_container}</td>
              <td>{sensor.station?.station_of_containers_name}</td>
              <td>
                <DeleteButton
                  id={sensor.id}
                  deleteFn={sensorApi.deleteSensor}
                  label="Sensor"
                  data={String(sensor.id)}
                  onSuccess={() => setPage(1)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.paginationContainer}>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
