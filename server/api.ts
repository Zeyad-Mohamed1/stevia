/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { getLocale } from "next-intl/server";

interface FetchOptions extends RequestInit {
  cache?: RequestCache;
  tags?: string[];
  credentials?: RequestCredentials;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Function to set authentication token in cookies
export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("Stevia-token", token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });
}

export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("Stevia-token");
}

// Function to invalidate all cached data for a specific locale
export async function revalidateLocaleCache(locale: string): Promise<void> {
  revalidateTag(`locale:${locale}`);
}

// Function to invalidate all cached data for the current locale
export async function revalidateCurrentLocaleCache(): Promise<void> {
  const currentLocale = await getLocale();
  revalidateTag(`locale:${currentLocale}`);
}

// Server action to invalidate cache when locale changes (callable from client)
export async function invalidateLocaleCache(newLocale: string): Promise<void> {
  "use server";
  // Invalidate cache for the new locale to ensure fresh data is fetched
  revalidateTag(`locale:${newLocale}`);

  // Also invalidate any general cache tags that might be locale-independent
  // but need refreshing when locale changes
  revalidateTag("locale-change");
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const locale = await getLocale();
  const { cache = "no-store", tags = [], ...restOptions } = options;

  // Include locale in cache tags to invalidate cache when locale changes
  const cacheTags = [...tags, `locale:${locale}`, "locale-change"];

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("Stevia-token")?.value;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...restOptions,
      credentials: "include",
      cache,
      next: { tags: cacheTags },
      headers: {
        "X-Localization": locale,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...restOptions.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      let errorData;
      try {
        // Try to parse as JSON first
        errorData = JSON.parse(errorText);
      } catch {
        // If parsing fails, create error object
        errorData = { error: errorText, status: response.status };
      }

      // Throw the error so it can be caught and handled properly
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);

    // If it's our custom error with JSON data, parse and return it
    if (error instanceof Error) {
      try {
        const errorData = JSON.parse(error.message);
        return errorData as T;
      } catch {
        // If parsing fails, return a generic error object
        return { error: error.message, status: "error" } as T;
      }
    }

    // For other types of errors, return a generic error object
    return { error: "An unexpected error occurred", status: "error" } as T;
  }
}

export async function get<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "GET",
    ...options,
  });
}

export async function post<T>(
  endpoint: string,
  data: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
}

export async function postFormData<T>(
  endpoint: string,
  data: FormData,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "POST",
    body: data,
    ...options,
  });
}

export async function put<T>(
  endpoint: string,
  data: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
}

export async function putFormData<T>(
  endpoint: string,
  data: FormData,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "PUT",
    body: data,
    ...options,
  });
}

export async function del<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "DELETE",
    ...options,
  });
}
