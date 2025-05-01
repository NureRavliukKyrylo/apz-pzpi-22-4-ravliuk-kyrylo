import { useState } from "react";
import styles from "../stations/NavigationMenu.module.scss";
import WasteHistoryWidget from "widgets/wasteHistory/WasteHistoryWidget";

export const NavigationMenuAdmin = () => {
  const [activeTab, setActiveTab] = useState<"history" | "database">("history");

  const handleTabChange = (tab: "history" | "database") => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>Waste</h1>

        <button
          className={`${styles.menuButton} ${
            activeTab === "history" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("history")}
        >
          History
        </button>

        <button
          className={`${styles.menuButton} ${
            activeTab === "database" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("database")}
        >
          Database
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "history" && <WasteHistoryWidget />}
        {activeTab === "database" && <p>Database — у розробці</p>}
      </div>
    </div>
  );
};
