import { useState } from "react";
import { useSensorsQuery } from "../model/useSensorsQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { sensorApi } from "../api/sensorsApi";
import styles from "./SensorsTable.module.scss";
import { Pagination } from "shared/ui/pagination/Pagination";
import { useSortableData } from "shared/utils/useSortableData";
import { useContainerTypesQuery } from "features/containers/model/useContainerTypesQuery";
import { SearchInput } from "shared/ui/seach/SearchInput";
import { FilterSelect } from "shared/ui/filter/FilterOption";

const SENSORS_PER_PAGE = 8;

export const SensorsTable = () => {
  const [page, setPage] = useState(1);
  const [selectedTypeId, setSelectedTypeId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: types } = useContainerTypesQuery();
  const selectedTypeName =
    types?.find((type) => type.id === selectedTypeId)?.type_name_container ||
    "";

  const { data, isLoading, isError, isFetching } = useSensorsQuery(
    page,
    searchTerm,
    selectedTypeName
  );
  const sensors = data?.results ?? [];

  const totalPages = Math.ceil((data?.count ?? 0) / SENSORS_PER_PAGE);
  const start = (page - 1) * SENSORS_PER_PAGE;
  const currentSensors = sensors ?? [];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(page);
  };

  const handleFilterChange = (value: number) => {
    setSelectedTypeId(value);
    setPage(page);
  };

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
      <div className={styles.controls}>
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <FilterSelect
          options={
            types?.map((type) => ({
              id: type.id,
              name: type.type_name_container,
            })) || []
          }
          selectedValue={selectedTypeId}
          onChange={handleFilterChange}
          placeholder="Choose Type"
        />
      </div>

      <table className={styles.sensorsTable}>
        <thead>
          <tr>
            <th>Sensor Value</th>
            <th>Detected At</th>
            <th>Container Type</th>
            <th>Station Name</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentSensors?.map((sensor) => (
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
