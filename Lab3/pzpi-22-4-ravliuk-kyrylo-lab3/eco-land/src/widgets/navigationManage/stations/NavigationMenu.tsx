import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RolesTable } from "features/roles/ui/RolesTable";
import { UsersTable } from "features/users/ui/UserTable";
import styles from "./NavigationMenu.module.scss";
import { AddRoleForm } from "features/roles/ui/AddRoleForm";
import { AddButton } from "shared/ui/buttons/addButton/AddButton";
import { useErrorStore } from "entities/error/useErrorStore";

export const NavigationMenu = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [isAddRoleFormOpen, setIsAddRoleFormOpen] = useState(false);
  const { clearError } = useErrorStore();

  const handleTabChange = (tab: "roles" | "users") => {
    setActiveTab(tab);
  };

  const handleAddRoleClick = () => {
    setIsAddRoleFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddRoleFormOpen(false);
    clearError();
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>{t("adminPanel")}</h1>
        <button
          className={`${styles.menuButton} ${
            activeTab === "roles" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("roles")}
        >
          {t("roles")}
        </button>
        <button
          className={`${styles.menuButton} ${
            activeTab === "users" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("users")}
        >
          {t("users")}
        </button>
        <AddButton onClick={handleAddRoleClick}>{t("addNewRole")}</AddButton>
      </div>

      <div className={styles.content}>
        {activeTab === "roles" ? <RolesTable /> : <UsersTable />}
      </div>
      <AddRoleForm isOpen={isAddRoleFormOpen} onClose={handleCloseModal} />
    </div>
  );
};
