import { useEffect, useState } from "react";
import { Modal, Form, Input, notification, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  createDishAPI,
  updateDishAPI,
  handleUpdateFile,
} from "../../services/api.services";

const { TextArea } = Input;

const DishModal = (props) => {
  const {
    isModalOpen,
    setIsModalOpen,
    dataUpdate,
    setDataUpdate,
    loadDishes,
  } = props;

  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (dataUpdate) {
      form.setFieldsValue({
        name: dataUpdate.name,
        description: dataUpdate.description,
      });
      setImageUrl(dataUpdate.image || "");
    } else {
      form.resetFields();
      setImageUrl("");
    }
  }, [dataUpdate]);

  const handleClose = () => {
    setIsModalOpen(false);
    setDataUpdate(null);
    form.resetFields();
    setImageUrl("");
  };

  const handleUploadImage = async ({ file }) => {
    setUploading(true);
    const res = await handleUpdateFile(file, "food");
    setUploading(false);
    if (res?.data) {
      setImageUrl(res.data.fileUploaded || res.data.url || res.data);
      notification.success({ message: "Tải ảnh thành công" });
    } else {
      notification.error({ message: "Tải ảnh thất bại" });
    }
  };

  const onFinish = async (values) => {
    let res;
    if (dataUpdate) {
      res = await updateDishAPI(
        dataUpdate._id,
        values.name,
        values.description,
        imageUrl
      );
    } else {
      res = await createDishAPI(values.name, values.description, imageUrl);
    }

    if (res?.data) {
      notification.success({
        message: dataUpdate ? "Cập nhật món ăn thành công" : "Thêm món ăn thành công",
      });
      handleClose();
      await loadDishes();
    } else {
      notification.error({
        message: "Lỗi",
        description: JSON.stringify(res?.message || "Có lỗi xảy ra"),
      });
    }
  };

  return (
    <Modal
      title={dataUpdate ? "Cập nhật món ăn" : "Thêm món ăn mới"}
      open={isModalOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={dataUpdate ? "Cập nhật" : "Thêm"}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên món ăn"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên món ăn" }]}
        >
          <Input placeholder="VD: Phở bò" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <TextArea rows={3} placeholder="Mô tả ngắn về món ăn" />
        </Form.Item>

        <Form.Item label="Ảnh món ăn">
          <Upload
            customRequest={handleUploadImage}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Tải ảnh lên
            </Button>
          </Upload>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="preview"
              style={{
                marginTop: 10,
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DishModal;