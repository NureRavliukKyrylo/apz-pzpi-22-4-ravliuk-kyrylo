import { useState } from "react";
import styles from "./UpdateStationStatusNameForm.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { useUpdateStationStatusName } from "../model/useUpdateStationStatusName";
import { AxiosError } from "axios";

type UpdateStationStatusNameFormProps = {
  statusId: number;
  currentStatusName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export const UpdateStationStatusNameForm = ({
  statusId,
  currentStatusName,
  onClose,
  onSuccess,
}: UpdateStationStatusNameFormProps) => {
  const [statusName, setStatusName] = useState(currentStatusName);
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useUpdateStationStatusName();

  const handleUpdate = () => {
    if (!statusName.trim()) {
      setError("Status name cannot be empty.");
      return;
    }

    mutate(
      { statusId, station_status_name: statusName },
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
            setError(detail ?? "Failed to update role.");
          } else {
            setError("An unexpected error occurred.");
          }
        },
      }
    );
  };

  return (
    <div className={styles.formContainer}>
      <h2>Edit Station Status</h2>
      <div className={styles.inputBlock}>
        <input
          type="text"
          value={statusName}
          onChange={(e) => setStatusName(e.target.value)}
          placeholder="Enter new status name"
          disabled={isPending}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonContainer}>
        <button onClick={handleUpdate} disabled={isPending}>
          {isPending ? <SpinnerLoading /> : "Update Status"}
        </button>
      </div>
    </div>
  );
};
