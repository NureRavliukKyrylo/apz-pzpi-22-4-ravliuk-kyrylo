import { useState } from "react";
import { RolesTable } from "features/roles/ui/RolesTable";
import { UsersTable } from "features/users/ui/UserTable";
import styles from "./NavigationMenu.module.scss";
import { AddRoleForm } from "features/roles/ui/AddRoleForm";
import { AddButton } from "shared/ui/buttons/addButton/AddButton";

export const NavigationMenu = () => {
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [isAddRoleFormOpen, setIsAddRoleFormOpen] = useState(false);

  const handleTabChange = (tab: "roles" | "users") => {
    setActiveTab(tab);
  };

  const handleAddRoleClick = () => {
    setIsAddRoleFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddRoleFormOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>Admin</h1>
        <button
          className={`${styles.menuButton} ${
            activeTab === "roles" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("roles")}
        >
          Roles
        </button>
        <button
          className={`${styles.menuButton} ${
            activeTab === "users" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("users")}
        >
          Users
        </button>
        <AddButton onClick={handleAddRoleClick}>Add new role</AddButton>
      </div>

      <div className={styles.content}>
        {activeTab === "roles" ? <RolesTable /> : <UsersTable />}
      </div>
      <AddRoleForm isOpen={isAddRoleFormOpen} onClose={handleCloseModal} />
    </div>
  );
};
