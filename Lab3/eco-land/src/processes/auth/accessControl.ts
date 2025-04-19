import { authApi } from "../../features/auth/api/authApi";
import { rolesApi } from "features/roles/api/rolesApi";

export const CheckUserRole = async (
  roleId: number,
  expectedRole: string
): Promise<boolean> => {
  const userRole = await rolesApi.fetchRole(roleId);
  return userRole === expectedRole;
};
