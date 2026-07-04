import { useEffect, useState } from "react";
import { Modal, Form, Input, notification, Upload, Button, Divider } from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  DollarOutlined,
  PictureOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
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
      notification.success({ message: "画像アップロード成功" });
    } else {
      notification.error({ message: "画像アップロード失敗" });
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
        message: dataUpdate ? "料理更新成功" : "料理追加成功",
      });
      handleClose();
      await loadDishes();
    } else {
      notification.error({
        message: "エラー",
        description: JSON.stringify(res?.message || "問題が発生しました"),
      });
    }
  };

  return (
    <Modal
      title={dataUpdate ? "🍽️ 料理を編集" : "🍽️ 新しい料理を追加"}
      open={isModalOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={dataUpdate ? "更新" : "追加"}
      cancelText="キャンセル"
      centered
    >
      <Divider orientation="left">
        <InfoCircleOutlined /> 基本情報
      </Divider>

      <Form form={form} layout="vertical" onFinish={onFinish}>

        {/* Tên món */}
        <Form.Item
          label={
            <span>
              <FileTextOutlined style={{ marginRight: 6 }} />
              料理名
            </span>
          }
          name="name"
          rules={[{ required: true, message: "料理名を入力してください" }]}
        >
          <Input placeholder="例: 牛肉フォー" />
        </Form.Item>

        {/* Giá tiền */}
        <Form.Item
          label={
            <span>
              <DollarOutlined style={{ marginRight: 6 }} />
              価格
            </span>
          }
          name="price"
          rules={[
            { required: true, message: "価格を入力してください" },
            {
              validator: (_, value) => {
                if (!value) return Promise.reject("価格は必須です");
                if (isNaN(value)) return Promise.reject("価格は数字である必要があります");
                if (Number(value) < 0) return Promise.reject("価格は0以上である必要があります");
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="例: 1200" allowClear />
        </Form.Item>

        <Divider orientation="left">
          <InfoCircleOutlined /> 詳細情報
        </Divider>

        {/* Mô tả */}
        <Form.Item
          label={
            <span>
              <FileTextOutlined style={{ marginRight: 6 }} />
              説明
            </span>
          }
          name="description"
        >
          <TextArea rows={3} placeholder="料理の簡単な説明" />
        </Form.Item>

        <Divider orientation="left">
          <PictureOutlined /> 料理画像
        </Divider>

        {/* Ảnh món ăn */}
        <Form.Item>
          <Upload
            customRequest={handleUploadImage}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              画像をアップロード
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
