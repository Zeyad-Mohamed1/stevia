"use server";

import {
  clearAuthToken,
  get,
  post,
  postFormData,
  setAuthToken,
} from "@/server/api";

export async function register(formData: FormData) {
  const response = (await postFormData("/register", formData)) as {
    status: string;
    token: string;
  };
  if (response.status === "success" && response.token) {
    await setAuthToken(response.token);
  }
  return response;
}

export async function login(formData: FormData) {
  const response = (await postFormData("/login", formData)) as {
    status: string;
    token: string;
  };

  if (response.status === "success" && response.token) {
    await setAuthToken(response.token);
  }

  await getUser();

  return response;
}

export async function logout() {
  const response = await post("/logout", {});
  await clearAuthToken();
  return response;
}

export async function getUser() {
  const response = (await get("/user")) as any;
  return response;
}

export async function updateUser({ fname, lname, phone }) {
  const formData = new FormData();
  formData.append("fname", fname);
  formData.append("lname", lname);
  formData.append("phone", phone);

  const response = await postFormData("/user/edit_profile", formData);
  return response;
}

export async function updateUserPassword({ password }) {
  const formData = new FormData();
  formData.append("password", password);
  const response = await postFormData("/user/password", formData);
  return response;
}

export async function createAddress({
  f_name,
  l_name,
  email,
  phone,
  city,
  zip,
}) {
  const formData = new FormData();
  formData.append("f_name", f_name);
  formData.append("l_name", l_name);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("city", city);
  formData.append("zip", zip);

  const response = await postFormData("/user/addresses/add", formData);

  return response;
}

export async function getAddresses() {
  const response = await get("/user/addresses");
  return response;
}

export async function editAddress({
  id,
  f_name,
  l_name,
  email,
  phone,
  city,
  zip,
}) {
  const formData = new FormData();
  formData.append("f_name", f_name);
  formData.append("l_name", l_name);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("city", city);
  formData.append("zip", zip);
  const response = await postFormData(`/user/addresses/edit/${id}`, formData);
  return response;
}
