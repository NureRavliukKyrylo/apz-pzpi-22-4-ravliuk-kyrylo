import { useState } from "react";
import { rolesApi } from "../api/rolesApi";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import styles from "./UpdateRoleForm.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";
import { AxiosError } from "axios";

type UpdateRoleFormProps = {
  roleId: number;
  currentRoleName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export const UpdateRoleForm = ({
  roleId,
  currentRoleName,
  onClose,
  onSuccess,
}: UpdateRoleFormProps) => {
  const [roleName, setRoleName] = useState(currentRoleName);
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError } = useErrorStore();

  const handleChangeRoleName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoleName(event.target.value);
  };

  const handleUpdateRole = async () => {
    if (!roleName) {
      setError("Role name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await rolesApi.updateRole(roleId, roleName);
      onSuccess();
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
    <div className={styles.formContainer}>
      <h2>Edit Role</h2>
      <div className={styles.inputBlock}>
        <input
          type="text"
          value={roleName}
          onChange={handleChangeRoleName}
          placeholder="Enter new role name"
          disabled={isLoading}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonContainer}>
        <button onClick={handleUpdateRole} disabled={isLoading}>
          {isLoading ? <SpinnerLoading /> : "Update Role"}
        </button>
      </div>
    </div>
  );
};
