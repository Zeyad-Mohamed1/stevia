"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getSlidersCategories } from "@/actions/slider";

export default function Banner() {
  const { data: slidersCategories, isLoading } = useQuery({
    queryKey: ["sliders-categories"],
    queryFn: getSlidersCategories,
  });

  // Get the first slider item or use fallback data
  const bannerData = slidersCategories?.[0] || {};

  // Fallback values in case data is not available
  const title =
    bannerData.title || "Must-Have Beauty Products for Glowing Skin";
  const description =
    bannerData.description ||
    "How to Choose the Perfect Skincare Routine for Your Skin Type";
  const buttonText = bannerData.button_text || "Buy at a discount - $69.99";
  const buttonUrl = bannerData.button_url || "/shop-default-grid";
  const backgroundImage =
    bannerData.image_path || "/images/banner/banner-cosmetic.jpg";

  if (isLoading) {
    return (
      <section className="flat-banner-parallax-v2">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="fl-content">
                <div className="title-top">
                  <div
                    className="skeleton-loader"
                    style={{ height: "20px", marginBottom: "10px" }}
                  ></div>
                  <div
                    className="skeleton-loader"
                    style={{ height: "40px", marginBottom: "10px" }}
                  ></div>
                  <div
                    className="skeleton-loader"
                    style={{ height: "20px", marginBottom: "20px" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flat-banner-parallax-v2"
      style={{ backgroundImage: `url("${backgroundImage}")` }}
    >
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="fl-content">
              <div className="title-top">
                {/* <span
                  className="subtitle text-btn-uppercase text-secondary-2 wow fadeInUp"
                  data-wow-delay="0s"
                >
                  Skin care
                </span> */}
                <h3 className="title wow fadeInUp" data-wow-delay="0.1s">
                  {title}
                </h3>
                <p className="body-text-1 wow fadeInUp" data-wow-delay="0.2s">
                  {description}
                </p>
              </div>
              <div className="wow fadeInUp" data-wow-delay="0.3s">
                <Link href={buttonUrl} className="tf-btn btn-fill">
                  <span className="text">{buttonText}</span>
                  <i className="icon icon-arrowUpRight" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
