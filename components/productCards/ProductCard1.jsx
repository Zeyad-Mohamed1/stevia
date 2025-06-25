"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import CountdownTimer from "../common/Countdown";
import { useContextElement } from "@/context/Context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavorites, updateFavorites } from "@/actions/products";
import { useUserStore } from "@/store/userStore";
import { useLocale } from "next-intl";

export default function ProductCard1({
  product: productData,
  gridClass = "",
  parentClass = "card-product wow fadeInUp",
  isNotImageRatio = false,
  radiusClass = "",
}) {
  const locale = useLocale();
  const [product, setProduct] = useState(productData);

  const [currentImage, setCurrentImage] = useState(productData.imgSrc);
  const [selectedColor, setSelectedColor] = useState(
    productData.colors?.[0] || null
  );
  const [selectedSize, setSelectedSize] = useState(
    productData.sizes?.[0] || null
  );
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  useEffect(() => {
    setProduct(productData);
    setCurrentImage(productData.imgSrc);
    setSelectedColor(productData.colors?.[0] || null);
    setSelectedSize(productData.sizes?.[0] || null);
  }, [productData]);

  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const router = useRouter();
  const { mutate: updateFavorite, isPending: isUpdatingFavorite } = useMutation(
    {
      mutationFn: (productId) => updateFavorites(productId),
      onSuccess: () => {
        // Optionally refetch favorites after successful update
        queryClient.invalidateQueries(["favorites"]);
      },
    }
  );

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getFavorites(),
  });

  const { setQuickAddItem, addProductToCart, isAddedToCartProducts } =
    useContextElement();

  // Helper function to calculate prices with discount
  const calculatePrices = (product) => {
    if (!product?.discount || !product?.price) {
      return {
        currentPrice: product?.price || 0,
        originalPrice: product?.oldPrice || null,
        hasDiscount: false,
      };
    }

    const originalPrice = product.price; // product.price is the original price
    const discountPercent = product.discount;

    // Calculate discounted price by subtracting discount percentage from original price
    // Formula: currentPrice = originalPrice - (originalPrice * discount/100)
    const currentPrice =
      originalPrice - (originalPrice * discountPercent) / 100;

    return {
      currentPrice,
      originalPrice,
      hasDiscount: true,
    };
  };

  // Get calculated prices
  const { currentPrice, originalPrice, hasDiscount } = calculatePrices(product);

  // Helper function to check if product is in favorites
  const isProductInFavorites = (productId) => {
    if (!favorites || isLoadingFavorites) return false;

    // Check if favorites is an array
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
    // Check if user is authenticated
    if (!user) {
      router.push("/login");
      return;
    }

    if (!isUpdatingFavorite) {
      updateFavorite(product.id);
    }
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    if (color.imgSrc) {
      setCurrentImage(color.imgSrc);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Handle quick add to cart with variants
  const handleQuickAddToCart = () => {
    // If product has colors or sizes, show quick select modal
    if (
      (product.colors?.length > 0 || product.sizes?.length > 0) &&
      !showQuickSelect
    ) {
      setShowQuickSelect(true);
      return;
    }

    // Auto-select first color and size if none are selected
    const finalSelectedColor =
      selectedColor || (product.colors?.length > 0 ? product.colors[0] : null);
    const finalSelectedSize =
      selectedSize || (product.sizes?.length > 0 ? product.sizes[0] : null);

    // Create a complete product object for the cart with selected variants
    const productForCart = {
      id: product.id,
      title: product.title,
      imgSrc: finalSelectedColor?.imgSrc || product.imgSrc,
      price: currentPrice,
      oldPrice: hasDiscount ? originalPrice : null,
      selectedColor: finalSelectedColor,
      selectedSize: finalSelectedSize,
      // Add unique cart ID to handle same product with different variants
      cartId: `${product.id}-${
        finalSelectedColor?.bgColor ||
        finalSelectedColor?.colorCode ||
        "default"
      }-${finalSelectedSize || "default"}`,
    };

    addProductToCart(productForCart);
    setShowQuickSelect(false);
  };

  // Handle add to cart - directly add without confirmation
  const handleAddToCart = () => {
    // Auto-select first color and size if none are selected
    const finalSelectedColor =
      selectedColor || (product.colors?.length > 0 ? product.colors[0] : null);
    const finalSelectedSize =
      selectedSize || (product.sizes?.length > 0 ? product.sizes[0] : null);

    // Create a complete product object for the cart with selected variants
    const productForCart = {
      id: product.id,
      title: product.title,
      imgSrc: finalSelectedColor?.imgSrc || product.imgSrc,
      price: currentPrice,
      oldPrice: hasDiscount ? originalPrice : null,
      selectedColor: finalSelectedColor,
      selectedSize: finalSelectedSize,
      // Add unique cart ID to handle same product with different variants
      cartId: `${product.id}-${
        finalSelectedColor?.bgColor ||
        finalSelectedColor?.colorCode ||
        "default"
      }-${finalSelectedSize || "default"}`,
    };

    addProductToCart(productForCart);
  };

  return (
    <div
      className={`${parentClass} ${gridClass} ${
        product?.isOnSale ? "on-sale" : ""
      } ${product?.sizes?.length > 0 ? "card-product-size" : ""}`}
    >
      <div
        className={`card-product-wrapper ${
          isNotImageRatio ? "aspect-ratio-0" : ""
        } ${radiusClass} `}
      >
        <Link
          href={`/product-detail/${product.id}-${product.title}`}
          className="product-img"
        >
          {currentImage && currentImage.trim() !== "" && (
            <Image
              className="lazyload img-product"
              src={currentImage}
              alt={product.title}
              width={600}
              height={800}
            />
          )}

          {product.imgHover && product.imgHover.trim() !== "" && (
            <Image
              className="lazyload img-hover"
              src={product.imgHover}
              alt={product.title}
              width={600}
              height={800}
            />
          )}
        </Link>

        {/* Quick Selection Modal */}
        {showQuickSelect && (
          <div
            className="quick-select-overlay"
            onClick={() => setShowQuickSelect(false)}
          >
            <div
              className="quick-select-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="quick-select-header">
                <h4>{product.title}</h4>
                <button
                  className="btn-close"
                  onClick={() => setShowQuickSelect(false)}
                >
                  <span className="icon icon-close"></span>
                </button>
              </div>

              <div className="quick-select-content">
                {/* Color Selection */}
                {product.colors?.length > 0 && (
                  <div className="variant-group">
                    <div className="variant-label">
                      {locale === "ar" ? "اللون" : "Color"}:{" "}
                      <span className="selected-value">
                        {selectedColor?.bgColor
                          ?.replace("bg-", "")
                          .replace("-", " ") ||
                          selectedColor?.name ||
                          selectedColor?.colorCode ||
                          (locale === "ar" ? "اختر اللون" : "Select Color")}
                      </span>
                    </div>
                    <div className="variant-options">
                      {product.colors.map((color, index) => (
                        <button
                          key={index}
                          className={`color-option ${
                            selectedColor === color ? "active" : ""
                          }`}
                          onClick={() => handleColorSelect(color)}
                          style={{
                            backgroundColor:
                              color.bgColor?.replace("bg-", "") ||
                              color.colorCode,
                          }}
                          title={
                            color.bgColor
                              ?.replace("bg-", "")
                              .replace("-", " ") ||
                            color.name ||
                            color.colorCode
                          }
                        >
                          <span
                            className="color-swatch"
                            style={{
                              backgroundColor:
                                color.bgColor?.replace("bg-", "") ||
                                color.colorCode,
                            }}
                          ></span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes?.length > 0 && (
                  <div className="variant-group">
                    <div className="variant-label">
                      {locale === "ar" ? "المقاس" : "Size"}:{" "}
                      <span className="selected-value">
                        {selectedSize ||
                          (locale === "ar" ? "اختر المقاس" : "Select Size")}
                      </span>
                    </div>
                    <div className="variant-options">
                      {product.sizes.map((size, index) => (
                        <button
                          key={index}
                          className={`size-option ${
                            selectedSize === size ? "active" : ""
                          }`}
                          onClick={() => handleSizeSelect(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                <div className="variant-price">
                  <span className="price">
                    {hasDiscount && originalPrice && (
                      <span className="old-price">
                        {locale === "ar"
                          ? `ج.م ${originalPrice.toFixed(2)}`
                          : `EGP ${originalPrice.toFixed(2)}`}
                      </span>
                    )}{" "}
                    {locale === "ar"
                      ? `ج.م ${currentPrice?.toFixed(2)}`
                      : `EGP ${currentPrice?.toFixed(2)}`}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={handleQuickAddToCart}
                >
                  {locale === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hot Sale Banner */}
        {product?.hotSale && (
          <div className="marquee-product bg-main">
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sale Badge */}
        {product?.isOnSale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">
              {locale === "ar"
                ? `${product?.discount}%`
                : `${product?.discount}%`}
            </span>
          </div>
        )}

        {/* Size List */}
        {product?.sizes?.length > 0 && (
          <div className="variant-wrap size-list">
            <ul className="variant-box">
              {product?.sizes?.map((size, index) => (
                <li key={index} className="size-item">
                  {size.value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Countdown */}
        {product?.countdown && (
          <div className="variant-wrap countdown-wrap">
            <div className="variant-box">
              <div
                className="js-countdown"
                data-timer={product?.countdown}
                data-labels="D :,H :,M :,S"
              >
                <CountdownTimer />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="list-product-btn">
          <a
            onClick={handleFavoriteToggle}
            className={`box-icon wishlist btn-icon-action ${
              isUpdatingFavorite ? "loading" : ""
            }`}
            style={{ pointerEvents: isUpdatingFavorite ? "none" : "auto" }}
          >
            <span
              className={`icon ${
                isProductInFavorites(product?.id)
                  ? "icon-heart-fill"
                  : "icon-heart"
              }`}
            />
            <span className="tooltip">
              {isProductInFavorites(product?.id)
                ? locale === "ar"
                  ? "إزالة من المفضلة"
                  : "Remove from Favorites"
                : locale === "ar"
                ? "أضف إلى المفضلة"
                : "Add to Favorites"}
            </span>
          </a>
        </div>

        {/* <div className="list-btn-main">
          {product?.addToCart === "Quick Add" ? (
            <a
              className="btn-main-product"
              href="#quickAdd"
              onClick={() => setQuickAddItem(product.id)}
              data-bs-toggle="modal"
            >
              {locale === "ar" ? "إضافة سريعة" : "Quick Add"}
            </a>
          ) : (
            <a className="btn-main-product" onClick={handleAddToCart}>
              {isAddedToCartProducts(product?.id)
                ? locale === "ar"
                  ? "تم الإضافة بالفعل"
                  : "Already Added"
                : locale === "ar"
                ? "أضف إلى السلة"
                : "ADD TO CART"}
            </a>
          )}
        </div> */}
      </div>

      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <span className="price">
          {hasDiscount && originalPrice && (
            <span className="old-price">
              {locale === "ar"
                ? `ج.م ${originalPrice.toFixed(2)}`
                : `EGP ${originalPrice.toFixed(2)}`}
            </span>
          )}{" "}
          {locale === "ar"
            ? `ج.م ${currentPrice?.toFixed(2)}`
            : `EGP ${currentPrice?.toFixed(2)}`}
        </span>
        {product?.colors?.length > 0 && (
          <ul className="list-color-product">
            {product?.colors?.map((color, index) => (
              <li
                key={index}
                className={`list-color-item color-swatch ${
                  currentImage === color.imgSrc ? "active" : ""
                }`}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
              >
                <span
                  className="swatch-value"
                  style={{
                    backgroundColor:
                      color.bgColor?.replace("bg-", "") ||
                      color.bgColor ||
                      color.colorCode,
                  }}
                />
                {color.imgSrc && color.imgSrc.trim() !== "" && (
                  <Image
                    className="lazyload"
                    src={color.imgSrc}
                    alt="color variant"
                    width={600}
                    height={800}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .quick-select-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .quick-select-modal {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .quick-select-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }

        .quick-select-header h4 {
          margin: 0;
          font-size: 18px;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
        }

        .variant-group {
          margin-bottom: 20px;
        }

        .variant-label {
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .selected-value {
          font-weight: normal;
          color: #666;
        }

        .variant-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .color-option {
          width: 28px;
          height: 28px;
          border: 2px solid #ddd;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          background: none;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .color-option.active {
          border-color: #000;
          transform: scale(1.1);
        }

        .color-swatch {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: block;
        }

        .list-color-product {
          display: flex;
          gap: 6px;
          margin: 8px 0 0 0;
          padding: 0;
          list-style: none;
        }

        .list-color-item {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
        }

        .list-color-item.active {
          border-color: #000;
          transform: scale(1.1);
        }

        .list-color-item:hover {
          transform: scale(1.1);
        }

        .swatch-value {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: block;
        }

        .list-color-item .lazyload {
          display: none;
        }

        .size-option {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
          font-size: 14px;
        }

        .size-option:hover:not(.disabled) {
          border-color: #000;
        }

        .size-option.active {
          background: #000;
          color: white;
          border-color: #000;
        }

        .size-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          text-decoration: line-through;
        }

        .variant-price {
          margin: 15px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .old-price {
          text-decoration: line-through;
          color: #999;
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
}
