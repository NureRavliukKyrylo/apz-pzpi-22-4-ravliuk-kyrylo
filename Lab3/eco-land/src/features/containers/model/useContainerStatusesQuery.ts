import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { containerApi } from "../api/containersApi";
import { StatusContainer } from "entities/container/containerTypes";

export const useContainerStatusesQuery = () => {
  const previousData = useRef<StatusContainer[] | null>(null);

  const query = useQuery<StatusContainer[]>({
    queryKey: ["containerStatuses"],
    queryFn: async () => {
      const statuses = await containerApi.getAllContainerStatuses();

      previousData.current = statuses;
      return statuses;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
