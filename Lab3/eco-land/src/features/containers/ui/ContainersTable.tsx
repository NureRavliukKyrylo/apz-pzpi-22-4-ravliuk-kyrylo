import { useState } from "react";
import { useContainersQuery } from "../model/useContainersQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { Pagination } from "shared/ui/pagination/Pagination";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { containerApi } from "../api/containersApi";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateContainerTypeForm } from "./UpdateContainerTypeForm";
import styles from "./ContainersTable.module.scss";

const CONTAINERS_PER_PAGE = 8;

export const ContainersTable = () => {
  const [page, setPage] = useState(1);
  const {
    data: containers,
    isLoading,
    isError,
    isFetching,
  } = useContainersQuery(page);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<{
    id: number;
    type_of_container_id: number;
  } | null>(null);

  const handleOpenModal = (containerId: number, currentType: number) => {
    setSelectedContainer({
      id: containerId,
      type_of_container_id: currentType,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedContainer(null);
    setIsModalOpen(false);
  };

  const totalPages = Math.ceil((containers?.length ?? 0) / CONTAINERS_PER_PAGE);
  const start = (page - 1) * CONTAINERS_PER_PAGE;
  const currentContainers =
    containers?.slice(start, start + CONTAINERS_PER_PAGE) ?? [];

  if (isLoading || isFetching) {
    return (
      <div className={styles.containersContainer}>
        <SpinnerLoading centered />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.containersContainer}>
        <div className={styles.error}>Error fetching containers.</div>
      </div>
    );
  }

  return (
    <div className={styles.containersContainer}>
      <h1>Containers</h1>
      <table className={styles.containersTable}>
        <thead>
          <tr>
            <th>Station</th>
            <th>Fill Level</th>
            <th>Volume</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentContainers.map((container) => (
            <tr key={container.id}>
              <td>{container.stationName}</td>
              <td>{container.fill_level}%</td>
              <td>{container.volume} л</td>
              <td>{container.typeName}</td>
              <td>
                <span
                  className={`${styles.statusChip} ${
                    styles[container.statusName.toLowerCase()] || ""
                  }`}
                >
                  {container.statusName}
                </span>
              </td>
              <td>{new Date(container.last_updated).toLocaleString()}</td>
              <td>
                <button
                  className={styles.changeBtn}
                  onClick={() =>
                    handleOpenModal(
                      container.id,
                      container.type_of_container_id
                    )
                  }
                >
                  Change Type
                </button>
              </td>
              <td>
                <DeleteButton
                  id={container.id}
                  deleteFn={containerApi.deleteContainer}
                  label="Container"
                  data={`#${container.id}`}
                  onSuccess={() => setPage(1)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalLayout isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedContainer && (
          <UpdateContainerTypeForm
            containerId={selectedContainer.id}
            currentType={selectedContainer.type_of_container_id}
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
