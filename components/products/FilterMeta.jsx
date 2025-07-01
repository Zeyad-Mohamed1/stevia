"use client";
import { useLocale } from "next-intl";
import React from "react";

export default function FilterMeta({
  allProps,
  productLength,
  paginationInfo,
}) {
  const locale = useLocale();
  const getResultText = () => {
    if (paginationInfo) {
      const { from, to, total } = paginationInfo;
      return locale === "ar"
        ? `معرض ${from}-${to} من ${total} منتجات`
        : `Showing ${from}-${to} of ${total} Products`;
    }
    return locale === "ar"
      ? `${productLength} منتجات معروضة`
      : `${productLength} Products Found`;
  };

  return (
    <div className="meta-filter-shop" style={{}}>
      <div id="product-count-grid" className="count-text">
        {getResultText()}
      </div>

      <div id="applied-filters">
        {allProps.availability != "All" ? (
          <span
            className="filter-tag"
            onClick={() => allProps.setAvailability("All")}
          >
            {allProps.availability.label}
            <span className="remove-tag icon-close" />
          </span>
        ) : (
          ""
        )}

        {allProps.brands.length ? (
          <React.Fragment>
            {allProps.brands.map((brand, index) => (
              <span
                key={`brand-filter-${brand}-${index}`}
                className="filter-tag"
                onClick={() => allProps.removeBrand(brand)}
              >
                {brand}
                <span className="remove-tag icon-close" />
              </span>
            ))}
          </React.Fragment>
        ) : (
          ""
        )}
      </div>
      {allProps.availability != "All" || allProps.brands.length ? (
        <button
          id="remove-all"
          className="remove-all-filters text-btn-uppercase"
          onClick={allProps.clearFilter}
        >
          REMOVE ALL <i className="icon icon-close" />
        </button>
      ) : (
        ""
      )}
    </div>
  );
}
