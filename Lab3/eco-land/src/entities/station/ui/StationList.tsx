import { useState } from "react";
import { useStationsParamsQuery } from "features/stations/model/useStationsQuery";
import { Pagination } from "shared/ui/pagination/Pagination";
import styles from "./StationsList.module.scss";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";

const STATIONS_PER_PAGE = 4;

export default function StationsList({
  onStationSelect,
}: {
  onStationSelect: (position: [number, number]) => void;
}) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useStationsParamsQuery(
    page,
    "",
    "",
    "",
    STATIONS_PER_PAGE
  );

  const stations = data?.results ?? [];
  const totalPages = Math.ceil((data?.count ?? 0) / STATIONS_PER_PAGE);

  if (isError) return <div>Error loading stations.</div>;

  return (
    <div className={styles.stationListWrapper}>
      {isLoading ? (
        <div className={styles.spinnerWrapper}>
          <SpinnerLoading centered />
        </div>
      ) : (
        <div className={styles.stationList}>
          {stations.map((station) => (
            <div
              key={station.id}
              className={styles.stationCard}
              onClick={() =>
                onStationSelect([
                  station.latitude_location,
                  station.longitude_location,
                ])
              }
            >
              <h3>{station.station_of_containers_name}</h3>
              <p>Station status: {station.statusName}</p>
              <p>
                Last reserved:{" "}
                {new Date(station.last_reserved).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
