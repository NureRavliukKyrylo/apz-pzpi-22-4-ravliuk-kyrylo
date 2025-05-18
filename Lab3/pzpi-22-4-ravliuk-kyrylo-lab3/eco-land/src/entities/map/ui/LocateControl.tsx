import { useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import styles from "./InteractiveMap.module.scss";

export function LocateButton({
  position,
}: {
  position: LatLngExpression | null;
}) {
  const map = useMap();

  const handleClick = () => {
    if (position) {
      map.flyTo(position, 13, { duration: 1.5 });
    }
  };

  return (
    <button className={styles.locateButton} onClick={handleClick}>
      Me
    </button>
  );
}
