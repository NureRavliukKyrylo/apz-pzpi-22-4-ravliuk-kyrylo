import { useState } from "react";
import { useUpdateCollectionScheduleDate } from "../model/useUpdateCollectionScheduleDate";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import styles from "./UpdateCollectionScheduleForm.module.scss";

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
  const [newDate, setNewDate] = useState(currentDate.split("T")[0]);
  const { mutate, isPending } = useUpdateCollectionScheduleDate();
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = () => {
    mutate(
      { id: scheduleId, collection_date: newDate },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <h2>Change Collection Date</h2>
      <input
        type="datetime-local"
        value={newDate}
        min={today}
        onChange={(e) => setNewDate(e.target.value)}
        className={styles.dateInput}
      />
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? <SpinnerLoading /> : "Update Date"}
      </button>
    </div>
  );
};
