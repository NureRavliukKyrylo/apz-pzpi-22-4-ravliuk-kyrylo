import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../api/rolesApi";
import { useRef } from "react";
import { Role } from "entities/role/roleTypes";

export const useRolesQuery = (page: number) => {
  const previousData = useRef<Role[] | null>(null);

  const query = useQuery<Role[]>({
    queryKey: ["roles", page],
    queryFn: async () => {
      const roles = await rolesApi.getRoles(page);
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
