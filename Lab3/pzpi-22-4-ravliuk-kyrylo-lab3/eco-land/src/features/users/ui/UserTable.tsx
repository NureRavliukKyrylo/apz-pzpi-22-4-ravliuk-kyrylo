import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUsersQuery } from "../model/useUsersQuery";
import styles from "./UserTable.module.scss";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateRoleForm } from "./UpdateRoleForm";
import { Pagination } from "shared/ui/pagination/Pagination";
import { DeleteButton } from "shared/ui/buttons/deleteButton/deleteButton";
import { usersApi } from "../api/usersApi";
import { useRolesQuery } from "features/roles/model/useRolesQuery";
import { SearchInput } from "shared/ui/seach/SearchInput";
import { FilterSelect } from "shared/ui/filter/FilterOption";

const USERS_PER_PAGE = 8;

export const UsersTable = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    role: number;
  } | null>(null);

  const { data: roles } = useRolesQuery();
  const selectedRoleName =
    roles?.find((role) => role.id === selectedRoleId)?.name || "";

  const { data, isLoading, isError, isFetching } = useUsersQuery(
    page,
    searchTerm,
    selectedRoleName
  );

  const users = data?.results ?? [];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(page);
  };

  const handleFilterChange = (value: number) => {
    setSelectedRoleId(value);
    setPage(page);
  };

  const totalPages = Math.ceil((data?.count ?? 0) / USERS_PER_PAGE);
  const start = (page - 1) * USERS_PER_PAGE;
  const currentUsers = users ?? [];

  const handleOpenModal = (userId: number, currentRole: number) => {
    setSelectedUser({ id: userId, role: currentRole });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (isError) {
    return (
      <div className={styles.usersContainer}>
        <div className={styles.error}>{t("errorFetchingUsers")}</div>
      </div>
    );
  }

  return (
    <div className={styles.usersContainer}>
      <h1>{t("usersTitle")}</h1>
      <div className={styles.controls}>
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <FilterSelect
          options={
            roles?.map((role) => ({
              id: role.id,
              name: role.name,
            })) || []
          }
          selectedValue={selectedRoleId}
          onChange={handleFilterChange}
          placeholder={t("chooseRole")}
        />
      </div>
      {isLoading ? (
        <div className={styles.spinnerWrapper}>
          <SpinnerLoading centered />
        </div>
      ) : (
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("email")}</th>
              <th>{t("role")}</th>
              <th>{t("actions")}</th>
              <th>{t("delete")}</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`${styles.roleChip} ${
                      styles[user.roleName.toLowerCase()]
                    }`}
                  >
                    {user.roleName}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.changeBtn}
                    onClick={() => handleOpenModal(Number(user.id), user.role)}
                  >
                    {t("changeRole")}
                  </button>
                </td>
                <td>
                  <DeleteButton
                    id={user.id}
                    deleteFn={usersApi.deleteUser}
                    label={t("user")}
                    data={user.username}
                    onSuccess={() => setPage(1)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ModalLayout isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedUser && (
          <UpdateRoleForm
            userId={selectedUser.id}
            currentRole={selectedUser.role}
            onClose={handleCloseModal}
          />
        )}
      </ModalLayout>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};
