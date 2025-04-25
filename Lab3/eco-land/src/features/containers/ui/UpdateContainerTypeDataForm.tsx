import { useState } from "react";
import { useUpdateContainerTypeData } from "../model/useUpdateContainerTypeData";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { useErrorStore } from "entities/error/useErrorStore";
import styles from "./UpdateContainerTypeDataForm.module.scss";
import { AxiosError } from "axios";

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
  const [typeName, setTypeName] = useState(currentTypeName);
  const [volume, setVolume] = useState(currentVolume);
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useUpdateContainerTypeData();

  const handleUpdate = () => {
    if (!typeName.trim()) {
      setError("Type name cannot be empty.");
      return;
    }
    if (volume <= 0) {
      setError("Volume must be greater than 0.");
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
            setError(detail ?? "Failed to update type.");
          } else {
            setError("An unexpected error occurred.");
          }
        },
      }
    );
  };

  return (
    <div className={styles.formContainer}>
      <h2>Edit Container Type</h2>
      <div className={styles.inputBlock}>
        <input
          type="text"
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
          placeholder="Enter new type name"
          disabled={isPending}
        />
      </div>
      <div className={styles.inputBlock}>
        <input
          type="number"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          placeholder="Enter new volume"
          disabled={isPending}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonContainer}>
        <button onClick={handleUpdate} disabled={isPending}>
          {isPending ? <SpinnerLoading /> : "Update Type"}
        </button>
      </div>
    </div>
  );
};
