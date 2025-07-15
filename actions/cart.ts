"use server";

import { get, post, postFormData } from "@/server/api";

export async function getCart() {
  const response = await get("/cart");
  return response;
}

export async function addToCart(
  productId: number,
  qty: number,
  weight: string
) {
  const formData = new FormData();
  formData.append("item_id", productId.toString());
  formData.append("qty", qty.toString());
  formData.append("weight", weight);
  const response = await postFormData("/add-to-cart", formData);
  return response;
}

export async function updateCartQuantity(productId: number, qty: number) {
  const formData = new FormData();
  formData.append("item_id", productId.toString());
  formData.append("qty", qty.toString());
  const response = await postFormData("/update-qty-cart", formData);
  return response;
}

export async function removeFromCart(productId: number) {
  const formData = new FormData();
  formData.append("item_id", productId.toString());
  const response = await postFormData("/remove-from-cart", formData);
  return response;
}

export async function removeAllFromCart() {
  const response = await post("/remove-all-cart", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

// Sync local cart with backend on login
export async function syncCartWithBackend(localCartItems) {
  try {
    // First, get current backend cart
    const backendCart = await getCart();

    // If local cart is empty, return backend cart
    if (!localCartItems || localCartItems.length === 0) {
      return { success: true, cart: backendCart };
    }

    // Clean and normalize cart items before syncing
    const normalizedItems = localCartItems
      .map((item) => ({
        id: item.id || item.item_id,
        quantity: item.quantity || item.qty || 1,
        weight: item.weight || "",
      }))
      .filter((item) => item.id); // Only include items with valid IDs

    // Sync each local cart item to backend
    const syncPromises = normalizedItems.map(async (item) => {
      try {
        await addToCart(item.id, item.quantity, item.weight);
        return { success: true, itemId: item.id };
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        return { success: false, itemId: item.id, error };
      }
    });

    const results = await Promise.allSettled(syncPromises);

    // Log sync results
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    );
    const failed = results.filter(
      (r) => r.status === "rejected" || !r.value.success
    );

    // Get updated cart after sync
    const updatedCart = await getCart();
    return { success: true, cart: updatedCart };
  } catch (error) {
    console.error("Cart sync failed:", error);
    return { success: false, error };
  }
}

// Bulk add items to cart (for merging)
export async function bulkAddToCart(cartItems) {
  const results = await Promise.allSettled(
    cartItems.map((item) =>
      addToCart(item.id, item.quantity, item.weight || "")
    )
  );

  const failedItems = results
    .map((result, index) => ({ result, item: cartItems[index] }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ item }) => item);

  return {
    success: failedItems.length === 0,
    failedItems,
    syncedCount: cartItems.length - failedItems.length,
  };
}

export async function checkout({ address_id, notes }) {
  const formData = new FormData();
  formData.append("address_id", address_id.toString());
  formData.append("type", "cod");
  formData.append("notes", notes);
  const response = await postFormData("/checkout", formData);
  return response;
}

export async function checkoutWithOutAuth({
  f_name,
  l_name,
  email,
  phone,
  city,
  zip,
  notes,
  cart,
}) {
  const formData = new FormData();

  formData.append("f_name", f_name);
  formData.append("l_name", l_name);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("city", city);
  formData.append("zip", zip);
  formData.append("type", "cod");
  formData.append("notes", notes || "");

  // Cart items
  if (cart && cart.length > 0) {
    cart.forEach((item, index) => {
      formData.append(`cart[${index}][item_id]`, item.item_id.toString());
      formData.append(`cart[${index}][qty]`, item.qty.toString());
      formData.append(`cart[${index}][weight]`, item.weight || "");
    });
  }
  const response = await postFormData("/checkout", formData);
  return response;
}
