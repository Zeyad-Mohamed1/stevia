"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { getTranslation, isRTL } from "@/utils/translations";
import { updateFavorites } from "@/actions/products";

export default function RelatedProducts({
  relatedProducts = [],
  locale = "en",
}) {
  const isRtl = isRTL(locale);
  const [loadingFavorites, setLoadingFavorites] = useState(new Set());

  const handleAddToFavorites = async (productId) => {
    setLoadingFavorites((prev) => new Set(prev).add(productId));

    try {
      await updateFavorites(productId);
      // You might want to show a success message here
    } catch (error) {
      console.error("Error updating favorites:", error);
      // You might want to show an error message here
    } finally {
      setLoadingFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (!relatedProducts || relatedProducts.length === 0) {
    return null; // Don't render if no related products
  }

  return (
    <section className="flat-spacing" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container flat-animate-tab">
        <ul
          className="tab-product justify-content-sm-center wow fadeInUp"
          data-wow-delay="0s"
          role="tablist"
        >
          <li className="nav-tab-item" role="presentation">
            <a href="#ralatedProducts" className="active" data-bs-toggle="tab">
              {getTranslation("relatedProducts", locale)}
            </a>
          </li>
        </ul>
        <div className="tab-content">
          <div
            className="tab-pane active show"
            id="ralatedProducts"
            role="tabpanel"
          >
            <Swiper
              className="swiper tf-sw-latest"
              dir={isRtl ? "rtl" : "ltr"}
              spaceBetween={15}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1200: { slidesPerView: 4, spaceBetween: 30 },
              }}
              modules={[Pagination]}
              pagination={{
                clickable: true,
                el: ".spd4",
              }}
            >
              {relatedProducts.map((product) => (
                <SwiperSlide key={product.id} className="swiper-slide">
                  <div className="card-product">
                    <div className="card-product-wrapper">
                      <Link
                        href={`/${locale}/product-detail/${product.id}-${product.name}`}
                        className="product-img"
                      >
                        <Image
                          className="lazyload img-product"
                          data-src={product.image_path}
                          alt={product.name}
                          src={product.image_path}
                          width={360}
                          height={360}
                        />
                        <Image
                          className="lazyload img-hover"
                          data-src={product.imgHover}
                          alt={product.name}
                          src={product.imgHover}
                          width={360}
                          height={360}
                        />
                      </Link>
                      <div className="list-product-btn absolute-2">
                        {/* <a
                          href="#quick_add"
                          data-bs-toggle="modal"
                          className="box-icon bg_white quick-add tf-btn-loading"
                        >
                          <span className="icon icon-bag" />
                          <span className="tooltip">
                            {getTranslation("quickAdd", locale)}
                          </span>
                        </a> */}
                        <a
                          href="#"
                          className="box-icon bg_white wishlist btn-icon-action"
                          onClick={() => handleAddToFavorites(product.id)}
                        >
                          <span
                            className={`icon ${
                              loadingFavorites.has(product.id)
                                ? "icon-loading"
                                : "icon-heart"
                            }`}
                          />
                          <span className="tooltip">
                            {loadingFavorites.has(product.id)
                              ? getTranslation("loading", locale) ||
                                "Loading..."
                              : getTranslation("addToWishlist", locale)}
                          </span>
                        </a>
                        {/* <a
                          href="#"
                          className="box-icon bg_white compare btn-icon-action"
                        >
                          <span className="icon icon-gitDiff" />
                          <span className="tooltip">
                            {getTranslation("addToCompare", locale)}
                          </span>
                        </a> */}
                        {/* <a
                          href="#quick_view"
                          data-bs-toggle="modal"
                          className="box-icon bg_white quickview tf-btn-loading"
                        >
                          <span className="icon icon-eye" />
                          <span className="tooltip">
                            {getTranslation("quickView", locale)}
                          </span>
                        </a> */}
                      </div>
                      {product.discount > 0 && (
                        <div className="on-sale-wrap text-end">
                          <div className="on-sale-item">
                            {locale === "ar"
                              ? `${product.discount}%`
                              : `-${product.discount}%`}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="card-product-info">
                      <Link
                        href={`/${locale}/product-detail/${product.id}-${product.name}`}
                        className="title link"
                      >
                        {product.name}
                      </Link>
                      {product.weight && (
                        <div className="product-weight text-caption-2">
                          {locale === "ar" ? "الوزن:" : "Weight:"}{" "}
                          {product.weight}
                        </div>
                      )}
                      <span className="price">
                        {/* Show original price (crossed out) if there's a discount */}
                        {/* {product.discount > 0 && (
                          <span className="compare-at-price">
                            {locale === "ar"
                              ? `ج.م ${product.price?.toFixed(2)}`
                              : `EGP ${product.price?.toFixed(2)}`}
                          </span>
                        )} */}
                        {/* Current price after discount calculation */}
                        {locale === "ar"
                          ? `ج.م ${(product.discount > 0
                              ? (product.price * (100 - product.discount)) / 100
                              : product.price
                            )?.toFixed(2)}`
                          : `EGP ${(product.discount > 0
                              ? (product.price * (100 - product.discount)) / 100
                              : product.price
                            )?.toFixed(2)}`}
                      </span>
                      {/* {product.category && (
                        <div className="product-category text-caption-2">
                          {product.category.name}
                        </div>
                      )} */}
                    </div>
                  </div>
                </SwiperSlide>
              ))}

              <div className="sw-pagination-latest spd4 sw-dots type-circle justify-content-center" />
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
