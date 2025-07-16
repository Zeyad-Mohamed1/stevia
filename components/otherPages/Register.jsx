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
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [password, setPassword] = useState("");
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

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push(t("passwordTooShort"));
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(t("passwordNoUppercase"));
    }

    if (!/[a-z]/.test(password)) {
      errors.push(t("passwordNoLowercase"));
    }

    if (!/[0-9]/.test(password)) {
      errors.push(t("passwordNoNumber"));
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push(t("passwordNoSpecialChar"));
    }

    return errors;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // Validate password requirements
    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) {
      passwordValidationErrors.forEach((error) => toast.error(error));
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
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
                    value={password}
                    onChange={handlePasswordChange}
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
                {passwordErrors.length > 0 && (
                  <div className="password-requirements mt-2">
                    <small className="text-danger">
                      <strong>{t("passwordRequirements")}</strong>
                    </small>
                    <ul className="mt-1 mb-0 ps-3">
                      {passwordErrors.map((error, index) => (
                        <li key={index} className="text-danger small">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
