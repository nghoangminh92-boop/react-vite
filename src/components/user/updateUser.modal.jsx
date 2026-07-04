import { useEffect, useState, useContext } from "react";
import { Input, notification, Modal, Select } from "antd";
import { updateUserAPI } from "../../services/api.services";
import { AuthContext } from "../../components/context/auth.context";

const UpdateUserModal = (props) => {
  const {
    isModalUpdateOpen,
    setIsModalUpdateOpen,
    dataUpdate,
    setDataUpdate,
    loadUser
  } = props;

  // ⭐ DÙNG CONTEXT — KHÔNG DÙNG localStorage NỮA
  const { user: currentUser } = useContext(AuthContext);

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

    // ⭐ ADMIN được phép đổi role
    if (currentUser?.role === "ADMIN") {
      res = await updateUserAPI(id, fullName, phone, role);
    } else {
      // ⭐ USER chỉ được sửa thông tin cá nhân
      res = await updateUserAPI(id, fullName, phone);
    }

    if (res?.data) {
      notification.success({
        message: "Update user",
        description: "Cập nhật user thành công"
      });
      resetAndCloseModal();
      await loadUser();
    } else {
      notification.error({
        message: "Error update user",
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
      title="Update User"
      open={isModalUpdateOpen}
      onOk={handleSubmitBtn}
      onCancel={resetAndCloseModal}
      maskClosable={false}
      okText="SAVE"
      cancelText="CANCEL"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <span>Id</span>
          <Input value={id} disabled />
        </div>

        <div>
          <span>FullName</span>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <span>Phone number</span>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* ⭐ Chỉ ADMIN mới được đổi role */}
        {currentUser?.role === "ADMIN" && (
          <div>
            <span style={{ fontWeight: 600 }}>Role</span>
            <Select
              value={role}
              onChange={(value) => setRole(value)}
              style={{ width: "100%", marginTop: 5 }}
              options={[
                { value: "USER", label: "一般 (USER)" },
                { value: "ADMIN", label: "管理者 (ADMIN)" },
                { value: "STAFF", label: "スタッフ (STAFF)" }
              ]}
            />
          </div>
        )}

      </div>
    </Modal>
  );
};

export default UpdateUserModal;
