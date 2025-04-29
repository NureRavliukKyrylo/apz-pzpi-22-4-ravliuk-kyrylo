import { useState } from "react";
import { CollectionSchedulesTable } from "features/schedules/ui/CollectionSchedulesTable";
import { AddScheduleForm } from "features/schedules/ui/AddScheduleForm";
import styles from "../stations/NavigationMenu.module.scss";
import { AddButton } from "shared/ui/buttons/addButton/AddButton";
import { useErrorStore } from "entities/error/useErrorStore";
import { useStationsQuery } from "features/stations/model/useStationsQuery";

export const NavigationMenuSchedules = () => {
  const [isAddScheduleFormOpen, setIsAddScheduleFormOpen] = useState(false);
  const { clearError } = useErrorStore();

  const handleAddScheduleClick = () => {
    setIsAddScheduleFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddScheduleFormOpen(false);
    clearError();
  };

  const { data: stations = [] } = useStationsQuery();

  const stationOptions = stations?.map((station) => ({
    id: station.id,
    name: station.station_of_containers_name,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>Collection Schedules</h1>

        <AddButton onClick={handleAddScheduleClick}>Add New Schedule</AddButton>
      </div>

      <div className={styles.content}>
        <CollectionSchedulesTable />
        {isAddScheduleFormOpen && stationOptions != null && (
          <AddScheduleForm
            isOpen={isAddScheduleFormOpen}
            onClose={handleCloseModal}
            stations={stationOptions}
          />
        )}
      </div>
    </div>
  );
};
