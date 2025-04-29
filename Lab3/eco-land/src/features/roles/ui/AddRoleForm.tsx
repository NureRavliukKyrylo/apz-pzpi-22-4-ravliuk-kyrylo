import { useState } from "react";
import { rolesApi } from "../api/rolesApi";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import styles from "./AddRoleForm.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";

type AddRoleFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddRoleForm = ({ isOpen, onClose }: AddRoleFormProps) => {
  const [roleName, setRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError } = useErrorStore();
  const queryClient = useQueryClient();

  const handleAddRole = async () => {
    if (roleName.trim() === "") {
      setError("Role name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      await rolesApi.addRole(roleName);

      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["rolesAll"] });

      setRoleName("");
      setError("");
      onClose();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Axios error response:", error.response);

        const detail =
          error.response?.data?.error || error.response?.data?.message;

        if (detail) {
          setError(detail);
        } else {
          setError("Failed to add role.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>Add New Role</h2>
        <input
          type="text"
          placeholder="Enter role name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleAddRole}
          disabled={isLoading}
          className={styles.button}
        >
          {isLoading ? "Adding..." : "Add Role"}
        </button>
      </div>
    </ModalLayout>
  );
};
