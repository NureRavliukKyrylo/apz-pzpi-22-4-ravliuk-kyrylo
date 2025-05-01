import { useMapEvent } from "react-leaflet";
import { LatLng } from "leaflet";

type Props = {
  onRightClick: (latlng: LatLng) => void;
};

export const RightClickHandler = ({ onRightClick }: Props) => {
  useMapEvent("contextmenu", (e) => {
    onRightClick(e.latlng);
  });

  return null;
};
