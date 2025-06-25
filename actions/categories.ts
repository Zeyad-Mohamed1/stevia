"use server";

import { get, postFormData } from "@/server/api";

export async function getCategories() {
  const response = await get("/categories");
  return response;
}

export async function getSubCategories() {
  const response = await get("/sub-categories");
  return response;
}

export async function getSubCafesByCategoryId(id) {
  const formData = new FormData();
  formData.append("id", id);
  const response = await postFormData(`/sub_cafes/find`, formData);
  return response;
}

export async function getSubCafesProducts(id, page = 1) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("page", page.toString());
  const response = await postFormData(`/items/sub_cafes`, formData);
  return response;
}
