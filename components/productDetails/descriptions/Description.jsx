import React from "react";
import Image from "next/image";
import { getTranslation, isRTL } from "@/utils/translations";

export default function Description({ product, locale = "en" }) {
  const isRtl = isRTL(locale);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="right">
        <div className="letter-1 text-btn-uppercase mb_12">
          {product?.name || "Product Name"}
        </div>
        <div
          className="mb_12 text-secondary"
          dangerouslySetInnerHTML={{ __html: product?.description || "" }}
        />
      </div>
      <div className="left">
        <div className="letter-1 text-btn-uppercase mb_12">
          {getTranslation("productInformation", locale)}
        </div>
        <ul className="list-text type-disc mb_12 gap-6">
          <li className="font-2">
            {getTranslation("price", locale)}:{" "}
            {locale === "ar"
              ? `ج.م ${product?.price || "0.00"}`
              : `EGP ${product?.price || "0.00"}`}
          </li>
          <li className="font-2">
            {getTranslation("category", locale)}:{" "}
            {product?.category?.name || getTranslation("na", locale)}
          </li>
          <li className="font-2">
            {getTranslation("availability", locale)}:{" "}
            {product?.is_available
              ? getTranslation("inStock", locale)
              : getTranslation("outOfStock", locale)}
          </li>
          {product?.brand && (
            <li className="font-2">
              {getTranslation("brand", locale)}: {product.brand}
            </li>
          )}
          {product?.discount > 0 && (
            <li className="font-2">
              {getTranslation("discount", locale)}: {product.discount}%
            </li>
          )}
        </ul>

        {product?.sizes && product.sizes.length > 0 && (
          <div className="mb_12">
            <div className="letter-1 text-btn-uppercase mb_8">
              {getTranslation("availableSizes", locale)}
            </div>
            <div className="d-flex gap-8">
              {product.sizes.map((size) => (
                <span key={size.id} className="size-badge">
                  {size.size}
                </span>
              ))}
            </div>
          </div>
        )}

        {product?.colors && product.colors.length > 0 && (
          <div className="mb_12">
            <div className="letter-1 text-btn-uppercase mb_8">
              {getTranslation("availableColors", locale)}
            </div>
            <div className="d-flex gap-8">
              {product.colors.map((color) => (
                <div
                  key={color.id}
                  className="color-preview"
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: color.color,
                    borderRadius: "50%",
                    border: "1px solid #ddd",
                  }}
                  title={color.color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
