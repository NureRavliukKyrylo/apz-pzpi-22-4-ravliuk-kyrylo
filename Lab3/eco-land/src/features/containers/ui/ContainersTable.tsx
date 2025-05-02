import { useState } from "react";
import { useContainersParamsQuery } from "../model/useContainersQuery";
import { useContainerStatusesQuery } from "../model/useContainerStatusesQuery";
import { useContainerTypesQuery } from "../model/useContainerTypesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { Pagination } from "shared/ui/pagination/Pagination";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { containerApi } from "../api/containersApi";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateContainerTypeForm } from "./UpdateContainerTypeForm";
import { FilterSelect } from "shared/ui/filter/FilterOption";
import { SearchInput } from "shared/ui/seach/SearchInput";
import styles from "./ContainersTable.module.scss";
import { useTranslation } from "react-i18next";
import { parseUtcDate } from "shared/utils/parseData";

const CONTAINERS_PER_PAGE = 8;

export const ContainersTable = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState(0);
  const [selectedTypeId, setSelectedTypeId] = useState(0);
  const [ordering, setOrdering] = useState("");
  const { t } = useTranslation();

  const { data: statuses = [] } = useContainerStatusesQuery();
  const { data: types = [] } = useContainerTypesQuery();

  const selectedStatusName =
    statuses?.find((status) => status.id === selectedStatusId)?.status_name ||
    "";

  const selectedTypeName =
    types?.find((type) => type.id === selectedTypeId)?.type_name_container ||
    "";

  const { data, isLoading, isError, isFetching } = useContainersParamsQuery(
    page,
    searchTerm,
    selectedStatusName,
    selectedTypeName,
    ordering
  );

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

  const containers = data?.results ?? [];

  const totalPages = Math.ceil((data?.count ?? 0) / CONTAINERS_PER_PAGE);
  const currentContainers = containers ?? [];

  if (isError) {
    return (
      <div className={styles.containersContainer}>
        <div className={styles.error}>{t("errorFetchingContainers")}</div>
      </div>
    );
  }

  return (
    <div className={styles.containersContainer}>
      <h1>{t("containers")}</h1>

      <div className={styles.controls}>
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPage(page);
          }}
        />

        <FilterSelect
          options={
            statuses?.map((status) => ({
              id: status.id,
              name: status.status_name,
            })) || []
          }
          selectedValue={selectedStatusId}
          onChange={(val) => {
            setSelectedStatusId(val);
            setPage(page);
          }}
          placeholder={t("chooseStatus")}
        />

        <FilterSelect
          options={
            types?.map((type) => ({
              id: type.id,
              name: type.type_name_container,
            })) || []
          }
          selectedValue={selectedTypeId}
          onChange={(val) => {
            setSelectedTypeId(val);
            setPage(page);
          }}
          placeholder={t("chooseType")}
        />
      </div>

      {isLoading ? (
        <div className={styles.spinnerWrapper}>
          <SpinnerLoading centered />
        </div>
      ) : (
        <table className={styles.containersTable}>
          <thead>
            <tr>
              <th>{t("stations")}</th>
              <th>{t("fillLevel")}</th>
              <th>{t("volume")}</th>
              <th>{t("type")}</th>
              <th>{t("status")}</th>
              <th
                className={styles.sortableHeader}
                onClick={() => {
                  setPage(page);
                  setOrdering((prev) =>
                    prev === "last_updated" ? "-last_updated" : "last_updated"
                  );
                }}
              >
                {t("lastUpdated")}
                {ordering === "last_updated" && " ^ "}
                {ordering === "-last_updated" && " v"}
              </th>
              <th>{t("actions")}</th>
              <th>{t("delete")}</th>
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
                <td>
                  {container.last_updated
                    ? parseUtcDate(container.last_updated)
                    : "—"}
                </td>
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
                    {t("changeType")}
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
      )}

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
