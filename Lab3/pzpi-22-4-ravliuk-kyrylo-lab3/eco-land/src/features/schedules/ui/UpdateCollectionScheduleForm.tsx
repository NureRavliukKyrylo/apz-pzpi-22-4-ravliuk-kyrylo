import { useState } from "react";
import { useUpdateCollectionScheduleDate } from "../model/useUpdateCollectionScheduleDate";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import styles from "./UpdateCollectionScheduleForm.module.scss";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { useErrorStore } from "entities/error/useErrorStore";

type Props = {
  scheduleId: number;
  currentDate: string;
  onClose: () => void;
};

export const UpdateCollectionScheduleForm = ({
  scheduleId,
  currentDate,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const [newDate, setNewDate] = useState(currentDate.split("T")[0]);
  const { mutate, isPending } = useUpdateCollectionScheduleDate();
  const today = new Date().toISOString().split("T")[0];
  const { error, setError, clearError } = useErrorStore();

  const handleSubmit = () => {
    mutate(
      { id: scheduleId, collection_date: newDate },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.response?.data?.collection_date;
            setError(detail ?? t("errorAddStation"));
          } else {
            setError(t("unexpectedError"));
          }
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <h2>{t("changeCollectionDate")}</h2>
      <input
        type="datetime-local"
        value={newDate}
        min={today}
        onChange={(e) => setNewDate(e.target.value)}
        className={styles.dateInput}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? <SpinnerLoading /> : t("updateDate")}
      </button>
    </div>
  );
};
