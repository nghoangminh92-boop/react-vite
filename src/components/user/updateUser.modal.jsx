import { useEffect, useState, useContext } from "react";
import { Input, notification, Modal, Select } from "antd";
import { updateUserAPI } from "../../services/api.services";
import { AuthContext } from "../../components/context/auth.context";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const UpdateUserModal = (props) => {
  const {
    isModalUpdateOpen,
    setIsModalUpdateOpen,
    dataUpdate,
    setDataUpdate,
    loadUser
  } = props;

  const { user: currentUser } = useContext(AuthContext);
  const { t } = useTranslation(); // ⭐ dùng i18n

  const [id, setId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("USER");

  useEffect(() => {
    if (dataUpdate) {
      setId(dataUpdate._id);
      setFullName(dataUpdate.fullName);
      setPhone(dataUpdate.phone);
      setRole(dataUpdate.role);
    }
  }, [dataUpdate]);

  const handleSubmitBtn = async () => {
    let res;

    if (currentUser?.role === "ADMIN") {
      res = await updateUserAPI(id, fullName, phone, role);
    } else {
      res = await updateUserAPI(id, fullName, phone);
    }

    if (res?.data) {
      notification.success({
        message: t("update_user"),
        description: t("update_user_success")
      });
      resetAndCloseModal();
      await loadUser();
    } else {
      notification.error({
        message: t("update_user_error"),
        description: JSON.stringify(res?.message)
      });
    }
  };

  const resetAndCloseModal = () => {
    setIsModalUpdateOpen(false);
    setDataUpdate(null);
    setId("");
    setFullName("");
    setPhone("");
    setRole("USER");
  };

  return (
    <Modal
      title={t("update_user")}
      open={isModalUpdateOpen}
      onOk={handleSubmitBtn}
      onCancel={resetAndCloseModal}
      maskClosable={false}
      okText={t("save")}
      cancelText={t("cancel")}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <span>{t("user_id")}</span>
          <Input value={id} disabled />
        </div>

        <div>
          <span>{t("full_name")}</span>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <span>{t("phone")}</span>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {currentUser?.role === "ADMIN" && (
          <div>
            <span style={{ fontWeight: 600 }}>{t("role")}</span>
            <Select
              value={role}
              onChange={(value) => setRole(value)}
              style={{ width: "100%", marginTop: 5 }}
              options={[
                { value: "USER", label: t("role_user") },
                { value: "ADMIN", label: t("role_admin") },
                { value: "STAFF", label: t("role_staff") }
              ]}
            />
          </div>
        )}

      </div>
    </Modal>
  );
};

export default UpdateUserModal;
