import { useState } from "react";
import { useRolesQuery } from "../model/useRolesQuery";
import { Pagination } from "shared/ui/pagination/Pagination";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { rolesApi } from "../api/rolesApi";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateRoleForm } from "./UpdateRoleForm";
import styles from "./RolesTable.module.scss";

const ROLES_PER_PAGE = 8;

export const RolesTable = () => {
  const [page, setPage] = useState(1);
  const { data: roles, isLoading, isError, isFetching } = useRolesQuery(page);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const totalPages = Math.ceil((roles?.length ?? 0) / ROLES_PER_PAGE);
  const start = (page - 1) * ROLES_PER_PAGE;
  const currentRoles = roles?.slice(start, start + ROLES_PER_PAGE) ?? [];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleOpenModal = (roleId: number, roleName: string) => {
    setSelectedRole({ id: roleId, name: roleName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  return (
    <div className={styles.rolesContainer}>
      {isLoading ? (
        <SpinnerLoading centered />
      ) : isError ? (
        <div className={styles.error}>Error fetching roles.</div>
      ) : (
        <>
          <h1>Roles</h1>
          <table className={styles.rolesTable}>
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentRoles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleOpenModal(role.id, role.name)}
                    >
                      Update role
                    </button>
                  </td>
                  <td>
                    <DeleteButton
                      id={role.id}
                      deleteFn={rolesApi.deleteRoles}
                      label="Role"
                      data={role.name}
                      onSuccess={() => setPage(1)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ModalLayout isOpen={isModalOpen} onClose={handleCloseModal}>
            {selectedRole && (
              <UpdateRoleForm
                roleId={selectedRole.id}
                currentRoleName={selectedRole.name}
                onClose={handleCloseModal}
                onSuccess={() => setPage(1)}
              />
            )}
          </ModalLayout>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          {isFetching && <SpinnerLoading overlay />}
        </>
      )}
    </div>
  );
};
