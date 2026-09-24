import { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Popconfirm,
  Result,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  PushpinFilled,
  PushpinOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../components/context/auth.context";
import { useTranslation } from "react-i18next";
import "./announcement.css";

const STORAGE_KEY = "food-review-announcements";
const { TextArea } = Input;
const { Title, Text } = Typography;

const readAnnouncements = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const isExpired = (item) =>
  Boolean(item.expiresAt && new Date(`${item.expiresAt}T23:59:59`).getTime() < Date.now());

const AnnouncementPage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [announcements, setAnnouncements] = useState(readAnnouncements);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
  }, [announcements]);

  if (user?.role !== "ADMIN") {
    return <Result status="403" title={t("announcement_admin_only")} />;
  }

  const saveAnnouncement = (values) => {
    if (editingId) {
      setAnnouncements((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...item, ...values }
            : values.pinned
              ? { ...item, pinned: false }
              : item
        )
      );
      message.success(t("announcement_updated"));
    } else {
      setAnnouncements((current) => [
        {
          id: `${Date.now()}`,
          ...values,
          pinned: Boolean(values.pinned),
          createdAt: new Date().toISOString(),
        },
        ...current.map((item) => (values.pinned ? { ...item, pinned: false } : item)),
      ]);
      message.success(t("announcement_created"));
    }

    form.resetFields();
    setEditingId(null);
  };

  const editAnnouncement = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({ ...item, expiresAt: item.expiresAt || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeAnnouncement = (id) => {
    setAnnouncements((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      form.resetFields();
      setEditingId(null);
    }
    message.success(t("announcement_deleted"));
  };

  const togglePinned = (id, pinned) => {
    setAnnouncements((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, pinned }
          : pinned
            ? { ...item, pinned: false }
            : item
      )
    );
  };

  return (
    <main className="announcement-page">
      <section className="announcement-hero">
        <Tag color="green" icon={<BellOutlined />}>
          {t("announcement_admin_badge")}
        </Tag>
        <Title level={2}>{t("announcement_management")}</Title>
        <Text>{t("announcement_management_subtitle")}</Text>
      </section>

      <section className="announcement-editor">
        <Card title={editingId ? t("announcement_edit") : t("announcement_new")}>
          <Form form={form} layout="vertical" onFinish={saveAnnouncement} initialValues={{ pinned: false }}>
            <Form.Item
              name="title"
              label={t("announcement_title")}
              rules={[{ required: true, message: t("announcement_title_required") }]}
            >
              <Input prefix={<BellOutlined />} placeholder={t("announcement_title_placeholder")} />
            </Form.Item>
            <Form.Item
              name="content"
              label={t("announcement_content")}
              rules={[{ required: true, message: t("announcement_content_required") }]}
            >
              <TextArea rows={4} placeholder={t("announcement_content_placeholder")} />
            </Form.Item>
            <Form.Item name="pinned" label={t("announcement_pin_now")} valuePropName="checked">
              <Switch checkedChildren={<PushpinFilled />} unCheckedChildren={<PushpinOutlined />} />
            </Form.Item>
            <Form.Item
              name="expiresAt"
              label={t("announcement_expires_at")}
              rules={[{ required: true, message: t("announcement_expires_required") }]}
            >
              <Input type="date" min={new Date().toISOString().slice(0, 10)} />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={editingId ? <EditOutlined /> : <PlusOutlined />}>
                {editingId ? t("save") : t("announcement_create")}
              </Button>
              {editingId && <Button onClick={() => { form.resetFields(); setEditingId(null); }}>{t("cancel")}</Button>}
            </Space>
          </Form>
        </Card>
      </section>

      <section className="announcement-list">
        <div className="announcement-list-heading">
          <Title level={3}>{t("announcement_list")}</Title>
          <Text>{announcements.length} {t("announcement_items")}</Text>
        </div>
        {announcements.length === 0 ? (
          <Card><Empty description={t("announcement_empty")} /></Card>
        ) : (
          announcements.map((item) => (
            <Card key={item.id} className={item.pinned && !isExpired(item) ? "announcement-item is-pinned" : "announcement-item"}>
              <div className="announcement-item-main">
                <div>
                  <div className="announcement-item-title">
                    {item.pinned && <PushpinFilled />}
                    {item.title}
                  </div>
                  <p>{item.content}</p>
                </div>
                <Space>
                  <Switch disabled={isExpired(item)} checked={item.pinned && !isExpired(item)} onChange={(checked) => togglePinned(item.id, checked)} checkedChildren={<PushpinFilled />} unCheckedChildren={<PushpinOutlined />} />
                  <Button icon={<EditOutlined />} onClick={() => editAnnouncement(item)} aria-label={t("edit")} />
                  <Popconfirm title={t("announcement_delete_confirm")} onConfirm={() => removeAnnouncement(item.id)}>
                    <Button danger icon={<DeleteOutlined />} aria-label={t("delete")} />
                  </Popconfirm>
                </Space>
              </div>
              <Space>
                {item.pinned && !isExpired(item) && <Tag color="green" icon={<PushpinFilled />}>{t("announcement_pinned")}</Tag>}
                {isExpired(item) && <Tag color="default">{t("announcement_expired")}</Tag>}
                {item.expiresAt && <Text className="announcement-expiry">{t("announcement_expires_at")}: {item.expiresAt}</Text>}
              </Space>
            </Card>
          ))
        )}
      </section>
    </main>
  );
};

export { STORAGE_KEY };
export default AnnouncementPage;
