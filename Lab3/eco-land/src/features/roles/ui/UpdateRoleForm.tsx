import { useState } from "react";
import { rolesApi } from "../api/rolesApi";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import styles from "./UpdateRoleForm.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleChangeRoleName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoleName(event.target.value);
  };

  const handleUpdateRole = async () => {
    if (!roleName.trim()) {
      setError(t("errorEmptyRoleName"));
      return;
    }

    setIsLoading(true);
    try {
      await rolesApi.updateRole(roleId, roleName);

      queryClient.invalidateQueries({ queryKey: ["roles"] });

      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof AxiosError) {
        const detail =
          error.response?.data?.error || error.response?.data?.message;
        setError(detail ?? t("errorUpdateRole"));
      } else {
        setError(t("unexpectedError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>{t("editRole")}</h2>
      <div className={styles.inputBlock}>
        <input
          type="text"
          value={roleName}
          onChange={handleChangeRoleName}
          placeholder={t("enterNewRoleName")}
          disabled={isLoading}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonContainer}>
        <button onClick={handleUpdateRole} disabled={isLoading}>
          {isLoading ? <SpinnerLoading /> : t("updateRole")}
        </button>
      </div>
    </div>
  );
};
