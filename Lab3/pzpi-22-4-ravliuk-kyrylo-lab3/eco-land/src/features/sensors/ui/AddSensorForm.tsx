import { useEffect, useState } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import styles from "./AddSensorForm.module.scss";
import { useAddSensor } from "../model/useAddSensor";
import { useErrorStore } from "entities/error/useErrorStore";
import { Options } from "shared/ui/options/Options";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

type AddSensorFormProps = {
  isOpen: boolean;
  onClose: () => void;
  containerOptions: { id: number; name: string }[];
};

export const AddSensorForm = ({
  isOpen,
  onClose,
  containerOptions,
}: AddSensorFormProps) => {
  const { t } = useTranslation();
  const [containerId, setContainerId] = useState<number | null>(null);
  const [sensorValue, setSensorValue] = useState<number | string>("");

  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddSensor();

  useEffect(() => {
    if (containerOptions.length > 0 && containerId === null) {
      setContainerId(containerOptions[0].id);
    }
  }, [containerOptions, containerId]);

  const handleAddSensor = async () => {
    if (containerId === null || sensorValue === "") {
      setError(t("allFieldsMustBeFilled"));
      return;
    }

    mutate(
      {
        container_id_filling: containerId,
        sensor_value: Number(sensorValue),
      },
      {
        onSuccess: () => {
          setContainerId(null);
          setSensorValue("");
          clearError();
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error || error.response?.data?.message;
            setError(detail ?? t("failedToAddSensor"));
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
        <h2>{t("addNewSensor")}</h2>

        {containerOptions.length > 0 && containerId !== null && (
          <Options
            options={containerOptions}
            selectedValue={containerId}
            onChange={setContainerId}
          />
        )}

        <input
          type="number"
          placeholder={t("enterSensorValue")}
          value={sensorValue}
          onChange={(e) => setSensorValue(e.target.value)}
          className={styles.input}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          onClick={handleAddSensor}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? t("adding") : t("addSensor")}
        </button>
      </div>
    </ModalLayout>
  );
};
