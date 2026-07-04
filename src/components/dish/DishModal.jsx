import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  notification,
  Upload,
  Button,
  Divider,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  DollarOutlined,
  PictureOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  createDishAPI,
  updateDishAPI,
  handleUpdateFile,
} from "../../services/api.services";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

const DishModal = (props) => {
  const { isModalOpen, setIsModalOpen, dataUpdate, setDataUpdate, loadDishes } =
    props;

  const { t } = useTranslation(); // ⭐ dùng i18n

  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (dataUpdate) {
      form.setFieldsValue({
        name: dataUpdate.name,
        description: dataUpdate.description,
        price: dataUpdate.price,
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
      notification.success({ message: t("upload_success") });
    } else {
      notification.error({ message: t("upload_failed") });
    }
  };

  const onFinish = async (values) => {
    let res;

    if (dataUpdate) {
      res = await updateDishAPI(
        dataUpdate._id,
        values.name,
        values.description,
        Number(values.price),
        imageUrl
      );
    } else {
      res = await createDishAPI(
        values.name,
        values.description,
        Number(values.price),
        imageUrl
      );
    }

    if (res?.data) {
      notification.success({
        message: dataUpdate ? t("dish_update_success") : t("dish_add_success"),
      });
      handleClose();
      await loadDishes();
    } else {
      notification.error({
        message: t("error"),
        description: JSON.stringify(res?.message || t("error_occurred")),
      });
    }
  };

  return (
    <Modal
      title={dataUpdate ? t("edit_dish") : t("add_new_dish")}
      open={isModalOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={dataUpdate ? t("update") : t("add")}
      cancelText={t("cancel")}
      centered
    >
      <Divider orientation="left">
        <InfoCircleOutlined /> {t("basic_info")}
      </Divider>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Tên món */}
        <Form.Item
          label={
            <span>
              <FileTextOutlined style={{ marginRight: 6 }} /> {t("dish_name")}
            </span>
          }
          name="name"
          rules={[{ required: true, message: t("enter_dish_name") }]}
        >
          <Input placeholder={t("dish_name_placeholder")} />
        </Form.Item>

        {/* Giá tiền */}
        <Form.Item
          label={
            <span>
              <DollarOutlined style={{ marginRight: 6 }} /> {t("price")}
            </span>
          }
          name="price"
          rules={[
            { required: true, message: t("enter_price") },
            {
              validator: (_, value) => {
                if (!value) return Promise.reject(t("price_required"));
                if (isNaN(value)) return Promise.reject(t("price_must_be_number"));
                if (Number(value) < 0)
                  return Promise.reject(t("price_must_be_positive"));
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder={t("price_placeholder")} allowClear />
        </Form.Item>

        <Divider orientation="left">
          <InfoCircleOutlined /> {t("detail_info")}
        </Divider>

        {/* Mô tả */}
        <Form.Item
          label={
            <span>
              <FileTextOutlined style={{ marginRight: 6 }} /> {t("description")}
            </span>
          }
          name="description"
        >
          <TextArea rows={3} placeholder={t("description_placeholder")} />
        </Form.Item>

        <Divider orientation="left">
          <PictureOutlined /> {t("dish_image")}
        </Divider>

        {/* Ảnh món ăn */}
        <Form.Item>
          <Upload
            customRequest={handleUploadImage}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              {t("upload_image")}
            </Button>
          </Upload>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="preview"
              style={{
                marginTop: 10,
                width: 140,
                height: 140,
                objectFit: "cover",
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DishModal;
