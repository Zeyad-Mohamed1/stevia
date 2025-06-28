"use server";

import { get } from "@/server/api";

export async function getSlider() {
  const response = await get("/sliders");
  return response;
}

export async function getSlidersNews() {
  const response = await get("/sliders-news");
  return response;
}

export async function getSlidersCategories() {
  const response = await get("/sliders-categories");
  return response;
}

export async function getSlidersProducts() {
  const response = await get("/product-section");
  return response;
}
