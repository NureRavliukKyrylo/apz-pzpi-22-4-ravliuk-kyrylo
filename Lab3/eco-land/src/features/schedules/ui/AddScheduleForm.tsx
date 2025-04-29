import { useEffect, useState } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import styles from "./AddScheduleForm.module.scss";
import { useAddSchedule } from "../model/useAddSchedule";
import { useErrorStore } from "entities/error/useErrorStore";
import { Options } from "shared/ui/options/Options";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { AxiosError } from "axios";

type AddScheduleFormProps = {
  isOpen: boolean;
  onClose: () => void;
  stations: { id: number; name: string }[];
};

export const AddScheduleForm = ({
  isOpen,
  onClose,
  stations,
}: AddScheduleFormProps) => {
  const [selectedStationId, setSelectedStationId] = useState<number | null>(
    null
  );
  const [collectionDate, setCollectionDate] = useState<string>("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddSchedule();

  const today = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    if (stations.length > 0 && selectedStationId === null) {
      setSelectedStationId(stations[0].id);
    }
  }, [stations, selectedStationId]);

  const handleAddSchedule = async () => {
    if (selectedStationId === null || collectionDate.trim() === "") {
      setError("All fields must be filled.");
      return;
    }

    mutate(
      {
        station_of_containers_id: selectedStationId,
        collection_date: collectionDate,
      },
      {
        onSuccess: () => {
          setSelectedStationId(null);
          setCollectionDate("");
          clearError();
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error || error.response?.data?.message;
            setError(detail ?? "Failed to add schedule.");
          } else {
            setError("An unexpected error occurred.");
          }
        },
      }
    );
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2>Add New Collection Schedule</h2>

        {selectedStationId !== null && (
          <Options
            options={stations}
            selectedValue={selectedStationId}
            onChange={setSelectedStationId}
          />
        )}

        <input
          id="collectionDate"
          type="datetime-local"
          value={collectionDate}
          onChange={(e) => setCollectionDate(e.target.value)}
          min={today}
          className={styles.input}
          placeholder="Select collection date"
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          onClick={handleAddSchedule}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? <SpinnerLoading /> : "Add Schedule"}
        </button>
      </div>
    </ModalLayout>
  );
};
