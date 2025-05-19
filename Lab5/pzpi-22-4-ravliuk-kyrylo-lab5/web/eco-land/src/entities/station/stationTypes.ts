export type Station = {
  id: number;
  station_of_containers_name: string;
  latitude_location: number;
  longitude_location: number;
  status_station: number;
  last_reserved: string;
};

export type StationStatus = {
  id: number;
  station_status_name: string;
};
