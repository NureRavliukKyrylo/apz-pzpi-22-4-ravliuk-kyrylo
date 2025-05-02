import { useState } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { useAddContainerType } from "../model/useAddContainerType";
import { useErrorStore } from "entities/error/useErrorStore";
import { AxiosError } from "axios";
import styles from "./AddContainerTypeForm.module.scss";
import { useTranslation } from "react-i18next";

type AddContainerTypeFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddContainerTypeForm = ({
  isOpen,
  onClose,
}: AddContainerTypeFormProps) => {
  const { t } = useTranslation();
  const [typeName, setTypeName] = useState("");
  const [volume, setVolume] = useState<number | string>("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddContainerType();

  const handleAddType = () => {
    if (typeName.trim() === "" || volume === "") {
      setError(t("allFieldsRequired"));
      return;
    }

    mutate(
      {
        type_name_container: typeName,
        volume_container: Number(volume),
      },
      {
        onSuccess: () => {
          setTypeName("");
          setVolume("");
          clearError();
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error || error.response?.data?.message;
            setError(detail ?? t("addTypeFailed"));
          } else {
            setError(t("unexpectedError"));
          }
        },
      }
    );
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>{t("addNewContainerType")}</h2>
        <input
          type="text"
          placeholder={t("enterTypeName")}
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder={t("enterVolume")}
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleAddType}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? t("adding") : t("addType")}
        </button>
      </div>
    </ModalLayout>
  );
};
