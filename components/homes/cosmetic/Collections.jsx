"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getCategories } from "@/actions/categories";

export default function Collections() {
  const t = useTranslations("categories");
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  if (isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center">
            <h3 className="heading">{t("shop_by_skin_concern")}</h3>
            <p className="subheading text-secondary">
              {t("fresh_styles_subtitle")}
            </p>
          </div>
          <div className="tf-grid-layout tf-col-2 md-col-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="collection-position-2 style-6">
                <div
                  className="img-style animate-pulse bg-gray-200"
                  style={{ height: 615 }}
                ></div>
                <div className="content">
                  <div className="cls-btn">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center">
            <h3 className="heading">{t("shop_by_skin_concern")}</h3>
            <p className="subheading text-secondary text-red-500">
              {t("error_loading_categories")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">{t("shop_by_skin_concern")}</h3>
          <p className="subheading text-secondary">
            {t("fresh_styles_subtitle")}
          </p>
        </div>
        <div className="tf-grid-layout tf-col-2 md-col-3">
          {categories?.slice(0, 6).map((category, index) => (
            <div
              className="collection-position-2 style-6 hover-img wow fadeInUp"
              data-wow-delay={`${index * 0.1}s`}
              key={category.id}
            >
              <Link
                href={`/products/${category.id}-${category.name}`}
                className="img-style"
              >
                <Image
                  className="ls-is-cached lazyloaded"
                  alt={category.name}
                  src={category.logo_path || "/images/placeholder-category.jpg"}
                  width={615}
                  height={615}
                  onError={(e) => {
                    e.target.src = "/images/placeholder-category.jpg";
                  }}
                />
              </Link>
              <div className="content">
                <Link
                  href={`/products/${category.id}-${category.name}`}
                  className="cls-btn"
                >
                  <h6 className="text-custom">{category.name}</h6>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
