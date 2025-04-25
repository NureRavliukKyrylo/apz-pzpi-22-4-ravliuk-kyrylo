import { useState } from "react";
import { useErrorStore } from "entities/error/useErrorStore";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { useUpdateContainerStatusName } from "../model/useUpdateContainerStatus";
import { AxiosError } from "axios";
import styles from "./UpdateContainerStatusNameForm.module.scss";

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
  const [statusName, setStatusName] = useState(currentStatusName);
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useUpdateContainerStatusName();

  const handleUpdate = () => {
    if (!statusName.trim()) {
      setError("Status name cannot be empty.");
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
            setError(detail ?? "Failed to update status.");
          } else {
            setError("An unexpected error occurred.");
          }
        },
      }
    );
  };

  return (
    <div className={styles.formContainer}>
      <h2>Edit Container Status</h2>
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
