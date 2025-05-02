import { useState } from "react";
import { useErrorStore } from "entities/error/useErrorStore";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { useUpdateContainerStatusName } from "../model/useUpdateContainerStatus";
import { AxiosError } from "axios";
import styles from "./UpdateContainerStatusNameForm.module.scss";
import { useTranslation } from "react-i18next";

type UpdateContainerStatusNameFormProps = {
  statusId: number;
  currentStatusName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export const UpdateContainerStatusNameForm = ({
  statusId,
  currentStatusName,
  onClose,
  onSuccess,
}: UpdateContainerStatusNameFormProps) => {
  const { t } = useTranslation();
  const [statusName, setStatusName] = useState(currentStatusName);
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useUpdateContainerStatusName();

  const handleUpdate = () => {
    if (!statusName.trim()) {
      setError(t("statusNameEmpty"));
      return;
    }

    mutate(
      { statusId, status_name: statusName },
      {
        onSuccess: () => {
          clearError();
          onSuccess();
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error || error.response?.data?.message;
            setError(detail ?? t("updateStatusFailed"));
          } else {
            setError(t("unexpectedError"));
          }
        },
      }
    );
  };

  return (
    <div className={styles.formContainer}>
      <h2>{t("editContainerStatus")}</h2>
      <div className={styles.inputBlock}>
        <input
          type="text"
          value={statusName}
          onChange={(e) => setStatusName(e.target.value)}
          placeholder={t("enterNewStatusName")}
          disabled={isPending}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonContainer}>
        <button onClick={handleUpdate} disabled={isPending}>
          {isPending ? <SpinnerLoading /> : t("updateStatus")}
        </button>
      </div>
    </div>
  );
};
