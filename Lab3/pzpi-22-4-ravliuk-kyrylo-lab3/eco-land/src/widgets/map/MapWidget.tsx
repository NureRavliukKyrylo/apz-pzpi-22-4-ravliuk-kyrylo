import { useState } from "react";
import { LatLngExpression } from "leaflet";
import InteractiveMap from "entities/map/ui/InteractiveMap";
import StationsList from "entities/station/ui/StationList";
import styles from "./MapPage.module.scss";

export default function MapWidget() {
  const [selectedStationPosition, setSelectedStationPosition] =
    useState<LatLngExpression | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <StationsList onStationSelect={setSelectedStationPosition} />
      </div>
      <div className={styles.map}>
        <InteractiveMap flyToPosition={selectedStationPosition} />
      </div>
    </div>
  );
}
