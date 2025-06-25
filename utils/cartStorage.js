const CART_STORAGE_KEY = "ecommerce_cart";
const CART_TIMESTAMP_KEY = "ecommerce_cart_timestamp";

export const cartStorage = {
  // Save cart to localStorage
  saveCart: (cartItems) => {
    try {
      const cartData = {
        items: cartItems,
        timestamp: Date.now(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      localStorage.setItem(CART_TIMESTAMP_KEY, cartData.timestamp.toString());
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  },

  // Load cart from localStorage
  loadCart: () => {
    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      if (!cartData || cartData === "undefined" || cartData === "null") {
        return { items: [], timestamp: null };
      }

      const parsed = JSON.parse(cartData);
      return {
        items: parsed.items || [],
        timestamp: parsed.timestamp || null,
      };
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
      return { items: [], timestamp: null };
    }
  },

  // Clear cart from localStorage
  clearCart: () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
    } catch (error) {
      console.error("Failed to clear cart from localStorage:", error);
    }
  },

  // Check if localStorage cart is newer than backend cart
  isLocalCartNewer: (backendTimestamp) => {
    const localTimestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
    if (!localTimestamp || !backendTimestamp) return !!localTimestamp;

    return parseInt(localTimestamp) > new Date(backendTimestamp).getTime();
  },

  // Merge local and backend carts (prioritizing higher quantities)
  mergeCarts: (localCart, backendCart) => {
    const mergedMap = new Map();

    // Add backend items first
    backendCart.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    // Merge with local items, keeping higher quantities
    localCart.forEach((localItem) => {
      const existingItem = mergedMap.get(localItem.id);
      if (existingItem) {
        // Keep item with higher quantity
        mergedMap.set(localItem.id, {
          ...existingItem,
          quantity: Math.max(existingItem.quantity, localItem.quantity),
        });
      } else {
        mergedMap.set(localItem.id, localItem);
      }
    });

    return Array.from(mergedMap.values());
  },
};
