import { apiClient } from "shared/api/apiClient";
import { Role } from "entities/role/roleTypes";
import { PaginatedRolesResponse } from "../model/useRolesQuery";

export const rolesApi = {
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>(`/roleUsers/`);
    return response.data;
  },
  deleteRoles: async (roleId: number): Promise<void> => {
    await apiClient.delete(`/roleUsers/${roleId}/`);
  },
  updateRole: async (roleId: number, name: string): Promise<void> => {
    await apiClient.put(`/roleUsers/${roleId}/`, { name: name });
  },
  fetchRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>("/roleUsers/");
    return response.data;
  },
  fetchRole: async (roleId: number) => {
    const response = await apiClient.get(`/roleUsers/${roleId}/`);
    return response.data.name;
  },
  addRole: async (roleName: string) => {
    const response = await apiClient.post(`/roleUsers/`, { name: roleName });
  },
  getRolesWithParams: async (
    params: string
  ): Promise<PaginatedRolesResponse> => {
    const response = await apiClient.get<PaginatedRolesResponse>(
      `/roleUsers/?${params}`
    );
    return response.data;
  },
};
