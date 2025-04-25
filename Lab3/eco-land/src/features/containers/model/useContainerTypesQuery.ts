import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { containerApi } from "../api/containersApi";
import { TypeContainer } from "entities/container/containerTypes";

export const useContainerTypesQuery = () => {
  const previousData = useRef<TypeContainer[] | null>(null);

  const query = useQuery<TypeContainer[]>({
    queryKey: ["containerTypes"],
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
