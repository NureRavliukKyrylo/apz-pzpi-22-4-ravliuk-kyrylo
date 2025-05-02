import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StationsTable } from "features/stations/ui/StationsTable";
import { StationStatusesTable } from "features/stations/ui/StationStatusesTable";
import styles from "./NavigationMenu.module.scss";
import { AddStationStatusForm } from "features/stations/ui/AddStationStatusForm";
import { AddStationForm } from "features/stations/ui/AddStationForm";
import { useStationStatusesQuery } from "features/stations/model/useStationStatusesQuery";
import { AddButton } from "shared/ui/buttons/addButton/AddButton";
import { useErrorStore } from "entities/error/useErrorStore";

export const NavigationMenuStations = () => {
  const { t } = useTranslation();
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
        <h1>{t("adminPanel")}</h1>
        <button
          className={`${styles.menuButton} ${
            activeTab === "stations" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("stations")}
        >
          {t("stations")}
        </button>
        <button
          className={`${styles.menuButton} ${
            activeTab === "statuses" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("statuses")}
        >
          {t("statuses")}
        </button>
        <AddButton onClick={handleAddStationClick}>
          {t("addNewStation")}
        </AddButton>
        <AddButton onClick={handleAddStatusClick}>
          {t("addNewStatus")}
        </AddButton>
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
