"use client";
import React, { useRef, useState } from "react";
import { getSettings, sendContact } from "@/actions/main";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

export default function Contact2() {
  const locale = useLocale();
  const t = useTranslations("contact");

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const contactData = {
      name: name,
      email: email,
      subject: subject,
      message: message,
    };

    try {
      const response = await sendContact(contactData);
      console.log("response from contact", response);
      setSuccess(true);
      resetForm();
      handleShowMessage();
    } catch (error) {
      console.error("Error sending contact:", error);
      setSuccess(false);
      handleShowMessage();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flat-spacing">
        <div className="container">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flat-spacing">
        <div className="container">{t("errorLoading")}</div>
      </div>
    );
  }

  const phoneNumbers = settings?.mobiles || [];
  const emails = settings?.emails || [];
  const address = settings?.settings?.addresse || "";

  // Get localized content from settings
  const getLocalizedContent = (field) => {
    if (!settings?.settings?.translations)
      return settings?.settings?.[field] || "";

    const translation = settings.settings.translations.find(
      (t) => t.locale === locale
    );
    return translation?.[field] || settings.settings[field] || "";
  };

  return (
    <>
      <div
        style={{ height: "450px", width: "100%", border: 0 }}
        dangerouslySetInnerHTML={{
          __html: settings?.settings?.location_url,
        }}
      />
      <section className="flat-spacing" dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="container">
          <div className="contact-us-content">
            <div className="left">
              <h4>{t("getInTouch")}</h4>
              <p className="text-secondary-2">{t("formDescription")}</p>
              <div
                className={`tfSubscribeMsg  footer-sub-element ${
                  showMessage ? "active" : ""
                }`}
              >
                {success && (
                  <p>
                    {locale === "ar"
                      ? "تم الارسال بنجاح"
                      : "Message sent successfully"}
                  </p>
                )}
              </div>
              <form
                onSubmit={handleSubmit}
                ref={formRef}
                id="contactform"
                className="form-leave-comment"
              >
                <div className="wrap">
                  <div className="cols">
                    <fieldset className="">
                      <input
                        className=""
                        type="text"
                        placeholder={t("namePlaceholder")}
                        name="name"
                        id="name"
                        tabIndex={2}
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                        aria-required="true"
                        required
                        disabled={isSubmitting}
                      />
                    </fieldset>
                    <fieldset className="">
                      <input
                        className=""
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        name="email"
                        id="email"
                        tabIndex={2}
                        value={email || ""}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-required="true"
                        required
                        disabled={isSubmitting}
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset className="">
                      <input
                        className=""
                        type="text"
                        placeholder={t("subjectPlaceholder")}
                        name="subject"
                        id="subject"
                        tabIndex={2}
                        value={subject || ""}
                        onChange={(e) => setSubject(e.target.value)}
                        aria-required="true"
                        required
                        disabled={isSubmitting}
                      />
                    </fieldset>
                  </div>
                  <fieldset className="">
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      placeholder={t("messagePlaceholder")}
                      tabIndex={2}
                      aria-required="true"
                      required
                      value={message || ""}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </fieldset>
                </div>
                <div className="button-submit send-wrap">
                  <button
                    className="tf-btn btn-fill"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <span className="text text-button">
                      {isSubmitting ? t("sending") : t("sendMessage")}
                    </span>
                  </button>
                </div>
              </form>
            </div>
            <div className="right">
              <h4>{t("information")}</h4>

              {phoneNumbers.length > 0 && (
                <div className="mb_20">
                  <div className="text-title mb_8">{t("phone")}:</div>
                  {phoneNumbers.map((phone, index) => {
                    // Get localized name for phone
                    const localizedName =
                      phone.translations?.find((t) => t.locale === locale)
                        ?.name || phone.name;
                    return (
                      <p key={phone.id || index} className="text-secondary">
                        {phone.mobile} ({localizedName})
                      </p>
                    );
                  })}
                </div>
              )}

              {emails.length > 0 && (
                <div className="mb_20">
                  <div className="text-title mb_8">{t("email")}:</div>
                  {emails.map((emailItem, index) => (
                    <p key={emailItem.id || index} className="text-secondary">
                      {emailItem.email}
                    </p>
                  ))}
                </div>
              )}

              {address && (
                <div className="mb_20">
                  <div className="text-title mb_8">{t("address")}:</div>
                  <p className="text-secondary">{address}</p>
                </div>
              )}

              {/* <div>
              <div className="text-title mb_8">Open Time:</div>
              <p className="mb_4 open-time">
                <span className="text-secondary">Mon - Sat:</span> 7:30am -
                8:00pm PST
              </p>
              <p className="open-time">
                <span className="text-secondary">Sunday:</span> 9:00am - 5:00pm
                PST
              </p>
            </div> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
