"use client";

import { useEffect, useState } from "react";
import ProductCard1 from "../productCards/ProductCard1";
import Pagination from "../common/Pagination";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "@/actions/products";
import { useUserStore } from "@/store/userStore";
import { useLocale } from "next-intl";

export default function Wishlist() {
  const locale = useLocale();
  const { user } = useUserStore();
  const [items, setItems] = useState([]);

  const {
    data: favorites,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    enabled: !!user, // Only fetch if user is authenticated
  });

  useEffect(() => {
    if (favorites && Array.isArray(favorites)) {
      setItems(favorites);
    } else {
      setItems([]);
    }
  }, [favorites]);

  // Loading state
  if (isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">
                {locale === "ar" ? "جاري التحميل..." : "Loading..."}
              </span>
            </div>
            <p className="mt-2 text-secondary">
              {locale === "ar"
                ? "جاري التحميل..."
                : "Loading your favorites..."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="p-5 text-center">
            <p className="text-danger">
              {locale === "ar"
                ? "فشل تحميل المفضلة. يرجى المحاولة مرة أخرى."
                : "Failed to load favorites. Please try again."}
            </p>
            <Link className="btn-line" href="/shop-default-grid">
              {locale === "ar" ? "استكشاف المنتجات" : "Explore Products"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="p-5 text-center">
            <p>
              {locale === "ar"
                ? "يرجى تسجيل الدخول لعرض المفضلة."
                : "Please log in to view your favorites."}
            </p>
            <Link className="btn-line" href="/login">
              {locale === "ar" ? "تسجيل الدخول" : "Login"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        {items.length ? (
          <div className="tf-grid-layout tf-col-2 md-col-3 xl-col-4">
            {/* card product 1 */}
            {items.map((product, i) => (
              <ProductCard1 key={i} product={product} />
            ))}

            {/* pagination */}
            <ul className="wg-pagination justify-content-center">
              <Pagination />
            </ul>
          </div>
        ) : (
          <div className="p-5">
            {locale === "ar"
              ? "قائمة المفضلة فارغة. أضف منتجاتك المفضلة لحفظها للمرة القادمة!"
              : "Your wishlist is empty. Start adding your favorite products to save them for later!"}{" "}
            <Link className="btn-line" href="/shop">
              {locale === "ar" ? "استكشاف المنتجات" : "Explore Products"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
