import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContainersTable } from "features/containers/ui/ContainersTable";
import { AddContainerForm } from "features/containers/ui/AddContainerForm";
import { AddButton } from "shared/ui/buttons/addButton/AddButton";
import { useErrorStore } from "entities/error/useErrorStore";
import styles from "../stations/NavigationMenu.module.scss";
import { useContainerStatusesQuery } from "features/containers/model/useContainerStatusesQuery";
import { useContainerTypesQuery } from "features/containers/model/useContainerTypesQuery";
import { ContainerStatusesTable } from "features/containers/ui/ContainerStatusesTable";
import { ContainerTypesTable } from "features/containers/ui/ContainerTypesTable";
import { AddContainerStatusForm } from "features/containers/ui/AddContainerStatusForm";
import { AddContainerTypeForm } from "features/containers/ui/AddContainerTypeForm";
import { useStationsQuery } from "features/stations/model/useStationsQuery";

export const NavigationMenuContainers = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "containers" | "statuses" | "types"
  >("containers");
  const [isAddContainerFormOpen, setIsAddContainerFormOpen] = useState(false);
  const [isAddContainerStatusFormOpen, setIsAddContainerStatusFormOpen] =
    useState(false);
  const [isAddContainerTypeFormOpen, setIsAddContainerTypeFormOpen] =
    useState(false);
  const { clearError } = useErrorStore();

  const handleAddContainerClick = () => {
    setIsAddContainerFormOpen(true);
  };

  const handleAddContainerStatusClick = () => {
    setIsAddContainerStatusFormOpen(true);
  };

  const handleAddContainerTypeClick = () => {
    setIsAddContainerTypeFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddContainerFormOpen(false);
    setIsAddContainerStatusFormOpen(false);
    setIsAddContainerTypeFormOpen(false);
    clearError();
  };

  const handleTabChange = (tab: "containers" | "statuses" | "types") => {
    setActiveTab(tab);
  };

  const { data: typeData = [] } = useContainerTypesQuery();
  const { data: stations = [] } = useStationsQuery();
  const { data: statusesData = [] } = useContainerStatusesQuery();

  const typeOptions = (typeData ?? []).map((t) => ({
    id: t.id,
    name: t.type_name_container,
  }));

  const stationOptions = (stations ?? []).map((station) => ({
    id: station.id,
    name: station.station_of_containers_name,
  }));

  const statusOptions = (statusesData ?? []).map((status) => ({
    id: status.id,
    name: status.status_name,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>{t("adminPanel")}</h1>
        <button
          className={`${styles.menuButton} ${
            activeTab === "containers" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("containers")}
        >
          {t("containers")}
        </button>

        <button
          className={`${styles.menuButton} ${
            activeTab === "statuses" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("statuses")}
        >
          {t("statuses")}
        </button>

        <button
          className={`${styles.menuButton} ${
            activeTab === "types" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("types")}
        >
          {t("types")}
        </button>

        <AddButton onClick={handleAddContainerClick}>
          {t("addNewContainer")}
        </AddButton>
        <AddButton onClick={handleAddContainerStatusClick}>
          {t("addNewContainerStatus")}
        </AddButton>
        <AddButton onClick={handleAddContainerTypeClick}>
          {t("addNewContainerType")}
        </AddButton>
      </div>

      <div className={styles.content}>
        {activeTab === "containers" && <ContainersTable />}
        {activeTab === "statuses" && <ContainerStatusesTable />}
        {activeTab === "types" && <ContainerTypesTable />}

        {isAddContainerFormOpen && (
          <AddContainerForm
            isOpen={isAddContainerFormOpen}
            onClose={handleCloseModal}
            stationOptions={stationOptions}
            typeOptions={typeOptions}
            statusOptions={statusOptions}
          />
        )}

        {isAddContainerStatusFormOpen && (
          <AddContainerStatusForm
            isOpen={isAddContainerStatusFormOpen}
            onClose={handleCloseModal}
          />
        )}

        {isAddContainerTypeFormOpen && (
          <AddContainerTypeForm
            isOpen={isAddContainerTypeFormOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};
