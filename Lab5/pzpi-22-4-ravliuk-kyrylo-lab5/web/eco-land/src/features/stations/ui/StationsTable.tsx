import { useState } from "react";
import { useStationsQuery } from "../model/useStationsQuery";
import { useStationStatusesQuery } from "../model/useStationStatusesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateStationStatusForm } from "./UpdateStationStatusForm";
import { Pagination } from "shared/ui/pagination/Pagination";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { SearchInput } from "shared/ui/seach/SearchInput";
import { FilterSelect } from "shared/ui/filter/FilterOption";
import { stationApi } from "../api/stationsApi";
import { useStationsParamsQuery } from "../model/useStationsQuery";
import styles from "./StationsTable.module.scss";
import { useTranslation } from "react-i18next";
import { parseUtcDate } from "shared/utils/parseData";

const STATIONS_PER_PAGE = 8;

export const StationsTable = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState(0);
  const [ordering, setOrdering] = useState("");
  const { t } = useTranslation();
  const { data: statuses } = useStationStatusesQuery();
  const selectedStatusName =
    statuses?.find((status) => status.id === selectedStatusId)
      ?.station_status_name || "";

  const { data, isLoading, isError, isFetching } = useStationsParamsQuery(
    page,
    searchTerm,
    selectedStatusName,
    ordering
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<{
    id: number;
    status_station: number;
  } | null>(null);

  const stations = data?.results ?? [];

  const totalPages = Math.ceil((data?.count ?? 0) / STATIONS_PER_PAGE);
  const currentStations = stations ?? [];

  const handleOpenModal = (stationId: number, currentStatus: number) => {
    setSelectedStation({ id: stationId, status_station: currentStatus });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStation(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(page);
  };

  const handleFilterChange = (value: number) => {
    setSelectedStatusId(value);
    setPage(page);
  };

  if (isError) {
    return (
      <div className={styles.stationsContainer}>
        <div className={styles.error}>Error fetching stations.</div>
      </div>
    );
  }

  return (
    <div className={styles.stationsContainer}>
      <h1>{t("stations")}</h1>

      <div className={styles.controls}>
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <FilterSelect
          options={
            statuses?.map((status) => ({
              id: status.id,
              name: status.station_status_name,
            })) || []
          }
          selectedValue={selectedStatusId}
          onChange={handleFilterChange}
          placeholder={t("chooseStatus")}
        />
      </div>

      {isLoading ? (
        <div className={styles.spinnerWrapper}>
          <SpinnerLoading centered />
        </div>
      ) : (
        <table className={styles.stationsTable}>
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("latitude")}</th>
              <th>{t("longitude")}</th>
              <th
                className={styles.sortableHeader}
                onClick={() => {
                  setPage(page);
                  setOrdering((prev) =>
                    prev === "last_reserved"
                      ? "-last_reserved"
                      : "last_reserved"
                  );
                }}
              >
                {t("lastReserved")}
                {ordering === "last_reserved" && " ^ "}
                {ordering === "-last_reserved" && " v"}
              </th>
              <th>{t("status")}</th>
              <th>{t("actions")}</th>
              <th>{t("delete")}</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.id}>
                <td>{station.station_of_containers_name}</td>
                <td>{station.latitude_location}</td>
                <td>{station.longitude_location}</td>
                <td>
                  {station.last_reserved
                    ? parseUtcDate(station.last_reserved)
                    : "—"}
                </td>
                <td>
                  <span
                    className={`${styles.statusChip} ${
                      styles[station.statusName.toLowerCase()] || ""
                    }`}
                  >
                    {station.statusName}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.changeBtn}
                    onClick={() =>
                      handleOpenModal(
                        Number(station.id),
                        station.status_station
                      )
                    }
                  >
                    {t("changeStatus")}
                  </button>
                </td>
                <td>
                  <DeleteButton
                    id={station.id}
                    deleteFn={stationApi.deleteStation}
                    label="Station"
                    data={station.station_of_containers_name}
                    onSuccess={() => {
                      const isLastItemOnPage =
                        currentStations.length === 1 && page > 1;
                      setPage(isLastItemOnPage ? page - 1 : page);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ModalLayout isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedStation && (
          <UpdateStationStatusForm
            stationId={selectedStation.id}
            currentStatus={selectedStation.status_station}
            onClose={handleCloseModal}
          />
        )}
      </ModalLayout>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};
