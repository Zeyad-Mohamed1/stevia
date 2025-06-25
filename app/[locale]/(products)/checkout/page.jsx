import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Checkout from "@/components/otherPages/Checkout";
import { Link } from "@/i18n/navigation";
import React from "react";
import { getTranslations } from "next-intl/server";

export default async function CheckoutPage({ params }) {
  const t = await getTranslations("checkout");

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container">
          <h3 className="heading text-center">{t("title")}</h3>
          <ul className="breadcrumbs d-flex align-items-center justify-content-center">
            <li>
              <Link className="link" href={`/`}>
                {t("homepage")}
              </Link>
            </li>
            <li>
              <i className="icon-arrRight" />
            </li>
            <li>
              <Link className="link" href={`/shop-default-grid`}>
                {t("shop")}
              </Link>
            </li>
            <li>
              <i className="icon-arrRight" />
            </li>
            <li>{t("viewCart")}</li>
          </ul>
        </div>
      </div>
      <Checkout />
      <Footer1 />
    </>
  );
}
