import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { User } from "entities/user/types";
import { useRef } from "react";
import { rolesApi } from "features/roles/api/rolesApi";

export type EnrichedUser = User & { roleName: string };

export interface EnrichedUsersResponse {
  results: EnrichedUser[];
  count: number;
  next: string | null;
  previous: string | null;
}

export const useUsersQuery = (page: number, searchTerm = "", roleName = "") => {
  const previousData = useRef<EnrichedUsersResponse | null>(null);

  const query = useQuery<EnrichedUsersResponse>({
    queryKey: ["users", page, searchTerm, roleName],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (roleName) params.append("role__name", roleName);
      params.append("page", page.toString());

      const response = await usersApi.getUsersWithParams(params.toString());
      const rawUsers = response.results;

      const enrichedUsers = await Promise.all(
        rawUsers.map(async (user) => {
          const roleName = await rolesApi.fetchRole(user.role);
          return { ...user, roleName };
        })
      );

      const enrichedResponse: EnrichedUsersResponse = {
        results: enrichedUsers,
        count: response.count,
        next: response.next,
        previous: response.previous,
      };

      previousData.current = enrichedResponse;
      return enrichedResponse;
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data ?? previousData.current,
  };
};
