import React, { useState } from 'react';
import { Button, Spin } from 'antd';
import { TranslationOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const LANG_MAP = {
  vi: 'vi',
  en: 'en',
  ja: 'ja',
};

const TranslateButton = ({ text }) => {
  const { t } = useTranslation();
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);

  const handleTranslate = async () => {
    if (translated) {
      setShowOriginal(!showOriginal);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/translate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: 'auto',
            target: LANG_MAP[i18n.language] || 'en',
          }),
        }
      );

      const data = await res.json();

      if (data?.translatedText) {
        setTranslated(data.translatedText);
        setShowOriginal(false);
      }
    } catch (err) {
      console.error('Lỗi dịch:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
        {showOriginal || !translated ? text : translated}
      </p>

      <Button
        type="link"
        size="small"
        icon={loading ? <Spin size="small" /> : <TranslationOutlined />}
        onClick={handleTranslate}
        style={{ padding: 0, height: 'auto', fontSize: 13 }}
        disabled={loading}
      >
        {translated
          ? showOriginal
            ? t('show_translation')
            : t('show_original')
          : t('translate_this')}
      </Button>
    </div>
  );
};

export default TranslateButton;
