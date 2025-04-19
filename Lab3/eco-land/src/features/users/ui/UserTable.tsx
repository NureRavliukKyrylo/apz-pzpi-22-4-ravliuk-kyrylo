import { useState } from "react";
import { useUsersQuery } from "../model/useUsersQuery";
import styles from "./UserTable.module.scss";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { ModalLayout } from "shared/ui/modalLayout/ModalLayout";
import { UpdateRoleForm } from "./UpdateRoleForm";
import { Pagination } from "shared/ui/pagination/Pagination";
import { DeleteButton } from "shared/ui/deleteButton/deleteButton";
import { usersApi } from "../api/usersApi";

const USERS_PER_PAGE = 8;

export const UsersTable = () => {
  const [page, setPage] = useState(1);
  const { data: users, isLoading, isError, isFetching } = useUsersQuery(page);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    role: number;
  } | null>(null);

  const totalPages = Math.ceil((users?.length ?? 0) / USERS_PER_PAGE);
  const start = (page - 1) * USERS_PER_PAGE;
  const currentUsers = users?.slice(start, start + USERS_PER_PAGE) ?? [];

  const handleOpenModal = (userId: number, currentRole: number) => {
    setSelectedUser({ id: userId, role: currentRole });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className={styles.usersContainer}>
      {isLoading ? (
        <SpinnerLoading centered />
      ) : isError ? (
        <div className={styles.error}>Error fetching users.</div>
      ) : (
        <>
          <h1>Users</h1>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
                <th>Delete</th>
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
                      onClick={() =>
                        handleOpenModal(Number(user.id), user.role)
                      }
                    >
                      Change Role
                    </button>
                  </td>
                  <td>
                    <DeleteButton
                      id={user.id}
                      deleteFn={usersApi.deleteUser}
                      label="User"
                      data={user.username}
                      onSuccess={() => setPage(1)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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

          {isFetching && <SpinnerLoading overlay />}
        </>
      )}
    </div>
  );
};
