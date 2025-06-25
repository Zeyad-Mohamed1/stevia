"use client";

import { useEffect, useState } from "react";
import ProductCard1 from "../productCards/ProductCard1";
import Pagination from "../common/Pagination";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "@/actions/products";
import { useUserStore } from "@/store/userStore";

export default function Wishlist() {
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
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-secondary">Loading your favorites...</p>
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
              Failed to load favorites. Please try again.
            </p>
            <Link className="btn-line" href="/shop-default-grid">
              Explore Products
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
            <p>Please log in to view your favorites.</p>
            <Link className="btn-line" href="/login">
              Login
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
            Your wishlist is empty. Start adding your favorite products to save
            them for later!{" "}
            <Link className="btn-line" href="/shop-default-grid">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
