import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { containerApi } from "../api/containersApi";
import { TypeContainer } from "entities/container/containerTypes";

export type PaginatedContainerTypeResponse = {
  count: number;
  results: TypeContainer[];
};

export const useContainerTypesQuery = () => {
  const previousData = useRef<TypeContainer[] | null>(null);

  const query = useQuery<TypeContainer[]>({
    queryKey: ["containerTypesAll"],
    queryFn: async () => {
      const statuses = await containerApi.getAllContainerTypes();

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

export const useContainerTypesParamsQuery = (page: number) => {
  const previousData = useRef<PaginatedContainerTypeResponse | null>(null);

  const query = useQuery<PaginatedContainerTypeResponse>({
    queryKey: ["containerTypes", page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page !== undefined) params.append("page", page.toString());

      const statuses = await containerApi.getContainerTypesWithParams(
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
