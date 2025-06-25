"use client";

import LayoutHandler from "./LayoutHandler";
import Sorting from "./Sorting";
import Listview from "./Listview";
import GridView from "./GridView";
import { useEffect, useReducer, useState, useMemo } from "react";
import FilterModal from "./FilterModal";
import { initialState, reducer } from "@/reducer/filterReducer";
import FilterMeta from "./FilterMeta";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/actions/products";
import { useLocale, useTranslations } from "next-intl";
import { getSubCafesProducts } from "@/actions/categories";

// Transform API data to match expected format
const transformApiProduct = (apiProduct, currentLocale = "en") => {
  // Use the locale passed from the component

  // Find the correct translation
  const translation =
    apiProduct.translations?.find((t) => t.locale === currentLocale) ||
    apiProduct.translations?.[0];

  return {
    id: apiProduct.id,
    title: translation?.name || apiProduct.name,
    imgSrc: apiProduct.image_path,
    imgHover: apiProduct.colors?.[0]?.image_path || apiProduct.image_path,
    price: apiProduct.price,
    oldPrice:
      apiProduct.discount > 0
        ? Math.round(apiProduct.price / (1 - apiProduct.discount / 100))
        : null,
    isOnSale: apiProduct.discount > 0,
    discount: apiProduct.discount,
    inStock: apiProduct.is_available === 1,
    colors:
      apiProduct.colors?.map((color) => ({
        colorId: color.id,
        name: color.color,
        colorCode: color.color,
        imgSrc: color.image_path,
      })) || [],
    sizes:
      apiProduct.sizes?.map((size) => ({
        sizeId: size.id,
        name: size.size,
        size: size.size,
      })) || [],
    category: apiProduct.category,
    description: translation?.description || apiProduct.description,
    // Additional fields for filtering
    filterColor: apiProduct.colors?.map((c) => c.color) || [],
    filterSizes: apiProduct.sizes?.map((s) => s.size) || [],
    filterBrands: apiProduct.brand ? [apiProduct.brand] : [],
  };
};

