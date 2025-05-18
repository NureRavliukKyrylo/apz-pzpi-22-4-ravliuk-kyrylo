import { useState } from "react";
import { useContainerStatusesParamsQuery } from "../model/useContainerStatusesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { containerApi } from "../api/containersApi";
import { Pagination } from "shared/ui/pagination/Pagination";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateContainerStatusNameForm } from "./UpdateContainerStatusNameForm";
import styles from "./ContainerStatusesTable.module.scss";
import { useTranslation } from "react-i18next";

const STATUS_PER_PAGE = 8;

export const ContainerStatusesTable = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    id: number;
    status_name: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } =
    useContainerStatusesParamsQuery(page);

  const containerStatuses = data?.results ?? [];
  const totalPages = Math.ceil((data?.count ?? 0) / STATUS_PER_PAGE);
  const start = (page - 1) * STATUS_PER_PAGE;
  const currentStatuses = containerStatuses ?? [];

  if (isLoading) {
    return <SpinnerLoading centered />;
  }

  if (isError) {
    return <div className={styles.error}>{t("loadStatusesError")}</div>;
  }

  const handleOpenModal = (statusId: number, currentStatusName: string) => {
    setSelectedStatus({ id: statusId, status_name: currentStatusName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStatus(null);
    setIsModalOpen(false);
  };

  return (
    <div className={styles.statusesContainer}>
      <h1>{t("containerStatuses")}</h1>
      <table className={styles.statusesContainerTable}>
        <thead>
          <tr>
            <th>{t("statusName")}</th>
            <th>{t("update")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {currentStatuses.map((status) => (
            <tr key={status.id}>
              <td>{status.status_name}</td>
              <td>
                <button
                  onClick={() => handleOpenModal(status.id, status.status_name)}
                  className={styles.changeBtn}
                >
                  {t("updateStatus")}
                </button>
              </td>
              <td>
                <DeleteButton
                  id={status.id}
                  deleteFn={containerApi.deleteContainerStatus}
                  label={t("status")}
                  data={status.status_name}
                  onSuccess={() => refetch()}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ModalLayout isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedStatus && (
          <UpdateContainerStatusNameForm
            statusId={selectedStatus.id}
            currentStatusName={selectedStatus.status_name}
            onClose={handleCloseModal}
            onSuccess={() => {
              refetch();
              handleCloseModal();
            }}
          />
        )}
      </ModalLayout>
    </div>
  );
};
