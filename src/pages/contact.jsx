import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import './contact.css';
// ⭐ Thay bằng endpoint Formspree thật của bạn (đăng ký ở formspree.io)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqevnkew';

const ContactPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        message.success(t('contact_form_success'));
        setForm({ name: '', email: '', message: '' });
      } else {
        const data = await res.json().catch(() => null);
        console.error('Formspree error:', data);
        message.error(t('contact_form_error'));
      }
    } catch (err) {
      console.error('Lỗi gửi liên hệ:', err);
      message.error(t('contact_form_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>{t('contact_title')}</h1>
        <p>{t('contact_subtitle')}</p>
      </div>

      <div className="contact-container">
        {/* THÔNG TIN LIÊN HỆ */}
        <div className="contact-info">
          <div className="contact-info-item">
            <span className="contact-icon">📍</span>
            <div>
              <h4>{t('contact_address_label')}</h4>
              <p>{t('contact_address_value')}</p>
            </div>
          </div>

          <div className="contact-info-item">
            <span className="contact-icon">📞</span>
            <div>
              <h4>{t('contact_phone_label')}</h4>
              <p>{t('contact_phone_value')}</p>
            </div>
          </div>

          <div className="contact-info-item">
            <span className="contact-icon">✉️</span>
            <div>
              <h4>{t('contact_email_label')}</h4>
              <p>{t('contact_email_value')}</p>
            </div>
          </div>

          <div className="contact-info-item">
            <span className="contact-icon">🕒</span>
            <div>
              <h4>{t('contact_hours_label')}</h4>
              <p>{t('contact_hours_value')}</p>
            </div>
          </div>
        </div>

        {/* FORM LIÊN HỆ */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>{t('contact_form_title')}</h3>

          <div className="contact-form-group">
            <label htmlFor="name">{t('contact_form_name')}</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder={t('contact_form_name_placeholder')}
              required
              disabled={loading}
            />
          </div>

          <div className="contact-form-group">
            <label htmlFor="email">{t('contact_form_email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t('contact_form_email_placeholder')}
              required
              disabled={loading}
            />
          </div>

          <div className="contact-form-group">
            <label htmlFor="message">{t('contact_form_message')}</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder={t('contact_form_message_placeholder')}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="contact-submit-btn" disabled={loading}>
            {loading ? t('contact_form_sending') : t('contact_form_submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;