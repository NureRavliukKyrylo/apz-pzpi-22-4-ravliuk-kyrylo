import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SensorsTable } from "features/sensors/ui/SensorsTable";
import { AddSensorForm } from "features/sensors/ui/AddSensorForm";
import styles from "../stations/NavigationMenu.module.scss";
import { AddButton } from "shared/ui/buttons/addButton/AddButton";
import { useErrorStore } from "entities/error/useErrorStore";
import { useContainersQuery } from "features/containers/model/useContainersQuery";

export const NavigationMenuSensors = () => {
  const { t } = useTranslation();
  const [isAddSensorFormOpen, setIsAddSensorFormOpen] = useState(false);
  const { clearError } = useErrorStore();

  const handleAddSensorClick = () => {
    setIsAddSensorFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddSensorFormOpen(false);
    clearError();
  };

  const { data: containers = [] } = useContainersQuery();

  const containerOptions = containers?.map((container) => ({
    id: container.id,
    name: `${container.typeName} (${container.stationName})`,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>{t("adminPanel")}</h1>

        <AddButton onClick={handleAddSensorClick}>
          {t("addNewSensor")}
        </AddButton>
      </div>

      <div className={styles.content}>
        <SensorsTable />

        {isAddSensorFormOpen && containerOptions != null && (
          <AddSensorForm
            isOpen={isAddSensorFormOpen}
            onClose={handleCloseModal}
            containerOptions={containerOptions}
          />
        )}
      </div>
    </div>
  );
};
