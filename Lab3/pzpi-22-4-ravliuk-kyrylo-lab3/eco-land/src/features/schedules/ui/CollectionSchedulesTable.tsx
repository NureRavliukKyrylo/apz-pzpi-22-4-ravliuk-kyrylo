import { useState } from "react";
import { useCollectionSchedulesQuery } from "../model/useCollectionSchedulesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { collectionScheduleApi } from "../api/schedulesApi";
import { UpdateCollectionScheduleForm } from "./UpdateCollectionScheduleForm";
import styles from "./CollectionSchedulesTable.module.scss";
import { Pagination } from "shared/ui/pagination/Pagination";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { SearchInput } from "shared/ui/seach/SearchInput";
import { useTranslation } from "react-i18next";
import { parseUtcDate } from "shared/utils/parseData";

const SCHEDULES_PER_PAGE = 8;

export const CollectionSchedulesTable = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<{
    id: number;
    schedule_date: string;
  } | null>(null);
  const [ordering, setOrdering] = useState("");

  const { data, isLoading, isError, isFetching } = useCollectionSchedulesQuery(
    page,
    searchTerm,
    ordering
  );

  const schedules = data?.results ?? [];

  const totalPages = Math.ceil((data?.count ?? 0) / SCHEDULES_PER_PAGE);
  const start = (page - 1) * SCHEDULES_PER_PAGE;
  const currentSchedules = schedules ?? [];

  const handleOpenModal = (scheduleId: number, collectionDate: string) => {
    setSelectedSchedule({ id: scheduleId, schedule_date: collectionDate });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
    setIsModalOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(page);
  };

  if (isError) {
    return (
      <div className={styles.schedulesContainer}>
        <div className={styles.error}>{t("errorFetchingSchedules")}</div>
      </div>
    );
  }

  return (
    <div className={styles.schedulesContainer}>
      <h1>{t("collectionSchedules")}</h1>
      <div className={styles.controls}>
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>

      {isLoading ? (
        <div className={styles.spinnerWrapper}>
          <SpinnerLoading centered />
        </div>
      ) : (
        <table className={styles.schedulesTable}>
          <thead>
            <tr>
              <th
                className={styles.sortableHeader}
                onClick={() => {
                  setPage(page);
                  setOrdering((prev) =>
                    prev === "collection_date"
                      ? "-collection_date"
                      : "collection_date"
                  );
                }}
              >
                {t("collectionDate")}
                {ordering === "collection_date" && " ^ "}
                {ordering === "-collection_date" && " v"}
              </th>
              <th>{t("stationName")}</th>
              <th>{t("update")}</th>
              <th>{t("delete")}</th>
            </tr>
          </thead>
          <tbody>
            {currentSchedules.map((schedule) => (
              <tr key={schedule.id}>
                <td>
                  {schedule.collection_date
                    ? parseUtcDate(schedule.collection_date)
                    : "—"}
                </td>
                <td>
                  {schedule.station?.station_of_containers_name ||
                    t("noStation")}
                </td>
                <td>
                  <button
                    className={styles.changeBtn}
                    onClick={() =>
                      handleOpenModal(schedule.id, schedule.collection_date)
                    }
                  >
                    {t("updateDate")}
                  </button>
                </td>
                <td>
                  <DeleteButton
                    id={schedule.id}
                    deleteFn={collectionScheduleApi.deleteSchedule}
                    label={t("schedule")}
                    data={`${schedule.station?.station_of_containers_name}`}
                    onSuccess={() => {
                      const isLastItemOnPage =
                        currentSchedules.length === 1 && page > 1;
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

      <ModalLayout isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedSchedule && (
          <UpdateCollectionScheduleForm
            scheduleId={selectedSchedule.id}
            currentDate={selectedSchedule.schedule_date}
            onClose={handleCloseModal}
          />
        )}
      </ModalLayout>
    </div>
  );
};
