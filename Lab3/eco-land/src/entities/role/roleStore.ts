import { create } from "zustand";
import { Role } from "entities/role/roleTypes";
import { rolesApi } from "features/roles/api/rolesApi";

type RoleState = {
  roles: Role[];
  fetchRoles: () => Promise<void>;
};

export const useRoleStore = create<RoleState>((set) => ({
  roles: [],
  fetchRoles: async () => {
    try {
      const data = await rolesApi.fetchRoles();
      set({ roles: data });
    } catch (e) {
      console.error("Failed to fetch roles", e);
    }
  },
}));
