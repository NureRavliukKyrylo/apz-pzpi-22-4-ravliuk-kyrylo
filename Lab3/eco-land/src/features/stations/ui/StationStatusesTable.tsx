import { useState } from "react";
import { useStationStatusesQuery } from "../model/useStationStatusesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateStationStatusNameForm } from "./UpdateStationStatusName";
import { Pagination } from "shared/ui/pagination/Pagination";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { stationApi } from "../api/stationsApi";
import styles from "./StationStatusesTable.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";

const STATUSES_PER_PAGE = 8;

export const StationStatusesTable = () => {
  const [page, setPage] = useState(1);
  const {
    data: statuses,
    isLoading,
    isError,
    isFetching,
  } = useStationStatusesQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    id: number;
    status_station_name: string;
  } | null>(null);
  const { clearError } = useErrorStore();

  const totalPages = Math.ceil((statuses?.length ?? 0) / STATUSES_PER_PAGE);
  const start = (page - 1) * STATUSES_PER_PAGE;
  const currentStatuses =
    statuses?.slice(start, start + STATUSES_PER_PAGE) ?? [];

  const handleOpenModal = (statusId: number, statusName: string) => {
    setSelectedStatus({ id: statusId, status_station_name: statusName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStatus(null);
    clearError();
  };

  if (isLoading || isFetching) {
    return (
      <div className={styles.stationStatusContainer}>
        <SpinnerLoading centered />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.stationStatusContainer}>
        <div className={styles.error}>Error fetching statuses.</div>
      </div>
    );
  }

  return (
    <div className={styles.stationStatusContainer}>
      <h1>Station Statuses</h1>
      <table className={styles.stationStatusTable}>
        <thead>
          <tr>
            <th>Status Name</th>
            <th>Actions</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentStatuses.map((status) => (
            <tr key={status.id}>
              <td>{status.station_status_name}</td>
              <td>
                <button
                  className={styles.changeBtn}
                  onClick={() =>
                    handleOpenModal(
                      Number(status.id),
                      status.station_status_name
                    )
                  }
                >
                  Change Status
                </button>
              </td>
              <td>
                <DeleteButton
                  id={status.id}
                  deleteFn={stationApi.deleteStationStatus}
                  label="Status"
                  data={status.station_status_name}
                  onSuccess={() => setPage(1)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalLayout isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedStatus && (
          <UpdateStationStatusNameForm
            statusId={selectedStatus.id}
            currentStatusName={selectedStatus.status_station_name}
            onClose={handleCloseModal}
            onSuccess={() => setPage(1)}
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
