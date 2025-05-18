import { useState } from "react";
import styles from "../stations/NavigationMenu.module.scss";
import WasteHistoryWidget from "widgets/wasteHistory/WasteHistoryWidget";
import { useTranslation } from "react-i18next";
import { AddButton } from "shared/ui/buttons/addButton/AddButton";
import { downloadBackupDB } from "features/histories/model/backupDB";

export const NavigationMenuAdmin = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>{t("adminPanel")}</h1>
        <AddButton onClick={() => downloadBackupDB()}>{t("backup")}</AddButton>
      </div>

      <div className={styles.content}>
        <WasteHistoryWidget />
      </div>
    </div>
  );
};
