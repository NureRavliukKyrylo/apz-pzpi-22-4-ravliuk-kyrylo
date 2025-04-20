import { useState } from "react";
import { useStationsQuery } from "../model/useStationsQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateStationStatusForm } from "./UpdateStationStatusForm";
import { Pagination } from "shared/ui/pagination/Pagination";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { stationApi } from "../api/stationsApi";
import styles from "./StationsTable.module.scss";

const STATIONS_PER_PAGE = 8;

export const StationsTable = () => {
  const [page, setPage] = useState(1);
  const { data: stations, isLoading, isError, isFetching } = useStationsQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<{
    id: number;
    status_station: number;
  } | null>(null);

  const totalPages = Math.ceil((stations?.length ?? 0) / STATIONS_PER_PAGE);
  const start = (page - 1) * STATIONS_PER_PAGE;
  const currentStations =
    stations?.slice(start, start + STATIONS_PER_PAGE) ?? [];

  const handleOpenModal = (stationId: number, currentStatus: number) => {
    setSelectedStation({ id: stationId, status_station: currentStatus });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStation(null);
  };

  if (isLoading || isFetching) {
    return (
      <div className={styles.stationsContainer}>
        <SpinnerLoading centered />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.stationsContainer}>
        <div className={styles.error}>Error fetching stations.</div>
      </div>
    );
  }

  return (
    <div className={styles.stationsContainer}>
      <h1>Stations</h1>
      <table className={styles.stationsTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Last Reserved</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentStations.map((station) => (
            <tr key={station.id}>
              <td>{station.station_of_containers_name}</td>
              <td>{station.latitude_location}</td>
              <td>{station.longitude_location}</td>
              <td>{station.last_reserved}</td>
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
                    handleOpenModal(Number(station.id), station.status_station)
                  }
                >
                  Change Status
                </button>
              </td>
              <td>
                <DeleteButton
                  id={station.id}
                  deleteFn={stationApi.deleteStation}
                  label="Station"
                  data={station.station_of_containers_name}
                  onSuccess={() => setPage(1)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
