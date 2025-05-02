import { useState } from "react";
import { useUpdateContainerTypeData } from "../model/useUpdateContainerTypeData";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { useErrorStore } from "entities/error/useErrorStore";
import styles from "./UpdateContainerTypeDataForm.module.scss";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type UpdateContainerTypeDataFormProps = {
  typeId: number;
  currentTypeName: string;
  currentVolume: number;
  onClose: () => void;
  onSuccess: () => void;
};

export const UpdateContainerTypeDataForm = ({
  typeId,
  currentTypeName,
  currentVolume,
  onClose,
  onSuccess,
}: UpdateContainerTypeDataFormProps) => {
  const { t } = useTranslation();
  const [typeName, setTypeName] = useState(currentTypeName);
  const [volume, setVolume] = useState(currentVolume);
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useUpdateContainerTypeData();

  const handleUpdate = () => {
    if (!typeName.trim()) {
      setError(t("typeNameRequired"));
      return;
    }
    if (volume <= 0) {
      setError(t("volumeMustBePositive"));
      return;
    }

    mutate(
      { typeName, typeId, typeVolume: volume },
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
            setError(detail ?? t("updateTypeFailed"));
          } else {
            setError(t("unexpectedError"));
          }
        },
      }
    );
  };

  return (
    <div className={styles.formContainer}>
      <h2>{t("editContainerType")}</h2>
      <div className={styles.inputBlock}>
        <input
          type="text"
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
          placeholder={t("enterTypeName")}
          disabled={isPending}
        />
      </div>
      <div className={styles.inputBlock}>
        <input
          type="number"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          placeholder={t("enterVolume")}
          disabled={isPending}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonContainer}>
        <button onClick={handleUpdate} disabled={isPending}>
          {isPending ? <SpinnerLoading /> : t("updateType")}
        </button>
      </div>
    </div>
  );
};
