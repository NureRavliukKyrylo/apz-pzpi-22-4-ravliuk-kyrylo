import { useState } from "react";
import { useContainerTypesParamsQuery } from "../model/useContainerTypesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { containerApi } from "../api/containersApi";
import { Pagination } from "shared/ui/pagination/Pagination";
import styles from "./ContainerTypesTable.module.scss";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateContainerTypeDataForm } from "./UpdateContainerTypeDataForm";
import { useTranslation } from "react-i18next";

const CONTAINERS_PER_PAGE = 8;

export const ContainerTypesTable = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } =
    useContainerTypesParamsQuery(page);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<{
    id: number;
    type_name_container: string;
    volume_container: number;
  } | null>(null);

  const containerTypes = data?.results ?? [];
  const totalPages = Math.ceil((data?.count ?? 0) / CONTAINERS_PER_PAGE);
  const currentTypes = containerTypes;

  if (isLoading) {
    return <SpinnerLoading centered />;
  }

  if (isError) {
    return <div className={styles.error}>{t("loadContainerTypesFailed")}</div>;
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
      <h1>{t("containerTypes")}</h1>
      <table className={styles.typesContainerTable}>
        <thead>
          <tr>
            <th>{t("typeName")}</th>
            <th>{t("volume")}</th>
            <th>{t("update")}</th>
            <th>{t("actions")}</th>
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
                  {t("updateType")}
                </button>
              </td>
              <td>
                <DeleteButton
                  id={type.id}
                  deleteFn={containerApi.deleteContainerType}
                  label={t("containerType")}
                  data={type.type_name_container}
                  onSuccess={() => {
                    const isLastItemOnPage =
                      currentTypes.length === 1 && page > 1;
                    setPage(isLastItemOnPage ? page - 1 : page);
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
