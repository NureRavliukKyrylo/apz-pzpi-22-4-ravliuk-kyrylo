import { useState } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import styles from "./AddStationStatusForm.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";
import { useAddStationStatus } from "../model/useAddStationStatus";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type AddStationStatusFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddStationStatusForm = ({
  isOpen,
  onClose,
}: AddStationStatusFormProps) => {
  const [statusName, setStatusName] = useState("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddStationStatus();
  const { t } = useTranslation();

  const handleAddStatus = () => {
    if (statusName.trim() === "") {
      setError(t("statusNameEmpty"));
      return;
    }

    mutate(statusName, {
      onSuccess: () => {
        clearError();
        setStatusName("");
        onClose();
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          const detail =
            error.response?.data?.error || error.response?.data?.message;
          setError(detail ?? t("errorAddStatus"));
        } else {
          setError(t("unexpectedError"));
        }
      },
    });
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>{t("addNewStationStatus")}</h2>
        <input
          type="text"
          placeholder={t("enterStatusName")}
          value={statusName}
          onChange={(e) => setStatusName(e.target.value)}
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleAddStatus}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? t("adding") : t("addStatus")}
        </button>
      </div>
    </ModalLayout>
  );
};
