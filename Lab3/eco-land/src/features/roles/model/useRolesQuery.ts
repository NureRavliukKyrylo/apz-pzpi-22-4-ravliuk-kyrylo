import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../api/rolesApi";
import { useRef } from "react";
import { Role } from "entities/role/roleTypes";

export type PaginatedRolesResponse = {
  count: number;
  results: Role[];
};

export const useRolesParamsQuery = (page?: number) => {
  const previousData = useRef<PaginatedRolesResponse | null>(null);

  const query = useQuery<PaginatedRolesResponse>({
    queryKey: ["roles", page],
    queryFn: async () => {
      const params = page ? `page=${page}` : "";
      const data = await rolesApi.getRolesWithParams(params);
      previousData.current = data;
      return data;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};

export const useRolesQuery = () => {
  const previousData = useRef<Role[] | null>(null);

  const query = useQuery<Role[]>({
    queryKey: ["new"],
    queryFn: async () => {
      const roles = await rolesApi.getRoles();
      previousData.current = roles;
      return roles;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
