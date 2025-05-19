import { useState } from "react";
import { useSensorsQuery } from "../model/useSensorsQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { sensorApi } from "../api/sensorsApi";
import styles from "./SensorsTable.module.scss";
import { Pagination } from "shared/ui/pagination/Pagination";
import { useContainerTypesQuery } from "features/containers/model/useContainerTypesQuery";
import { SearchInput } from "shared/ui/seach/SearchInput";
import { FilterSelect } from "shared/ui/filter/FilterOption";
import { useTranslation } from "react-i18next";
import { parseUtcDate } from "shared/utils/parseData";

const SENSORS_PER_PAGE = 8;

export const SensorsTable = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedTypeId, setSelectedTypeId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [ordering, setOrdering] = useState("");

  const { data: types } = useContainerTypesQuery();
  const selectedTypeName =
    types?.find((type) => type.id === selectedTypeId)?.type_name_container ||
    "";

  const { data, isLoading, isError } = useSensorsQuery(
    page,
    searchTerm,
    selectedTypeName,
    ordering
  );

  const sensors = data?.results ?? [];
  const totalPages = Math.ceil((data?.count ?? 0) / SENSORS_PER_PAGE);
  const currentSensors = sensors ?? [];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(page);
  };

  const handleFilterChange = (value: number) => {
    setSelectedTypeId(value);
    setPage(page);
  };

  if (isError) {
    return (
      <div className={styles.sensorsContainer}>
        <div className={styles.error}>{t("errorFetchingSensors")}</div>
      </div>
    );
  }

  return (
    <div className={styles.sensorsContainer}>
      <h1>{t("sensors")}</h1>
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
          placeholder={t("chooseType")}
        />
      </div>

      {isLoading ? (
        <div className={styles.spinnerWrapper}>
          <SpinnerLoading centered />
        </div>
      ) : (
        <table className={styles.sensorsTable}>
          <thead>
            <tr>
              <th>{t("sensorValue")}</th>
              <th
                className={styles.sortableHeader}
                onClick={() => {
                  setPage(page);
                  setOrdering((prev) =>
                    prev === "time_of_detect"
                      ? "-time_of_detect"
                      : "time_of_detect"
                  );
                }}
              >
                {t("detectedAt")}
                {ordering === "time_of_detect" && " ↑"}
                {ordering === "-time_of_detect" && " ↓"}
              </th>
              <th>{t("containerType")}</th>
              <th>{t("stationName")}</th>
              <th>{t("delete")}</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((sensor) => (
              <tr key={sensor.id}>
                <td>{sensor.sensor_value}</td>
                <td>
                  {sensor.time_of_detect
                    ? parseUtcDate(sensor.time_of_detect)
                    : "—"}
                </td>
                <td>{sensor.containerTypeName}</td>
                <td>{sensor.stationName}</td>
                <td>
                  <DeleteButton
                    id={sensor.id}
                    deleteFn={sensorApi.deleteSensor}
                    label={t("sensor")}
                    data={`${sensor.stationName} ${sensor.containerTypeName}`}
                    onSuccess={() => {
                      const isLastItemOnPage =
                        currentSensors.length === 1 && page > 1;
                      setPage(isLastItemOnPage ? page - 1 : page);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
