import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { User } from "entities/user/types";
import { useRef } from "react";
import { rolesApi } from "features/roles/api/rolesApi";

export type EnrichedUser = User & { roleName: string };

export const useUsersQuery = (page: number) => {
  const previousData = useRef<EnrichedUser[] | null>(null);

  const query = useQuery<EnrichedUser[]>({
    queryKey: ["users", page],
    queryFn: async () => {
      const rawUsers = await usersApi.getCustomers(page);
      const enriched = await Promise.all(
        rawUsers.map(async (user) => {
          const roleName = await rolesApi.fetchRole(user.role);
          return { ...user, roleName };
        })
      );
      previousData.current = enriched;
      return enriched;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
