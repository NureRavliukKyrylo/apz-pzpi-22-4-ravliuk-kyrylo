import { useEffect, useState } from "react";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import styles from "./AddStationForm.module.scss";
import { useAddStation } from "../model/useAddStation";
import { useErrorStore } from "entities/error/useErrorStore";
import { Options } from "shared/ui/options/Options";
import { AxiosError } from "axios";

type AddStationFormProps = {
  isOpen: boolean;
  onClose: () => void;
  statusOptions: { id: number; name: string }[];
};

export const AddStationForm = ({
  isOpen,
  onClose,
  statusOptions,
}: AddStationFormProps) => {
  const [stationName, setStationName] = useState("");
  const [latitude, setLatitude] = useState<number | string>("");
  const [longitude, setLongitude] = useState<number | string>("");
  const [statusStation, setStatusStation] = useState<number | null>(null);
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useAddStation();

  useEffect(() => {
    if (statusOptions.length > 0 && statusStation === null) {
      setStatusStation(statusOptions[0].id);
    }
  }, [statusOptions, statusStation]);

  const handleAddStation = async () => {
    if (
      stationName.trim() === "" ||
      latitude === "" ||
      longitude === "" ||
      statusStation === null
    ) {
      setError("All fields must be filled.");
      return;
    }

    mutate(
      {
        station_of_containers_name: stationName,
        latitude_location: Number(latitude),
        longitude_location: Number(longitude),
        status_station: statusStation,
      },
      {
        onSuccess: () => {
          setStationName("");
          setLatitude("");
          setLongitude("");
          setStatusStation(null);
          clearError();
          onClose();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const detail =
              error.response?.data?.error || error.response?.data?.message;
            setError(detail ?? "Failed to add station.");
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
        <h2>Add New Station</h2>
        <input
          type="text"
          placeholder="Enter station name"
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Enter latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Enter longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className={styles.input}
        />
        {statusStation !== null && (
          <Options
            options={statusOptions}
            selectedValue={statusStation}
            onChange={setStatusStation}
          />
        )}
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleAddStation}
          disabled={isPending}
          className={styles.button}
        >
          {isPending ? "Adding..." : "Add Station"}
        </button>
      </div>
    </ModalLayout>
  );
};
