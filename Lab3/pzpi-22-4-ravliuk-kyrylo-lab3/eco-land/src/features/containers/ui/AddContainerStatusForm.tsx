import { useState } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { useAddContainerStatus } from "../model/useAddContainerStatus";
import { useErrorStore } from "entities/error/useErrorStore";
import { AxiosError } from "axios";
import styles from "./AddContainerStatusForm.module.scss";
import { useTranslation } from "react-i18next";

type AddContainerStatusFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddContainerStatusForm = ({
  isOpen,
  onClose,
}: AddContainerStatusFormProps) => {
  const { t } = useTranslation();
  const [statusName, setStatusName] = useState("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddContainerStatus();

  const handleAddStatus = async () => {
    if (statusName.trim() === "") {
      setError(t("statusNameRequired"));
      return;
    }

    mutate(statusName, {
      onSuccess: () => {
        setStatusName("");
        clearError();
        onClose();
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          const detail =
            error.response?.data?.error || error.response?.data?.message;
          setError(detail ?? t("addStatusFailed"));
        } else {
          setError(t("unexpectedError"));
        }
      },
    });
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>{t("addNewContainerStatus")}</h2>
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
