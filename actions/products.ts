"use server";

import { get, postFormData } from "@/server/api";

export async function getBestItems() {
  const response = await get("/best-items");
  return response;
}

export async function getProducts(page: number = 1) {
  const response = await get(`/items?page=${page}`);
  return response;
}

export async function getProduct(productId: number) {
  const response = await get(`/item/${productId}`);
  return response;
}

export async function updateFavorites(productId: number) {
  const formData = new FormData();
  formData.append("item_id", productId.toString());
  const response = await postFormData("/user/update-fav", formData);
  return response;
}

export async function getFavorites() {
  const response = await get("/user/my-favorites");
  return response;
}

export async function searchProducts(name: string) {
  const formData = new FormData();
  formData.append("name", name);
  const response = await postFormData(`/items/find`, formData);
  return response;
}

export async function getBrandProducts(page: number = 1) {
  const response = await get(`/brand-items?page=${page}`);
  return response;
}