export default function Products1({
  parentClass = "flat-spacing",
  subCategoryId = null,
}) {
  const [page, setPage] = useState(1);
  const locale = useLocale();
  const t = useTranslations("products");

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", page],
    queryFn: () => getProducts(page),
    enabled: !subCategoryId,
  });

  const {
    data: apiResponseSubCafes,
    isLoading: isLoadingSubCafes,
    error: errorSubCafes,
  } = useQuery({
    queryKey: ["subCategoryProducts", subCategoryId, page],
    queryFn: () => getSubCafesProducts(subCategoryId, page),
    enabled: !!subCategoryId,
  });

  const [activeLayout, setActiveLayout] = useState(4);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    sortingOption: t("sortDefault"),
  });

  const {
    price,
    availability,
    color,
    size,
    brands,
    filtered,
    sortingOption,
    sorted,
    activeFilterOnSale,
  } = state;

  // Get current API response based on subCategoryId
  const currentApiResponse = subCategoryId ? apiResponseSubCafes : apiResponse;
  const currentLoading = subCategoryId ? isLoadingSubCafes : isLoading;
  const currentError = subCategoryId ? errorSubCafes : error;

  // Transform API products (memoized to prevent infinite re-renders)
  const products = useMemo(() => {
    return (
      currentApiResponse?.data?.map((product) =>
        transformApiProduct(product, locale)
      ) || []
    );
  }, [currentApiResponse?.data, locale]);

  // Get pagination info from API response
  const paginationInfo = useMemo(() => {
    return currentApiResponse
      ? {
          currentPage: currentApiResponse.current_page,
          lastPage: currentApiResponse.last_page,
          perPage: currentApiResponse.per_page,
          total: currentApiResponse.total,
          from: currentApiResponse.from,
          to: currentApiResponse.to,
          firstPageUrl: currentApiResponse.first_page_url,
          lastPageUrl: currentApiResponse.last_page_url,
          nextPageUrl: currentApiResponse.next_page_url,
          prevPageUrl: currentApiResponse.prev_page_url,
        }
      : null;
  }, [currentApiResponse]);

  // Initialize price range based on actual product data
  useEffect(() => {
    if (products.length > 0) {
      const allPrices = products.map((p) => p.price);
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);

      // Only update if current price range doesn't accommodate our products
      if (price[0] > minPrice || price[1] < maxPrice) {
        const newPriceRange = [
          Math.max(0, Math.floor(minPrice * 0.9)), // Ensure minimum is not negative
          Math.ceil(maxPrice * 1.1),
        ];
        dispatch({
          type: "SET_PRICE",
          payload: newPriceRange,
        });
      }
    }
  }, [products, price]);

  const allProps = {
    ...state,
    setPrice: (value) => dispatch({ type: "SET_PRICE", payload: value }),
    setColor: (value) => {
      value == color
        ? dispatch({ type: "SET_COLOR", payload: "All" })
        : dispatch({ type: "SET_COLOR", payload: value });
    },
    setSize: (value) => {
      value == size
        ? dispatch({ type: "SET_SIZE", payload: "All" })
        : dispatch({ type: "SET_SIZE", payload: value });
    },
    setAvailability: (value) => {
      value == availability
        ? dispatch({ type: "SET_AVAILABILITY", payload: "All" })
        : dispatch({ type: "SET_AVAILABILITY", payload: value });
    },
    setBrands: (newBrand) => {
      const updated = [...brands].includes(newBrand)
        ? [...brands].filter((elm) => elm != newBrand)
        : [...brands, newBrand];
      dispatch({ type: "SET_BRANDS", payload: updated });
    },
    removeBrand: (newBrand) => {
      const updated = [...brands].filter((brand) => brand != newBrand);
      dispatch({ type: "SET_BRANDS", payload: updated });
    },
    setSortingOption: (value) =>
      dispatch({ type: "SET_SORTING_OPTION", payload: value }),
    toggleFilterWithOnSale: () => dispatch({ type: "TOGGLE_FILTER_ON_SALE" }),
    clearFilter: () => {
      dispatch({ type: "CLEAR_FILTER" });
    },
  };

  // Apply filters to products (client-side filtering for current page)
  useEffect(() => {
    if (products.length === 0) return;

    let filteredArrays = [];

    if (brands.length) {
      const filteredByBrands = [...products].filter((elm) =>
        brands.every((el) => elm.filterBrands.includes(el))
      );
      filteredArrays = [...filteredArrays, filteredByBrands];
    }

    if (availability !== "All") {
      const filteredByavailability = [...products].filter(
        (elm) => availability.value === elm.inStock
      );
      filteredArrays = [...filteredArrays, filteredByavailability];
    }

    if (color !== "All") {
      const filteredByColor = [...products].filter((elm) =>
        elm.filterColor.includes(color.name)
      );
      filteredArrays = [...filteredArrays, filteredByColor];
    }

    if (size !== "All" && size !== "Free Size") {
      const filteredBysize = [...products].filter((elm) =>
        elm.filterSizes.includes(size)
      );
      filteredArrays = [...filteredArrays, filteredBysize];
    }

    if (activeFilterOnSale) {
      const filteredByonSale = [...products].filter((elm) => elm.oldPrice);
      filteredArrays = [...filteredArrays, filteredByonSale];
    }

    const filteredByPrice = [...products].filter(
      (elm) => elm.price >= price[0] && elm.price <= price[1]
    );
    filteredArrays = [...filteredArrays, filteredByPrice];

    const commonItems = [...products].filter((item) =>
      filteredArrays.every((array) => array.includes(item))
    );

    dispatch({ type: "SET_FILTERED", payload: commonItems });
  }, [price, availability, color, size, brands, activeFilterOnSale, products]);

  // Apply sorting to filtered products
  useEffect(() => {
    if (sortingOption === t("priceAscending")) {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.price - b.price),
      });
    } else if (sortingOption === t("priceDescending")) {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.price - a.price),
      });
    } else if (sortingOption === t("titleAscending")) {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.title.localeCompare(b.title)),
      });
    } else if (sortingOption === t("titleDescending")) {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.title.localeCompare(a.title)),
      });
    } else {
      dispatch({ type: "SET_SORTED", payload: filtered });
    }
  }, [filtered, sortingOption, t]);

  // Handle pagination - server-side pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (paginationInfo?.lastPage || 1)) {
      setPage(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  console.log(
    "products",
    products.map((p) => p.title)
  );

  if (currentLoading) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="text-center py-5">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "200px" }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("loading")}</span>
              </div>
              <span className="ms-3">{t("loadingProducts")}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (currentError) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="text-center py-5">
            <p>{t("errorLoadingProducts")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={parentClass}>
        <div className="container">
          <div className="tf-shop-control">
            {/* <div className="tf-control-filter">
              <a
                href="#filterShop"
                data-bs-toggle="offcanvas"
                aria-controls="filterShop"
                className="tf-btn-filter"
              >
                <span className="icon icon-filter" />
                <span className="text">{t("filters")}</span>
              </a>
              <div
                onClick={allProps.toggleFilterWithOnSale}
                className={`d-none d-lg-flex shop-sale-text ${
                  activeFilterOnSale ? "active" : ""
                }`}
              >
                <i className="icon icon-checkCircle" />
                <p className="text-caption-1">{t("shopSaleOnly")}</p>
              </div>
            </div> */}
            <ul className="tf-control-layout">
              <LayoutHandler
                setActiveLayout={setActiveLayout}
                activeLayout={activeLayout}
              />
            </ul>
            <div className="tf-control-sorting">
              <p className="d-none d-lg-block text-caption-1">{t("sortBy")}</p>
              <Sorting allProps={allProps} />
            </div>
          </div>

          <div className="wrapper-control-shop">
            <FilterMeta
              productLength={paginationInfo?.total || 0}
              allProps={allProps}
              paginationInfo={paginationInfo}
            />

            {activeLayout == 1 ? (
              <div className="tf-list-layout wrapper-shop" id="listLayout">
                <Listview products={sorted} currentPage={page} />
              </div>
            ) : (
              <div
                className={`tf-grid-layout wrapper-shop tf-col-${activeLayout}`}
                id="gridLayout"
              >
                <GridView
                  products={sorted}
                  pagination={false}
                  currentPage={page}
                />
              </div>
            )}

            {/* Server-side Pagination */}
            {paginationInfo && paginationInfo.lastPage > 1 && (
              <ul className="wg-pagination justify-content-center">
                {/* Previous button */}
                <li
                  onClick={() =>
                    handlePageChange(paginationInfo.currentPage - 1)
                  }
                >
                  <a
                    className={`pagination-item text-button ${
                      !paginationInfo.prevPageUrl ? "disabled" : ""
                    }`}
                    style={{
                      cursor: !paginationInfo.prevPageUrl
                        ? "not-allowed"
                        : "pointer",
                      opacity: !paginationInfo.prevPageUrl ? 0.5 : 1,
                    }}
                  >
                    <i className="icon-arrLeft" />
                  </a>
                </li>

                {/* Page numbers */}
                {Array.from({ length: paginationInfo.lastPage }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <li
                      key={`page-${pageNum}`}
                      className={
                        pageNum === paginationInfo.currentPage ? "active" : ""
                      }
                      onClick={() => handlePageChange(pageNum)}
                    >
                      <div
                        className="pagination-item text-button"
                        style={{ cursor: "pointer" }}
                      >
                        {pageNum}
                      </div>
                    </li>
                  );
                })}

                {/* Next button */}
                <li
                  onClick={() =>
                    handlePageChange(paginationInfo.currentPage + 1)
                  }
                >
                  <a
                    className={`pagination-item text-button ${
                      !paginationInfo.nextPageUrl ? "disabled" : ""
                    }`}
                    style={{
                      cursor: !paginationInfo.nextPageUrl
                        ? "not-allowed"
                        : "pointer",
                      opacity: !paginationInfo.nextPageUrl ? 0.5 : 1,
                    }}
                  >
                    <i className="icon-arrRight" />
                  </a>
                </li>
              </ul>
            )}

            {/* Pagination info */}
            {paginationInfo && (
              <div className="text-center mt-3">
                <p className="text-muted">
                  {t("showingResults", {
                    from: paginationInfo.from,
                    to: paginationInfo.to,
                    total: paginationInfo.total,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <FilterModal allProps={allProps} />
    </>
  );
}
