"use client";
import React from "react";
import Image from "next/image";
import { getCategories } from "@/actions/categories";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Categories() {
  const locale = useLocale();
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  return (
    <div
      className="offcanvas offcanvas-start canvas-filter canvas-categories"
      id="shopCategories"
    >
      <div className="canvas-wrapper">
        <div className="canvas-header">
          <span className="icon-left icon-filter" />
          <h5>{locale === "ar" ? "الأقسام" : "Collections"}</h5>
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="canvas-body">
          {isLoading && (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              Error loading categories. Please try again.
            </div>
          )}

          {categories && categories.length > 0
            ? categories.map((category) => (
                <div key={category.id} className="wd-facet-categories">
                  <div className="facet-title">
                    <Link
                      href={`/collections/${category?.id}-${category?.name}`}
                      className="item link d-flex align-items-center"
                      data-bs-dismiss="offcanvas"
                    >
                      <Image
                        className="avt"
                        alt={category.title || category.name}
                        src={
                          category.logo_path ||
                          category.image ||
                          "/images/avatar/default.jpg"
                        }
                        width={48}
                        height={48}
                      />
                      <span className="title">
                        {category.title || category.name}
                      </span>
                    </Link>
                  </div>
                  {/* <div className="collapse show">
                    <ul className="facet-body">
                      {category.subcategories &&
                      category.subcategories.length > 0 ? (
                        category.subcategories.map((subcategory) => (
                          <li key={subcategory.id}>
                            <a
                              href={`/products?category=${category.id}&subcategory=${subcategory.id}`}
                              className="item link"
                            >
                              <Image
                                className="avt"
                                alt={subcategory.title || subcategory.name}
                                src={
                                  subcategory.imgSrc ||
                                  subcategory.image ||
                                  "/images/avatar/default.jpg"
                                }
                                width={48}
                                height={48}
                              />
                              <span className="title-sub text-caption-1 text-secondary">
                                {subcategory.title || subcategory.name}
                                {subcategory.count && ` (${subcategory.count})`}
                              </span>
                            </a>
                          </li>
                        ))
                      ) : (
                        <li>
                          <a
                            href={`/products?category=${category.id}`}
                            className="item link"
                          >
                            <Image
                              className="avt"
                              alt={category.title || category.name}
                              src={
                                category.logo_path ||
                                category.image ||
                                "/images/avatar/default.jpg"
                              }
                              width={48}
                              height={48}
                            />
                            <span className="title-sub text-caption-1 text-secondary">
                              View All {category.title || category.name}
                              {category.itemsCount &&
                                ` (${category.itemsCount})`}
                            </span>
                          </a>
                        </li>
                      )}
                    </ul>
                  </div> */}
                </div>
              ))
            : !isLoading &&
              !error && (
                <div className="text-center p-4">
                  <p className="text-muted">No categories available</p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
