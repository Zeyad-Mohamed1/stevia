"use client";

import { useEffect, useState } from "react";
import { register } from "@/actions/auth";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link as IntlLink, useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/store/userStore";

export default function Register() {
  const router = useRouter();
  const t = useTranslations("register");
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const { fetchUser, user } = useUserStore();

  const togglePassword = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Check if passwords match
    if (formData.get("password") !== formData.get("confirmPassword")) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    try {
      const response = await register(formData);
      toast.success(t("registrationSuccessful"));
      fetchUser();
      router.push("/");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(t("registrationFailed"));
      // Show error message
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

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
                    type="text"
                    placeholder={t("firstName")}
                    name="fname"
                    tabIndex={1}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="">
                  <input
                    className=""
                    type="text"
                    placeholder={t("lastName")}
                    name="lname"
                    tabIndex={2}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="">
                  <input
                    className=""
                    type="email"
                    placeholder={t("email")}
                    name="email"
                    tabIndex={3}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="">
                  <input
                    className=""
                    type="tel"
                    placeholder={t("phone")}
                    name="phone"
                    tabIndex={4}
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
                    tabIndex={5}
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

                <fieldset className="position-relative password-item">
                  <input
                    className="input-password"
                    type={confirmPasswordType}
                    placeholder={t("confirmPassword")}
                    name="confirmPassword"
                    tabIndex={6}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                  <span
                    className={`toggle-password ${
                      !(confirmPasswordType === "text") ? "unshow" : ""
                    }`}
                    onClick={toggleConfirmPassword}
                  >
                    <i
                      className={`icon-eye-${
                        !(confirmPasswordType === "text") ? "hide" : "show"
                      }-line`}
                    />
                  </span>
                </fieldset>
                <div className="d-flex align-items-center">
                  <div className="tf-cart-checkbox">
                    <div className="tf-checkbox-wrapp">
                      <input
                        defaultChecked
                        className=""
                        type="checkbox"
                        id="login-form_agree"
                        name="agree_checkbox"
                      />
                      <div>
                        <i className="icon-check" />
                      </div>
                    </div>
                    <label
                      className="text-secondary-2"
                      htmlFor="login-form_agree"
                    >
                      {t("termsAgree")}&nbsp;
                    </label>
                  </div>
                  <IntlLink href={`/term-of-use`} title="Terms of Service">
                    {t("termsOfUse")}
                  </IntlLink>
                </div>
              </div>
              <div className="button-submit">
                <button className="tf-btn btn-fill" type="submit">
                  <span className="text text-button">
                    {t("registerButton")}
                  </span>
                </button>
              </div>
            </form>
          </div>
          <div className="right">
            <h4 className="mb_8">{t("alreadyHaveAccount")}</h4>
            <p className="text-secondary">{t("welcomeBack")}</p>
            <IntlLink href={`/login`} className="tf-btn btn-fill">
              <span className="text text-button">{t("loginButton")}</span>
            </IntlLink>
          </div>
        </div>
      </div>
    </section>
  );
}
