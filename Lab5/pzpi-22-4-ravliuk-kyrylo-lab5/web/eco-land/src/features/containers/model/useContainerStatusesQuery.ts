import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { containerApi } from "../api/containersApi";
import { StatusContainer } from "entities/container/containerTypes";

export type PaginatedContainerStatusResponse = {
  count: number;
  results: StatusContainer[];
};

export const useContainerStatusesQuery = () => {
  const previousData = useRef<StatusContainer[] | null>(null);

  const query = useQuery<StatusContainer[]>({
    queryKey: ["containerStatusesAll"],
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

export const useContainerStatusesParamsQuery = (page: number) => {
  const previousData = useRef<PaginatedContainerStatusResponse | null>(null);

  const query = useQuery<PaginatedContainerStatusResponse>({
    queryKey: ["containerStatuses", page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page !== undefined) params.append("page", page.toString());

      const statuses = await containerApi.getContainerStatusesWithParams(
        params.toString()
      );

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
