import { useState } from "react";
import { useCollectionSchedulesQuery } from "../model/useCollectionSchedulesQuery";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { collectionScheduleApi } from "../api/schedulesApi";
import { UpdateCollectionScheduleForm } from "./UpdateCollectionScheduleForm";
import styles from "./CollectionSchedulesTable.module.scss";
import { Pagination } from "shared/ui/pagination/Pagination";
import { useSortableData } from "shared/utils/useSortableData";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";

const SCHEDULES_PER_PAGE = 8;

export const CollectionSchedulesTable = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<{
    id: number;
    schedule_date: string;
  } | null>(null);

  const {
    data: schedules,
    isLoading,
    isError,
    isFetching,
  } = useCollectionSchedulesQuery(page);

  const {
    sortedItems: sortedSchedules,
    sortBy,
    sortOrder,
    requestSort,
  } = useSortableData(schedules || []);

  const totalPages = Math.ceil(sortedSchedules.length / SCHEDULES_PER_PAGE);
  const currentSchedules = sortedSchedules.slice(
    (page - 1) * SCHEDULES_PER_PAGE,
    page * SCHEDULES_PER_PAGE
  );

  const handleOpenModal = (scheduleId: number, collectionDate: string) => {
    setSelectedSchedule({ id: scheduleId, schedule_date: collectionDate });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
    setIsModalOpen(false);
  };

  if (isLoading || isFetching) {
    return (
      <div className={styles.schedulesContainer}>
        <SpinnerLoading centered />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.schedulesContainer}>
        <div className={styles.error}>Error fetching collection schedules.</div>
      </div>
    );
  }

  return (
    <div className={styles.schedulesContainer}>
      <h1>Collection Schedules</h1>
      <table className={styles.schedulesTable}>
        <thead>
          <tr>
            <th onClick={() => requestSort("collection_date")}>
              Collection Date
            </th>
            <th
              onClick={() => requestSort("station.station_of_containers_name")}
            >
              Station Name
            </th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentSchedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{new Date(schedule.collection_date).toLocaleDateString()}</td>
              <td>
                {schedule.station?.station_of_containers_name || "No Station"}
              </td>
              <td>
                <button
                  className={styles.changeBtn}
                  onClick={() =>
                    handleOpenModal(schedule.id, schedule.collection_date)
                  }
                >
                  Update date
                </button>
              </td>
              <td>
                <DeleteButton
                  id={schedule.id}
                  deleteFn={collectionScheduleApi.deleteSchedule}
                  label="Schedule"
                  data={String(schedule.id)}
                  onSuccess={() => setPage(1)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
