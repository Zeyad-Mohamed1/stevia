"use client";
import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { login } from "@/actions/auth";
import toast from "react-hot-toast";
import { Link as IntlLink, useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/store/userStore";

export default function Login() {
  const t = useTranslations("login");
  const { fetchUser, user } = useUserStore();
  const router = useRouter();
  const [passwordType, setPasswordType] = useState("password");
  const locale = useLocale();

  const togglePassword = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await login(formData);

      if (response.status === "error") {
        toast.error(
          locale === "ar"
            ? "خطأ في رقم الهاتف أو كلمة المرور"
            : "Invalid phone number or password"
        );
        return;
      }

      toast.success(t("loginSuccessful"));
      fetchUser();
      router.push("/");
      // Redirect or show success message
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(t("loginFailed"));
      // Show error message
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  if (user) {
    return null;
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4>{t("title")}</h4>
            </div>
            <form
              onSubmit={handleSubmit}
              className="form-login form-has-password"
            >
              <div className="wrap">
                <fieldset className="">
                  <input
                    className=""
                    type="tel"
                    placeholder={t("phone")}
                    name="phone"
                    tabIndex={1}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="position-relative password-item">
                  <input
                    className="input-password"
                    type={passwordType}
                    placeholder={t("password")}
                    name="password"
                    tabIndex={2}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                  <span
                    className={`toggle-password ${
                      !(passwordType === "text") ? "unshow" : ""
                    }`}
                    onClick={togglePassword}
                  >
                    <i
                      className={`icon-eye-${
                        !(passwordType === "text") ? "hide" : "show"
                      }-line`}
                    />
                  </span>
                </fieldset>
                {/* <div className="d-flex align-items-center justify-content-between">
                  <div className="tf-cart-checkbox">
                    <div className="tf-checkbox-wrapp">
                      <input
                        defaultChecked
                        className=""
                        type="checkbox"
                        id="login-form_agree"
                        name="remember"
                      />
                      <div>
                        <i className="icon-check" />
                      </div>
                    </div>
                    <label htmlFor="login-form_agree">
                      {" "}
                      {t("rememberMe")}{" "}
                    </label>
                  </div>
                  <IntlLink
                    href={`/forget-password`}
                    className="font-2 text-button forget-password link"
                  >
                    {t("forgotPassword")}
                  </IntlLink>
                </div> */}
              </div>
              <div className="button-submit">
                <button className="tf-btn btn-fill" type="submit">
                  <span className="text text-button">{t("loginButton")}</span>
                </button>
              </div>
            </form>
          </div>
          <div className="right">
            <h4 className="mb_8">{t("newCustomer")}</h4>
            <p className="text-secondary">{t("newCustomerDesc")}</p>
            <IntlLink href={`/register`} className="tf-btn btn-fill">
              <span className="text text-button">{t("registerButton")}</span>
            </IntlLink>
          </div>
        </div>
      </div>
    </section>
  );
}
