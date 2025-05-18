import { useState } from "react";
import { useStationStatusesParamsQuery } from "../model/useStationStatusesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateStationStatusNameForm } from "./UpdateStationStatusName";
import { Pagination } from "shared/ui/pagination/Pagination";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { stationApi } from "../api/stationsApi";
import styles from "./StationStatusesTable.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";
import { useTranslation } from "react-i18next";

const STATUSES_PER_PAGE = 8;

export const StationStatusesTable = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } =
    useStationStatusesParamsQuery(page);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    id: number;
    status_station_name: string;
  } | null>(null);
  const { clearError } = useErrorStore();
  const { t } = useTranslation();

  const statuses = data?.results ?? [];
  const totalPages = Math.ceil((data?.count ?? 0) / STATUSES_PER_PAGE);
  const start = (page - 1) * STATUSES_PER_PAGE;
  const currentStatuses = statuses ?? [];

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
        <div className={styles.error}>{t("errorFetchingStatuses")}</div>
      </div>
    );
  }

  return (
    <div className={styles.stationStatusContainer}>
      <h1>{t("stationStatuses")}</h1>
      <table className={styles.stationStatusTable}>
        <thead>
          <tr>
            <th>{t("statusName")}</th>
            <th>{t("actions")}</th>
            <th>{t("delete")}</th>
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
                  {t("changeStatus")}
                </button>
              </td>
              <td>
                <DeleteButton
                  id={status.id}
                  deleteFn={stationApi.deleteStationStatus}
                  label={t("status")}
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
