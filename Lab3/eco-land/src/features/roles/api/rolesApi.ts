import { apiClient } from "shared/api/apiClient";
import { Role } from "entities/role/roleTypes";

export const rolesApi = {
  getRoles: async (page: number): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>(`/roleUsers/?page=${page}`);
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
};
