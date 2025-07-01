"use client";
import React, { useEffect, useState } from "react";
import Slider1 from "../sliders/Slider1";
import QuantitySelect from "../QuantitySelect";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import ProductStikyBottom from "../ProductStikyBottom";
import { getTranslation, isRTL } from "@/utils/translations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavorites, updateFavorites } from "@/actions/products";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "@/i18n/navigation";

export default function Details1({ product, locale = "en" }) {
  const [quantity, setQuantity] = useState(1);

  const {
    addProductToCart,
    isAddedToCartProducts,
    cartProducts,
    updateQuantity,
  } = useContextElement();

  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const router = useRouter();
  const isRtl = isRTL(locale);

  const { mutate: updateFavorite, isPending: isUpdatingFavorite } = useMutation(
    {
      mutationFn: (productId) => updateFavorites(productId),
      onSuccess: () => {
        queryClient.invalidateQueries(["favorites"]);
      },
    }
  );

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getFavorites(),
    enabled: !!user,
  });

  // Helper function to check if product is in favorites
  const isProductInFavorites = (productId) => {
    if (!favorites || isLoadingFavorites) return false;
    if (!Array.isArray(favorites)) {
      console.warn("Favorites data is not an array:", favorites);
      return false;
    }
    return favorites.some(
      (fav) =>
        fav.id === productId || fav.productId === productId || fav === productId
    );
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!isUpdatingFavorite) {
      updateFavorite(product.id);
    }
  };

  console.log("product", product);

  return (
    <section className="flat-spacing" dir={isRtl ? "rtl" : "ltr"}>
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            {/* Product default */}
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <Slider1 firstItem={product.image_path} media={product.media} />
              </div>
            </div>
            {/* tf-product-info-list */}
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative mw-100p-hidden ">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-heading">
                    <div className="tf-product-info-name">
                      <div className="text text-btn-uppercase">
                        {product.category?.name ||
                          getTranslation("category", locale)}
                      </div>
                      <h3 className="name">{product.name}</h3>

                      <div className="sub">
                        <div className="tf-product-info-rate">
                          <div className="list-star">
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                          </div>
                          <div className="text text-caption-1">
                            (134 {getTranslation("reviews", locale)})
                          </div>
                        </div>
                        <div className="tf-product-info-sold">
                          <i className="icon icon-lightning" />
                          <div className="text text-caption-1">
                            {product.is_available
                              ? getTranslation("available", locale)
                              : getTranslation("outOfStock", locale)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="tf-product-info-desc">
                      <div className="tf-product-info-price">
                        {product.discount > 0 ? (
                          <>
                            <h5 className="price-on-sale font-2">
                              {locale === "ar"
                                ? `ج.م ${(
                                    product.price *
                                    (1 - product.discount / 100)
                                  ).toFixed(2)}`
                                : `EGP ${(
                                    product.price *
                                    (1 - product.discount / 100)
                                  ).toFixed(2)}`}
                            </h5>
                            <div className="compare-at-price font-2">
                              {locale === "ar"
                                ? `ج.م ${product.price?.toFixed(2)}`
                                : `EGP ${product.price?.toFixed(2)}`}
                            </div>
                            <div className="badges-on-sale text-btn-uppercase">
                              -{product.discount}%
                            </div>
                          </>
                        ) : (
                          <h5 className="price-on-sale font-2">
                            {locale === "ar"
                              ? `ج.م ${product.price?.toFixed(2)}`
                              : `EGP ${product.price?.toFixed(2)}`}
                          </h5>
                        )}
                      </div>
                      {product.weight && (
                        <div className="tf-product-info-weight">
                          <p className="text-caption-1">
                            <span className="weight-label">
                              {locale === "ar" ? "الوزن:" : "Weight:"}
                            </span>{" "}
                            <span className="weight-value">
                              {product.weight}
                            </span>
                          </p>
                        </div>
                      )}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: product.description,
                        }}
                        className="product-description"
                      />
                      {/* <div className="tf-product-info-liveview">
                        <i className="icon icon-eye" />
                        <p className="text-caption-1">
                          <span className="liveview-count">28</span>{" "}
                          {getTranslation("peopleViewing", locale)}
                        </p>
                      </div> */}
                    </div>
                  </div>
                  <div className="tf-product-info-choose-option">
                    <div className="tf-product-info-quantity">
                      <div className="title mb_12">
                        {getTranslation("quantity", locale)}:
                      </div>
                      <QuantitySelect
                        quantity={
                          isAddedToCartProducts(product.id)
                            ? cartProducts.filter(
                                (elm) => elm.id == product?.id
                              )[0].quantity
                            : quantity
                        }
                        setQuantity={(qty) => {
                          if (isAddedToCartProducts(product?.id)) {
                            updateQuantity(product?.id, qty);
                          } else {
                            setQuantity(qty);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <div className="tf-product-info-by-btn mb_10">
                        <a
                          onClick={() => {
                            // Calculate the final price after discount
                            const finalPrice =
                              product.discount > 0
                                ? product.price * (1 - product.discount / 100)
                                : product.price;

                            // Create a complete product object for the cart with weight
                            const productForCart = {
                              id: product.id,
                              name: product.name,
                              title: product.name,
                              image_path: product.image_path,
                              imgSrc: product.image_path,
                              price: finalPrice,
                              originalPrice: product.price,
                              discount: product.discount,
                              category: product.category,
                              weight: product.weight,
                              quantity: quantity,
                              cartId: `${product.id}`,
                            };

                            addProductToCart(productForCart, quantity, true);
                          }}
                          className="btn-style-2 flex-grow-1 text-btn-uppercase fw-6 btn-add-to-cart"
                        >
                          <span>
                            {isAddedToCartProducts(product?.id)
                              ? getTranslation("alreadyAdded", locale)
                              : getTranslation("addToCart", locale) + " -"}
                          </span>
                          <span className="tf-qty-price total-price">
                            {locale === "ar" ? `ج.م ` : `EGP `}
                            {isAddedToCartProducts(product?.id)
                              ? (
                                  (product.discount > 0
                                    ? product.price *
                                      (1 - product.discount / 100)
                                    : product.price) *
                                  cartProducts.filter(
                                    (elm) => elm.id == product?.id
                                  )[0].quantity
                                ).toFixed(2)
                              : (
                                  (product.discount > 0
                                    ? product.price *
                                      (1 - product.discount / 100)
                                    : product.price) * quantity
                                ).toFixed(2)}
                          </span>
                        </a>
                        <a
                          onClick={handleFavoriteToggle}
                          className={`box-icon hover-tooltip text-caption-2 wishlist btn-icon-action ${
                            isUpdatingFavorite ? "loading" : ""
                          }`}
                          style={{
                            pointerEvents: isUpdatingFavorite ? "none" : "auto",
                          }}
                        >
                          <span
                            className={`icon ${
                              isProductInFavorites(product?.id)
                                ? "icon-heart-fill"
                                : "icon-heart"
                            }`}
                          />
                          <span className="tooltip text-caption-2">
                            {isProductInFavorites(product?.id)
                              ? getTranslation("alreadyWishlisted", locale)
                              : getTranslation("wishlist", locale)}
                          </span>
                        </a>
                      </div>
                    </div>
                    <div className="tf-product-info-help">
                      <div className="tf-product-info-extra-link">
                        <a className="tf-product-extra-icon">
                          <div className="icon">
                            <i className="icon-shipping" />
                          </div>
                          <p className="text-caption-1">
                            {getTranslation("deliveryReturn", locale)}
                          </p>
                        </a>
                        {/* <a
                          href="#ask_question"
                          data-bs-toggle="modal"
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-question" />
                          </div>
                          <p className="text-caption-1">
                            {getTranslation("askQuestion", locale)}
                          </p>
                        </a>
                        <a
                          href="#share_social"
                          data-bs-toggle="modal"
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-share" />
                          </div>
                          <p className="text-caption-1">
                            {getTranslation("share", locale)}
                          </p>
                        </a> */}
                      </div>
                      <div className="tf-product-info-time">
                        <div className="icon">
                          <i className="icon-timer" />
                        </div>
                        <p className="text-caption-1">
                          {getTranslation("estimatedDelivery", locale)}
                          :&nbsp;&nbsp;
                          <span>
                            {getTranslation("internationalDays", locale)}
                          </span>
                          {/* ({getTranslation("international", locale)}),{" "} */}
                          {/* <span>{getTranslation("domesticDays", locale)}</span>{" "} */}
                          {/* ({getTranslation("unitedStates", locale)}) */}
                        </p>
                      </div>
                      <div className="tf-product-info-return">
                        <div className="icon">
                          <i className="icon-arrowClockwise" />
                        </div>
                        <p className="text-caption-1">
                          {getTranslation("returnPolicy", locale)}{" "}
                          <span>{getTranslation("returnDays", locale)}</span>{" "}
                          {getTranslation("returnPolicyDesc", locale)}
                        </p>
                      </div>
                      {/* <div className="dropdown dropdown-store-location">
                        <div
                          className="dropdown-title dropdown-backdrop"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                        >
                          <div className="tf-product-info-view link">
                            <div className="icon">
                              <i className="icon-map-pin" />
                            </div>
                            <span>
                              {getTranslation("viewStoreInfo", locale)}
                            </span>
                          </div>
                        </div>
                        <div className="dropdown-menu dropdown-menu-end">
                          <div className="dropdown-content">
                            <div className="dropdown-content-heading">
                              <h5>{getTranslation("storeLocation", locale)}</h5>
                              <i className="icon icon-close" />
                            </div>
                            <div className="line-bt" />
                            <div>
                              <h6>{getTranslation("storeName", locale)}</h6>
                              <p>{getTranslation("pickupAvailable", locale)}</p>
                            </div>
                            <div>
                              <p>766 Rosalinda Forges Suite 044,</p>
                              <p>Gracielahaven, Oregon</p>
                            </div>
                          </div>
                        </div>
                      </div> */}
                    </div>
                    {/* <ul className="tf-product-info-sku">
                      <li>
                        <p className="text-caption-1">
                          {getTranslation("sku", locale)}:
                        </p>
                        <p className="text-caption-1 text-1">53453412</p>
                      </li>
                      <li>
                        <p className="text-caption-1">
                          {getTranslation("vendor", locale)}:
                        </p>
                        <p className="text-caption-1 text-1">
                          {getTranslation("vendorName", locale)}
                        </p>
                      </li>
                      <li>
                        <p className="text-caption-1">
                          {getTranslation("availability", locale)}:
                        </p>
                        <p className="text-caption-1 text-1">
                          {product.is_available
                            ? getTranslation("inStock", locale)
                            : getTranslation("outOfStock", locale)}
                        </p>
                      </li>
                      <li>
                        <p className="text-caption-1">
                          {getTranslation("categories", locale)}:
                        </p>
                        <p className="text-caption-1">
                          <a href="#" className="text-1 link">
                            {getTranslation("clothes", locale)}
                          </a>
                          ,
                          <a href="#" className="text-1 link">
                            {getTranslation("women", locale)}
                          </a>
                          ,
                          <a href="#" className="text-1 link">
                            {getTranslation("tshirt", locale)}
                          </a>
                        </p>
                      </li>
                    </ul> */}
                    <div className="tf-product-info-guranteed">
                      <div className="text-title">
                        {getTranslation("guaranteedCheckout", locale)}:
                      </div>
                      <div className="tf-payment">
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-1.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-2.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-3.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-4.png"
                            width={98}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-5.png"
                            width={102}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-6.png"
                            width={98}
                            height={64}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /tf-product-info-list */}
          </div>
        </div>
      </div>
      <ProductStikyBottom />
    </section>
  );
}
