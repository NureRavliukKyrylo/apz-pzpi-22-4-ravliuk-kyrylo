export type Container = {
  id: number;
  fill_level: number;
  status_container_id: number;
  last_updated: string;
  type_of_container_id: number;
  station_id: number;
};

export type StatusContainer = {
  id: number;
  status_name: string;
};

export type TypeContainer = {
  id: number;
  type_name_container: string;
  volume_container: number;
};
