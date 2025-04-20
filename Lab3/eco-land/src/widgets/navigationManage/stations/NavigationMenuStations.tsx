import { useState } from "react";
import { StationsTable } from "features/stations/ui/StationsTable";
import { StationStatusesTable } from "features/stations/ui/StationStatusesTable";
import styles from "./NavigationMenu.module.scss";
import { AddStationStatusForm } from "features/stations/ui/AddStationStatusForm";
import { AddStationForm } from "features/stations/ui/AddStationForm";
import { useStationStatusesQuery } from "features/stations/model/useStationStatusesQuery";
import { AddButton } from "shared/ui/buttons/addButton/AddButton";
import { useErrorStore } from "entities/error/useErrorStore";

export const NavigationMenuStations = () => {
  const [activeTab, setActiveTab] = useState<"stations" | "statuses">(
    "stations"
  );
  const [isAddStationFormOpen, setIsAddStationFormOpen] = useState(false);
  const [isAddStatusFormOpen, setIsAddStatusFormOpen] = useState(false);
  const { clearError } = useErrorStore();

  const handleTabChange = (tab: "stations" | "statuses") => {
    setActiveTab(tab);
  };

  const handleAddStationClick = () => {
    setIsAddStationFormOpen(true);
  };

  const handleAddStatusClick = () => {
    setIsAddStatusFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddStationFormOpen(false);
    setIsAddStatusFormOpen(false);
    clearError();
  };

  const { data: statuses = [] } = useStationStatusesQuery();

  const statusOptions = (statuses ?? []).map((status) => ({
    id: status.id,
    name: status.station_status_name,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>Admin</h1>
        <button
          className={`${styles.menuButton} ${
            activeTab === "stations" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("stations")}
        >
          Stations
        </button>
        <button
          className={`${styles.menuButton} ${
            activeTab === "statuses" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("statuses")}
        >
          Statuses
        </button>
        <AddButton onClick={handleAddStationClick}>Add new station</AddButton>
        <AddButton onClick={handleAddStatusClick}>Add new status</AddButton>
      </div>

      <div className={styles.content}>
        {activeTab === "stations" ? (
          <StationsTable />
        ) : (
          <StationStatusesTable />
        )}

        {isAddStationFormOpen && (
          <AddStationForm
            isOpen={isAddStationFormOpen}
            onClose={handleCloseModal}
            statusOptions={statusOptions}
          />
        )}

        {isAddStatusFormOpen && (
          <AddStationStatusForm
            isOpen={isAddStatusFormOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};
