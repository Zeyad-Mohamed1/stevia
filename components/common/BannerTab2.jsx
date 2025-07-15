"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { getSlidersProducts } from "@/actions/slider";
import { useQuery } from "@tanstack/react-query";

export default function BannerTab2({ parentClass = "flat-spacing pt-0" }) {
  const { data } = useQuery({
    queryKey: ["products37"],
    queryFn: getSlidersProducts,
  });
  const locale = useLocale();

  // Use API data if available, fallback to static data
  const bannerData = data || {
    title: "Ready to Glow?",
    content: "",
    items: [],
  };
  const displayItems = bannerData.items || [];
  useEffect(() => {
    const offsetX = 20;
    const offsetY = 20;

    const handleMouseMove = (e) => {
      const hoverImage = e.currentTarget.querySelector(".hover-image");
      if (hoverImage) {
        hoverImage.style.top = `${e.clientY + offsetY}px`;
        hoverImage.style.left = `${e.clientX + offsetX}px`;
      }
    };

    const handleMouseEnter = (e) => {
      const hoverImage = e.currentTarget.querySelector(".hover-image");
      if (hoverImage) {
        hoverImage.style.display = "block";
        hoverImage.style.transform = "scale(1)";
        hoverImage.style.opacity = "1";
      }
    };

    const handleMouseLeave = (e) => {
      const hoverImage = e.currentTarget.querySelector(".hover-image");
      if (hoverImage) {
        hoverImage.style.transform = "scale(0)";
        hoverImage.style.opacity = "0";
        // Add a small delay before hiding to allow smooth transition
        setTimeout(() => {
          if (hoverImage.style.opacity === "0") {
            hoverImage.style.display = "none";
          }
        }, 300); // Match the CSS transition duration
      }
    };

    const elements = document.querySelectorAll(".hover-cursor-img");

    // Initialize hover images with proper initial state
    elements.forEach((el) => {
      const hoverImage = el.querySelector(".hover-image");
      if (hoverImage) {
        hoverImage.style.position = "fixed";
        hoverImage.style.transform = "scale(0)";
        hoverImage.style.opacity = "0";
        hoverImage.style.display = "none";
        hoverImage.style.pointerEvents = "none";
        hoverImage.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        hoverImage.style.zIndex = "1000";
      }

      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [displayItems]);

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="row flat-img-with-text-v2">
          <div className="col-lg-7 col-md-6">
            <div className="banner-left">
              <div className="box-title wow fadeInUp">
                <h3>
                  {bannerData.title}
                  <br className="d-none d-lg-block" />
                </h3>
                <p>{bannerData.content}</p>
              </div>
              <ul className="tab-banner" role="tablist">
                {displayItems.map((item, index) => (
                  <li
                    key={item.id}
                    className={`nav-tab-item wow fadeInUp`}
                    data-wow-delay={item.delay || `${index * 0.1}s`}
                    role="presentation"
                  >
                    <a
                      href={`#tabBannerCls${item.id}`}
                      className={`nav-tab-link hover-cursor-img ${
                        item.active || index === 0 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                    >
                      <h5 className="title text-line-clamp-1">
                        {item.title || item.name || `Product ${item.id}`}
                      </h5>
                      <div className="arr-link">
                        <span className="text-btn-uppercase text-more">
                          More
                        </span>
                        <i className="icon icon-arrowUpRight" />
                      </div>
                      <div className="hover-image">
                        <Image
                          alt="Hover Image"
                          src={
                            item.image_path ||
                            item.image ||
                            "/images/products/default.jpg"
                          }
                          width={710}
                          height={945}
                        />
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="wow fadeInUp">
                <Link href={`/collections`} className="btn-line">
                  {locale === "ar" ? "عرض الكل" : "View All Collection"}
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-5 col-md-6">
            <div className="banner-right flat-animate-tab">
              <div className="tab-content">
                {displayItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`tab-pane ${
                      item.active || index === 0 ? "active show" : ""
                    }`}
                    id={`tabBannerCls${item.id}`}
                    role="tabpanel"
                  >
                    <div className="collection-position-2 hover-img">
                      <Link
                        href={`/product-detail/${item?.id}`}
                        className="img-style"
                      >
                        <Image
                          className="lazyload"
                          data-src={
                            item?.image_path ||
                            item?.image ||
                            "/images/products/default.jpg"
                          }
                          alt="banner-cls"
                          src={
                            item?.image_path ||
                            item?.image ||
                            "/images/products/default.jpg"
                          }
                          width={710}
                          height={945}
                        />
                        {Boolean(
                          item?.discount && Number(item.discount) > 0
                        ) && (
                          <div className="on-sale-wrap">
                            <span className="on-sale-item">
                              {item.discount}%
                            </span>
                          </div>
                        )}
                      </Link>
                      <div className="content cls-content">
                        <div className="cls-info">
                          <Link
                            href={`/product-detail/${item?.id}`}
                            className="text-title link text-line-clamp-1"
                          >
                            {item?.title || item?.name || `Product ${item?.id}`}
                          </Link>
                          <div className="price">
                            {/* {item?.oldPrice && (
                              <span className="old-price">
                                {locale === "ar"
                                  ? `ج.م ${item.oldPrice.toFixed(2)}`
                                  : `EGP ${item.oldPrice.toFixed(2)}`}
                              </span>
                            )} */}
                            <span className="new-price">
                              {locale === "ar"
                                ? `ج.م ${item?.price?.toFixed(2)}`
                                : `EGP ${item?.price?.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                        {/* <a
                          href="#quickView"
                          onClick={() => setQuickViewItem(item)}
                          data-bs-toggle="modal"
                          className="cls-btn text-btn-uppercase"
                        >
                          Quick View
                        </a> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
