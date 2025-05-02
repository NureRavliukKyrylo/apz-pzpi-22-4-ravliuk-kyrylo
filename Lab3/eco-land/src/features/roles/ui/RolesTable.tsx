import { useState } from "react";
import { useRolesParamsQuery } from "../model/useRolesQuery";
import { Pagination } from "shared/ui/pagination/Pagination";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { rolesApi } from "../api/rolesApi";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateRoleForm } from "./UpdateRoleForm";
import styles from "./RolesTable.module.scss";
import { useTranslation } from "react-i18next";

const ROLES_PER_PAGE = 8;

export const RolesTable = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useRolesParamsQuery(page);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { t } = useTranslation();

  const roles = data?.results ?? [];
  const totalPages = Math.ceil((data?.count ?? 0) / ROLES_PER_PAGE);
  const start = (page - 1) * ROLES_PER_PAGE;
  const currentRoles = roles ?? [];

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
        <div className={styles.error}>{t("errorFetchingRoles")}</div>
      ) : (
        <>
          <h1>{t("rolesTitle")}</h1>
          <table className={styles.rolesTable}>
            <thead>
              <tr>
                <th>{t("roleName")}</th>
                <th>{t("update")}</th>
                <th>{t("delete")}</th>
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
                      {t("updateRole")}
                    </button>
                  </td>
                  <td>
                    <DeleteButton
                      id={role.id}
                      deleteFn={rolesApi.deleteRoles}
                      label={t("role")}
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
