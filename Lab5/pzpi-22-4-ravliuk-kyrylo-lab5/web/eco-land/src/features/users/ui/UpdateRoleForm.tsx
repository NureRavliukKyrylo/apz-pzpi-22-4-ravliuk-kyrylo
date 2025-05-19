import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateRole } from "../model/useUpdateRole";
import { useRoleStore } from "../../../entities/role/roleStore";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { Options } from "shared/ui/options/Options";
import styles from "./UpdateRoleForm.module.scss";

type Props = {
  userId: number;
  currentRole: number;
  onClose: () => void;
};

export const UpdateRoleForm = ({ userId, currentRole, onClose }: Props) => {
  const { t } = useTranslation();
  const [newRole, setNewRole] = useState(currentRole);
  const { mutate, isPending } = useUpdateRole();
  const { roles, fetchRoles } = useRoleStore();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSubmit = () => {
    mutate(
      { customerId: userId, roleId: newRole },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <h2>{t("changeUserRole")}</h2>
      <Options options={roles} selectedValue={newRole} onChange={setNewRole} />
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? <SpinnerLoading /> : t("updateRole")}
      </button>
    </div>
  );
};
