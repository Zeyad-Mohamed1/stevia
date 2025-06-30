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

  useEffect(() => {
    setProduct(productData);
    setCurrentImage(productData.imgSrc);
  }, [productData]);

  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const router = useRouter();

  console.log("User state:", user);
  console.log("Product ID:", product?.id);
  const { mutate: updateFavorite, isPending: isUpdatingFavorite } = useMutation(
    {
      mutationFn: (productId) => updateFavorites(productId),
      onSuccess: (response) => {
        console.log("Favorite update response:", response);
        // Check if the response indicates success
        if (response?.status === "success" || response?.message === "success") {
          // Optionally refetch favorites after successful update
          queryClient.invalidateQueries(["favorites"]);
          console.log("Successfully updated favorites");
        } else {
          console.error("Favorite update failed:", response);
          alert(
            locale === "ar"
              ? "فشل في تحديث المفضلة"
              : "Failed to update favorites"
          );
        }
      },
      onError: (error) => {
        console.error("Error updating favorites:", error);
        alert(
          locale === "ar"
            ? "حدث خطأ أثناء تحديث المفضلة"
            : "Error updating favorites"
        );
      },
    }
  );

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getFavorites(),
    enabled: !!user, // Only fetch favorites when user is logged in
    onError: (error) => {
      console.error("Error fetching favorites:", error);
    },
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

    const isInFavorites = favorites.some(
      (fav) =>
        fav.id === productId || fav.productId === productId || fav === productId
    );

    console.log(`Product ${productId} in favorites:`, isInFavorites, favorites);
    return isInFavorites;
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    // Check if user is authenticated
    if (!user) {
      alert(locale === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please login first");
      router.push("/login");
      return;
    }

    if (!isUpdatingFavorite) {
      console.log("Updating favorite for product:", product.id);
      updateFavorite(product.id);
    }
  };

  // Handle quick add to cart
  const handleQuickAddToCart = () => {
    // Create a complete product object for the cart
    const productForCart = {
      id: product.id,
      title: product.title,
      imgSrc: product.imgSrc,
      price: currentPrice,
      oldPrice: hasDiscount ? originalPrice : null,
      weight: product.weight,
      cartId: `${product.id}`,
    };

    addProductToCart(productForCart);
  };

  // Handle add to cart - directly add without confirmation
  const handleAddToCart = () => {
    // Create a complete product object for the cart
    const productForCart = {
      id: product.id,
      title: product.title,
      imgSrc: product.imgSrc,
      price: currentPrice,
      oldPrice: hasDiscount ? originalPrice : null,
      weight: product.weight,
      cartId: `${product.id}`,
    };

    addProductToCart(productForCart);
  };

  return (
    <div
      className={`${parentClass} ${gridClass} ${
        product?.isOnSale ? "on-sale" : ""
      }`}
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
            style={{
              pointerEvents: isUpdatingFavorite ? "none" : "auto",
              opacity: isUpdatingFavorite ? 0.6 : 1,
            }}
          >
            {isUpdatingFavorite ? (
              <span className="icon icon-loading" />
            ) : (
              <span
                className={`icon ${
                  isProductInFavorites(product?.id)
                    ? "icon-heart-fill"
                    : "icon-heart"
                }`}
              />
            )}
            <span className="tooltip">
              {isUpdatingFavorite
                ? locale === "ar"
                  ? "جاري التحديث..."
                  : "Updating..."
                : isProductInFavorites(product?.id)
                ? locale === "ar"
                  ? "إزالة من المفضلة"
                  : "Remove from Favorites"
                : locale === "ar"
                ? "أضف إلى المفضلة"
                : "Add to Favorites"}
            </span>
          </a>
        </div>

        <div className="list-btn-main">
          <a className="btn-main-product" onClick={handleAddToCart}>
            {isAddedToCartProducts(product?.id)
              ? locale === "ar"
                ? "تم الإضافة بالفعل"
                : "Already Added"
              : locale === "ar"
              ? "أضف إلى السلة"
              : "ADD TO CART"}
          </a>
        </div>
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
        {product?.weight && (
          <div className="product-weight">
            <span className="weight-label">
              {locale === "ar" ? "الوزن:" : "Weight:"}{" "}
            </span>
            <span className="weight-value">{product.weight}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .old-price {
          text-decoration: line-through;
          color: #999;
          margin-right: 8px;
        }

        .product-weight {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #666;
        }

        .weight-label {
          font-weight: 500;
        }

        .weight-value {
          font-weight: 400;
          color: #333;
        }
      `}</style>
    </div>
  );
}
