"use client";
import { useEffect, useCallback, useState } from "react";
import { cartStorage } from "@/utils/cartStorage";
import { syncCartWithBackend, getCart } from "@/actions/cart";
import { useUserStore } from "@/store/userStore";

export function useCartPersistence(cartProducts, setCartProducts) {
  const { user, isAuthenticated } = useUserStore();
  const [isClient, setIsClient] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  console.log(user, isAuthenticated);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const { items } = cartStorage.loadCart();
    console.log("Loading cart from storage:", items);
    if (items.length > 0 && cartProducts?.length === 0) {
      setCartProducts(items);
    }
    setHasInitialized(true);
  }, [isClient]);

  // Save cart to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (!isClient || !hasInitialized) return;

    if (cartProducts?.length >= 0) {
      cartStorage.saveCart(cartProducts);
    }
  }, [cartProducts, isClient, hasInitialized]);

  // Sync with backend when user logs in
  const syncCartOnLogin = useCallback(async () => {
    // Only proceed if we're on client, initialized, and user is actually authenticated
    if (!isClient || !hasInitialized || !isAuthenticated || !user) {
      console.log("Skipping sync - not ready:", {
        isClient,
        hasInitialized,
        isAuthenticated,
        hasUser: !!user,
      });
      return;
    }

    try {
      console.log("Starting automatic cart sync...");

      // Check both possible localStorage keys for cart items
      let localCartItems = [];

      // Check the old cart key (used in Context.jsx)
      const oldCart = localStorage.getItem("cart");
      if (oldCart && oldCart !== "undefined" && oldCart !== "null") {
        try {
          const oldItems = JSON.parse(oldCart);
          if (Array.isArray(oldItems) && oldItems.length > 0) {
            localCartItems = [...localCartItems, ...oldItems];
            console.log("Found items in old cart storage:", oldItems.length);
          }
        } catch (error) {
          console.error("Error parsing old cart:", error);
          // Clear corrupted data
          localStorage.removeItem("cart");
        }
      }

      // Check the new cart key (used in cartStorage.js)
      const { items: newCartItems } = cartStorage.loadCart();
      if (newCartItems && newCartItems.length > 0) {
        localCartItems = [...localCartItems, ...newCartItems];
        console.log("Found items in new cart storage:", newCartItems.length);
      }

      // Remove duplicates based on id
      const uniqueItems = localCartItems.filter(
        (item, index, self) => index === self.findIndex((i) => i.id === item.id)
      );

      console.log("Total unique items to sync:", uniqueItems.length);

      if (uniqueItems.length === 0) {
        // No local cart, just load backend cart
        try {
          const backendCart = await getCart();
          setCartProducts(backendCart.items || []);
          console.log("No local items, loaded backend cart");
        } catch (error) {
          console.error("Failed to load backend cart:", error);
        }
        return;
      }

      // Sync local cart with backend using the improved sync function
      const syncResult = await syncCartWithBackend(uniqueItems);

      if (syncResult.success) {
        setCartProducts(syncResult.cart.items || []);

        // Clear both localStorage keys after successful sync
        localStorage.removeItem("cart");
        cartStorage.clearCart();

        console.log(
          `Cart successfully synced: ${uniqueItems.length} items added to backend`
        );
      } else {
        console.error("Cart sync failed, keeping local cart");
        // Keep local items in state if sync failed
        setCartProducts(uniqueItems);
      }
    } catch (error) {
      console.error("Error during automatic cart sync:", error);
      // On error, try to load any available cart data
      try {
        const backendCart = await getCart();
        setCartProducts(backendCart.items || []);
      } catch (backendError) {
        console.error(
          "Failed to load backend cart after sync error:",
          backendError
        );
      }
    }
  }, [isClient, hasInitialized, isAuthenticated, user, setCartProducts]);

  // Handle logout - clear cart or keep based on preference
  const handleLogout = useCallback(() => {
    if (!isClient) return;
    // Option 1: Clear cart on logout
    // cartStorage.clearCart();
    // setCartProducts([]);
    // Option 2: Keep cart in localStorage for guest shopping
    // (current implementation keeps the cart)
  }, [isClient]);

  return {
    syncCartOnLogin,
    handleLogout,
    loadLocalCart: () =>
      isClient ? cartStorage.loadCart() : { items: [], timestamp: null },
    clearLocalCart: () => (isClient ? cartStorage.clearCart() : null),
    isReady: isClient && hasInitialized,
  };
}
