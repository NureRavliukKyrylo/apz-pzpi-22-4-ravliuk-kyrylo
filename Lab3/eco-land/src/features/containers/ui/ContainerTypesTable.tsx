import { useState } from "react";
import { useContainerTypesQuery } from "../model/useContainerTypesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { containerApi } from "../api/containersApi";
import { Pagination } from "shared/ui/pagination/Pagination";
import styles from "./ContainerTypesTable.module.scss";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateContainerTypeDataForm } from "./UpdateContainerTypeDataForm";

const CONTAINERS_PER_PAGE = 8;

export const ContainerTypesTable = () => {
  const [page, setPage] = useState(1);
  const { data: types, isLoading, isError, refetch } = useContainerTypesQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<{
    id: number;
    type_name_container: string;
    volume_container: number;
  } | null>(null);

  const totalPages = Math.ceil((types?.length ?? 0) / CONTAINERS_PER_PAGE);
  const start = (page - 1) * CONTAINERS_PER_PAGE;
  const currentTypes = types?.slice(start, start + CONTAINERS_PER_PAGE) ?? [];

  if (isLoading) {
    return <SpinnerLoading centered />;
  }

  if (isError) {
    return <div className={styles.error}>Failed to load container types</div>;
  }

  const handleOpenModal = (
    typeId: number,
    currentTypeName: string,
    currentVolume: number
  ) => {
    setSelectedType({
      id: typeId,
      type_name_container: currentTypeName,
      volume_container: currentVolume,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedType(null);
    setIsModalOpen(false);
  };

  return (
    <div className={styles.typesContainer}>
      <h1>Container Types</h1>
      <table className={styles.typesContainerTable}>
        <thead>
          <tr>
            <th>Type Name</th>
            <th>Volume</th>
            <th>Update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTypes.map((type) => (
            <tr key={type.id}>
              <td>{type.type_name_container}</td>
              <td>{type.volume_container} л</td>
              <td>
                <button
                  onClick={() =>
                    handleOpenModal(
                      type.id,
                      type.type_name_container,
                      type.volume_container
                    )
                  }
                  className={styles.changeBtn}
                >
                  Update Type
                </button>
              </td>
              <td>
                <DeleteButton
                  id={type.id}
                  deleteFn={containerApi.deleteContainerType}
                  label="Container Type"
                  data={type.type_name_container}
                  onSuccess={() => {
                    refetch();
                    setPage(1);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalLayout isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedType && (
          <UpdateContainerTypeDataForm
            typeId={selectedType.id}
            currentTypeName={selectedType.type_name_container}
            currentVolume={selectedType.volume_container}
            onClose={handleCloseModal}
            onSuccess={() => {
              refetch();
              handleCloseModal();
            }}
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
