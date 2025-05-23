import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, Icon } from "leaflet";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import customMarker from "shared/assets/pin-map.png";
import binMarker from "shared/assets/bin-marker.png";
import { useStationsQuery } from "features/stations/model/useStationsQuery";
import styles from "./InteractiveMap.module.scss";
import { LocateButton } from "./LocateControl";
import { RightClickHandler } from "shared/utils/ReactClickHandler";
import { AddStationForm } from "features/stations/ui/AddStationForm";
import { useStationStatusesQuery } from "features/stations/model/useStationStatusesQuery";
import { useTranslation } from "react-i18next";
import { parseUtcDate } from "shared/utils/parseData";

const customIcon = new Icon({
  iconUrl: customMarker,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const binIcon = new Icon({
  iconUrl: binMarker,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

function FlyToUser({ position }: { position: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

function FlyToPosition({ position }: { position: LatLngExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

export default function InteractiveMap({
  flyToPosition,
}: {
  flyToPosition: LatLngExpression | null;
}) {
  const { t } = useTranslation();
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(
    null
  );

  const { data: stations, isLoading: stationsLoading } = useStationsQuery();
  const [contextMenuCoords, setContextMenuCoords] = useState<
    [number, number] | null
  >(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newStationCoords, setNewStationCoords] = useState<
    [number, number] | null
  >(null);

  const { data: statuses = [] } = useStationStatusesQuery();

  const statusOptions = (statuses ?? []).map((status) => ({
    id: status.id,
    name: status.station_status_name,
  }));

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserPosition([latitude, longitude]);
        },
        (err) => {
          console.error("Geo not allowed:", err);
          setUserPosition([50.4501, 30.5234]);
        }
      );
    } else {
      console.error("Geo can't be set");
      setUserPosition([50.4501, 30.5234]);
    }
  }, []);

  if (!userPosition) return <SpinnerLoading centered />;

  return (
    <>
      <MapContainer
        center={[50.4501, 30.5234]}
        zoom={13}
        style={{ height: "800px", width: "100%", borderRadius: "30px" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RightClickHandler
          onRightClick={(latlng) => {
            setContextMenuCoords([latlng.lat, latlng.lng]);
            setIsConfirmModalOpen(true);
          }}
        />

        <Marker position={userPosition} icon={customIcon}>
          <Popup>{t("yourPosition")}</Popup>
        </Marker>

        {stations?.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude_location, station.longitude_location]}
            icon={binIcon}
          >
            <Popup>
              <strong>{station.station_of_containers_name}</strong>
              <br />
              {t("stationStatus")}: {station.statusName}
              <br />
              {t("lastReserved")}: {parseUtcDate(station.last_reserved)}
            </Popup>
          </Marker>
        ))}

        {userPosition && <FlyToUser position={userPosition} />}

        {flyToPosition && <FlyToPosition position={flyToPosition} />}

        {userPosition && <LocateButton position={userPosition} />}

        {contextMenuCoords && (
          <Popup
            position={contextMenuCoords}
            eventHandlers={{
              remove: () => setContextMenuCoords(null),
            }}
          >
            <div className={styles.confirmPopup}>
              <h3>{t("addStationQuestion")}</h3>
              <div className={styles.popupButtons}>
                <button
                  onClick={() => {
                    setNewStationCoords(contextMenuCoords);
                    setIsFormOpen(true);
                    setContextMenuCoords(null);
                  }}
                >
                  {t("yes")}
                </button>
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>

      <AddStationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        statusOptions={statusOptions}
        defaultLat={newStationCoords?.[0]}
        defaultLng={newStationCoords?.[1]}
      />
    </>
  );
}
