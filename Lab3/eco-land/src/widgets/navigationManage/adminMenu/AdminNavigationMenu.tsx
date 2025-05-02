import { useState } from "react";
import styles from "../stations/NavigationMenu.module.scss";
import WasteHistoryWidget from "widgets/wasteHistory/WasteHistoryWidget";
import { useTranslation } from "react-i18next";

export const NavigationMenuAdmin = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>{t("adminPanel")}</h1>
      </div>

      <div className={styles.content}>
        <WasteHistoryWidget />
      </div>
    </div>
  );
};
