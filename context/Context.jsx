"use client";
import { openCartModal } from "@/utlis/openCartModal";
import { openWistlistModal } from "@/utlis/openWishlist";
import { useCartPersistence } from "@/hooks/useCartPersistence";
import { useUserStore } from "@/store/userStore";
import {
  addToCart,
  removeFromCart,
  getCart,
  updateCartQuantity,
} from "@/actions/cart";

import React, { useEffect } from "react";
import { useContext, useState } from "react";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const [cartProductsState, setCartProductsState] = useState([]);
  const [wishList, setWishList] = useState([1, 2, 3]);
  const [compareItem, setCompareItem] = useState([1, 2, 3]);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Wrapper to ensure cartProducts is always an array
  const setCartProducts = (value) => {
    if (typeof value === "function") {
      setCartProductsState((prev) => {
        const newValue = value(Array.isArray(prev) ? prev : []);
        return Array.isArray(newValue) ? newValue : [];
      });
    } else {
      setCartProductsState(Array.isArray(value) ? value : []);
    }
  };

  // Ensure cartProducts is always an array
  const cartProducts = Array.isArray(cartProductsState)
    ? cartProductsState
    : [];

  const { user, isAuthenticated, fetchUser } = useUserStore();
  const { syncCartOnLogin, handleLogout, isReady } = useCartPersistence(
    cartProducts,
    setCartProducts
  );

  // Initialize user on app load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Helper function to normalize cart product data
  const normalizeCartProduct = (product) => {
    // Ensure product has required fields with fallbacks
    const normalizedProduct = {
      id: product.id,
      name: product.name || product.title || "Unknown Product",
      title: product.title || product.name || "Unknown Product",
      image_path:
        product.image_path || product.imgSrc || "/images/placeholder.jpg",
      imgSrc: product.imgSrc || product.image_path || "/images/placeholder.jpg",
      price: typeof product.price === "number" ? product.price : 0,
      oldPrice: product.oldPrice,
      quantity: typeof product.quantity === "number" ? product.quantity : 1,
      weight: product.weight,
      cartId: product.cartId,
      discount: product.discount,
      category: product.category,
    };

    return normalizedProduct;
  };

  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);

    // Save to localStorage for non-authenticated users (only when ready)
    if (!isAuthenticated && typeof window !== "undefined" && isReady) {
      localStorage.setItem("cart", JSON.stringify(cartProducts));
    }
  }, [cartProductsState, isAuthenticated, isReady]);

  // Load cart data on component mount and when user authenticates
  useEffect(() => {
    // Only proceed when the cart persistence hook is ready
    if (!isReady) {
      return;
    }

    if (isAuthenticated && user) {
      // Check if there's any local cart data to sync
      const hasLocalCartData = () => {
        const oldCart = localStorage.getItem("cart");
        const newCart = localStorage.getItem("ecommerce_cart");

        const oldItems = oldCart ? JSON.parse(oldCart) : [];
        const newItems = newCart ? JSON.parse(newCart).items || [] : [];

        return (
          (Array.isArray(oldItems) && oldItems.length > 0) ||
          (Array.isArray(newItems) && newItems.length > 0) ||
          (Array.isArray(cartProducts) && cartProducts.length > 0)
        );
      };

      if (hasLocalCartData()) {
        syncCartOnLogin();
      } else {
        loadCartData();
      }
    } else if (typeof window !== "undefined") {
      // Load from localStorage for non-authenticated users
      try {
        const cartValue = localStorage.getItem("cart");
        let savedCart = [];

        // Check if cartValue is valid before parsing
        if (cartValue && cartValue !== "undefined" && cartValue !== "null") {
          savedCart = JSON.parse(cartValue);
        }

        if (
          Array.isArray(savedCart) &&
          savedCart.length > 0 &&
          (!Array.isArray(cartProducts) || cartProducts.length === 0)
        ) {
          // Normalize saved cart items to ensure consistent structure
          const normalizedCart = savedCart.map((item) =>
            normalizeCartProduct(item)
          );
          setCartProducts(normalizedCart);
        }
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("cart");
      }
    }
  }, [isAuthenticated, user, syncCartOnLogin, isReady]);

  const loadCartData = async () => {
    try {
      setIsCartLoading(true);
      const cartData = await getCart();
      // Normalize cart items to ensure consistent structure
      const items = cartData?.items || [];
      const normalizedItems = Array.isArray(items)
        ? items.map((item) => normalizeCartProduct(item))
        : [];
      setCartProducts(normalizedItems);
    } catch (error) {
      console.error("Failed to load cart:", error);
      // Keep local cart if backend fails - ensure we don't set undefined
      setCartProducts([]);
    } finally {
      setIsCartLoading(false);
    }
  };

  const isAddedToCartProducts = (id) => {
    if (cartProducts.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    return false;
  };

  const addProductToCart = async (product, qty, isModal = true) => {
    // Handle both product object and product ID
    const productId = typeof product === "object" ? product.id : product;

    if (isAddedToCartProducts(productId)) {
      return;
    }

    try {
      setIsCartLoading(true);

      // Prepare item for both authenticated and non-authenticated users
      let item;
      if (typeof product === "object") {
        // Product object passed (from ProductCard)
        item = {
          ...product,
          quantity: qty ? qty : 1,
        };
      } else {
        // Product ID passed (from product detail pages)
        item = {
          id: productId,
          name: "Unknown Product",
          title: "Unknown Product",
          image_path: "/images/placeholder.jpg",
          imgSrc: "/images/placeholder.jpg",
          price: 0,
          quantity: qty ? qty : 1,
          weight: "",
        };
      }

      // Normalize the item
      const normalizedItem = normalizeCartProduct(item);

      if (user !== null) {
        // User is authenticated - use API and update local state
        const weightValue = normalizedItem.weight || "";
        console.log("Adding to cart:", {
          productId,
          qty: qty || 1,
          weight: weightValue,
        });
        await addToCart(productId, qty || 1, weightValue);
        setCartProducts((pre) => [...pre, normalizedItem]);
      } else {
        // User not authenticated - use local state only
        setCartProducts((pre) => [...pre, normalizedItem]);
      }

      if (isModal) {
        openCartModal();
      }
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      // Fallback to local state on error
      const normalizedItem = normalizeCartProduct(item);
      setCartProducts((pre) => [...pre, normalizedItem]);
      if (isModal) {
        openCartModal();
      }
    } finally {
      setIsCartLoading(false);
    }
  };

  const removeProductFromCart = async (productId) => {
    try {
      setIsCartLoading(true);

      if (user !== null) {
        // User is authenticated - use API and update local state
        await removeFromCart(productId);
        setCartProducts((pre) => pre.filter((elm) => elm.id != productId));
      } else {
        // User not authenticated - use local state only
        setCartProducts((pre) => pre.filter((elm) => elm.id != productId));
      }
    } catch (error) {
      console.error("Failed to remove product from cart:", error);
      // Fallback to local state on error
      setCartProducts((pre) =>
        (Array.isArray(pre) ? pre : []).filter((elm) => elm.id != productId)
      );
    } finally {
      setIsCartLoading(false);
    }
  };

  const updateQuantity = async (id, qty) => {
    if (!isAddedToCartProducts(id)) return;

    try {
      setIsCartLoading(true);

      // Ensure cartProducts is an array
      const currentCart = Array.isArray(cartProducts) ? cartProducts : [];

      // Update local state for both authenticated and non-authenticated users
      let item = currentCart.filter((elm) => elm.id == id)[0];
      let items = [...currentCart];
      const itemIndex = items.indexOf(item);

      if (item && itemIndex !== -1) {
        item.quantity = qty / 1;
        items[itemIndex] = item;
        setCartProducts(items);
      }

      if (user !== null) {
        // User is authenticated - also update API
        await updateCartQuantity(id, qty);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Fallback to local state on error
      const currentCart = Array.isArray(cartProducts) ? cartProducts : [];
      let item = currentCart.filter((elm) => elm.id == id)[0];
      let items = [...currentCart];
      const itemIndex = items.indexOf(item);

      if (item && itemIndex !== -1) {
        item.quantity = qty / 1;
        items[itemIndex] = item;
        setCartProducts(items);
      }
    } finally {
      setIsCartLoading(false);
    }
  };

  const addToWishlist = (id) => {
    if (!wishList.includes(id)) {
      setWishList((pre) => [...pre, id]);
      openWistlistModal();
    }
  };

  const removeFromWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };
  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
  };
  const isAddedtoCompareItem = (id) => {
    if (compareItem.includes(id)) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("wishlist"));
    if (items?.length) {
      setWishList(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishList));
  }, [wishList]);

  const contextElement = {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    removeProductFromCart,
    isAddedToCartProducts,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
    updateQuantity,
    syncCartOnLogin,
    handleLogout,
    loadCartData,
    isCartLoading,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
