import { useEffect, useState } from "react";
import { containerApi } from "../api/containersApi";
import { TypeContainer } from "entities/container/containerTypes";
import { useUpdateContainerType } from "../model/useUpdateContainerType";
import { SpinnerLoading } from "shared/ui/loading/SpinnerLoading";
import { Options } from "shared/ui/options/Options";
import styles from "./UpdateContainerTypeForm.module.scss";
import { useTranslation } from "react-i18next";

type Props = {
  containerId: number;
  currentType: number;
  onClose: () => void;
};

export const UpdateContainerTypeForm = ({
  containerId,
  currentType,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const [newType, setNewType] = useState(currentType);
  const [types, setTypes] = useState<TypeContainer[]>([]);

  const { mutate, isPending } = useUpdateContainerType();

  useEffect(() => {
    containerApi.getAllContainerTypes().then(setTypes);
  }, []);

  const options = types.map((type) => ({
    id: type.id,
    name: `${type.type_name_container} (${type.volume_container} л)`,
  }));

  const handleSubmit = () => {
    mutate(
      { containerId, type_of_container_id: newType },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <h2>{t("changeContainerType")}</h2>
      <Options
        options={options}
        selectedValue={newType}
        onChange={setNewType}
      />
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? <SpinnerLoading /> : t("updateType")}
      </button>
    </div>
  );
};
