import { Link, useRouteError } from "react-router-dom";
import { Button, Result } from "antd";

// ⭐ i18n
import { useTranslation } from "react-i18next";

export default function ErrorPage() {
  const error = useRouteError();
  const { t } = useTranslation();

  console.error(error);

  return (
    <div id="error-page">
      <Result
        status="404"
        title={t("error_title")}
        subTitle={error?.statusText || error?.message || t("error_unknown")}
        extra={
          <Button type="primary">
            <Link to="/">
              <span>{t("back_home")}</span>
            </Link>
          </Button>
        }
      />
    </div>
  );
}
