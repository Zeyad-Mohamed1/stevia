"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createAddress, editAddress } from "@/actions/auth";
import { useUserStore } from "@/store/userStore";
import { getCities } from "@/actions/main";

export default function Address() {
  const { user, fetchUser } = useUserStore();
  const [editingAddressId, setEditingAddressId] = useState(null);
  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => getCities(),
  });
  console.log(cities);

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      fetchUser(); // Refresh user data to get updated addresses
      // Hide the create form
      document.querySelector(".createForm")?.classList.remove("d-block");
    },
    onError: (error) => {
      console.error("Failed to create address:", error);
    },
  });

  // Edit address mutation
  const editAddressMutation = useMutation({
    mutationFn: editAddress,
    onSuccess: () => {
      fetchUser(); // Refresh user data to get updated addresses
      setEditingAddressId(null);
    },
    onError: (error) => {
      console.error("Failed to edit address:", error);
    },
  });

  const addresses = user?.addresses || [];
  const isLoading = !user; // Loading if user is not yet loaded

  // Helper function to get city name by ID
  const getCityNameById = (cityId) => {
    const city = cities?.find((c) => c.id === parseInt(cityId));
    return city ? city.name : cityId;
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const addressData = {
      f_name: formData.get("firstName"),
      l_name: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      zip: formData.get("zip") || "", // Add zip field if needed
    };

    createAddressMutation.mutate(addressData);
  };

  const handleEditSubmit = (e, addressId) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const addressData = {
      id: addressId,
      f_name: formData.get("firstName"),
      l_name: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      zip: formData.get("zip") || "", // Add zip field if needed
    };

    editAddressMutation.mutate(addressData);
  };

  const handleEditToggle = (id) => {
    setEditingAddressId(editingAddressId === id ? null : id);
  };
  // TODO: Implement delete address functionality
  const handleDelete = (id) => {
    // TODO: Implement delete address functionality
    console.log("Delete functionality not implemented in server actions");
  };

  if (isLoading) {
    return (
      <div className="my-account-content">
        <div className="account-address">
          <div className="text-center">
            <p>Loading addresses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="account-address">
        {/* User Profile Section */}
        <div className="user-profile-section mb_30 text-center">
          <div className="user-avatar mb_15">
            <img
              src={
                "data:image/png;base64,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"
              }
              alt={`${user?.fname || "User"} Avatar`}
              className="avatar-image"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #f0f0f0",
              }}
            />
          </div>
          <div className="user-info">
            <h5 className="user-name mb_5">
              {user?.fname && user?.lname
                ? `${user.fname} ${user.lname}`
                : user?.email || "User"}
            </h5>
            <p className="user-email text-secondary">{user?.email}</p>
          </div>
        </div>

        <div className="text-center widget-inner-address">
          <button
            className="tf-btn btn-fill radius-4 mb_20 btn-address"
            onClick={() =>
              document.querySelector(".createForm").classList.toggle("d-block")
            }
          >
            <span className="text text-caption-1">Add a new address</span>
          </button>
          <form
            className="show-form-address wd-form-address createForm"
            onSubmit={handleCreateSubmit}
          >
            <div className="title">Add a new address</div>
            <div className="cols mb_20">
              <fieldset className="">
                <input
                  className=""
                  type="text"
                  placeholder="First Name*"
                  name="firstName"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
              <fieldset className="">
                <input
                  className=""
                  type="text"
                  placeholder="Last Name*"
                  name="lastName"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
            </div>
            <div className="cols mb_20">
              <fieldset className="">
                <input
                  className=""
                  type="email"
                  placeholder="Email*"
                  name="email"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
              <fieldset className="">
                <input
                  className=""
                  type="text"
                  placeholder="Phone*"
                  name="phone"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
            </div>
            <fieldset className="mb_20">
              <select
                className=""
                name="city"
                tabIndex={2}
                aria-required="true"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "white",
                }}
              >
                <option value="">Select City*</option>
                {cities?.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </fieldset>
            <fieldset className="mb_20">
              <input
                className=""
                type="text"
                placeholder="ZIP Code"
                name="zip"
                tabIndex={2}
                defaultValue=""
                aria-required="true"
              />
            </fieldset>
            <div className="d-flex align-items-center justify-content-center gap-20">
              <button
                type="submit"
                className="tf-btn btn-fill radius-4"
                disabled={createAddressMutation.isPending}
              >
                <span className="text">
                  {createAddressMutation.isPending
                    ? "Adding..."
                    : "Add address"}
                </span>
              </button>
              <span
                className="tf-btn btn-fill radius-4 btn-hide-address"
                onClick={() =>
                  document
                    .querySelector(".createForm")
                    .classList.remove("d-block")
                }
              >
                <span className="text">Cancel</span>
              </span>
            </div>
          </form>
          <div className="list-account-address">
            {addresses.length === 0 ? (
              <p className="text-center">
                No addresses found. Add your first address above.
              </p>
            ) : (
              addresses.map((address) => (
                <div className="account-address-item" key={address.id}>
                  <h6 className="mb_20">Address #{address.id}</h6>
                  <p>
                    {address.f_name} {address.l_name}
                  </p>
                  <p>{address.email}</p>
                  <p>{getCityNameById(address.city)}</p>
                  <p className="mb_10">{address.phone}</p>
                  <div className="d-flex gap-10 justify-content-center">
                    <button
                      className="tf-btn radius-4 btn-fill justify-content-center btn-edit-address"
                      onClick={() => handleEditToggle(address.id)}
                    >
                      <span className="text">
                        {editingAddressId === address.id ? "Close" : "Edit"}
                      </span>
                    </button>
                    <button
                      className="tf-btn radius-4 btn-outline justify-content-center btn-delete-address"
                      onClick={() => handleDelete(address.id)}
                    >
                      <span className="text">Delete</span>
                    </button>
                  </div>
                  {editingAddressId === address.id && (
                    <form
                      className="edit-form-address wd-form-address d-block"
                      onSubmit={(e) => handleEditSubmit(e, address.id)}
                    >
                      <div className="title">Edit address</div>
                      <fieldset className="mb_20">
                        <input
                          type="text"
                          placeholder="First Name*"
                          name="firstName"
                          defaultValue={address.f_name}
                          required
                        />
                      </fieldset>
                      <fieldset className="mb_20">
                        <input
                          type="text"
                          placeholder="Last Name*"
                          name="lastName"
                          defaultValue={address.l_name}
                          required
                        />
                      </fieldset>
                      <fieldset className="mb_20">
                        <input
                          type="email"
                          placeholder="Email*"
                          name="email"
                          defaultValue={address.email}
                          required
                        />
                      </fieldset>
                      <fieldset className="mb_20">
                        <input
                          type="text"
                          placeholder="Phone*"
                          name="phone"
                          defaultValue={address.phone}
                          required
                        />
                      </fieldset>
                      <fieldset className="mb_20">
                        <select
                          className=""
                          name="city"
                          tabIndex={2}
                          aria-required="true"
                          required
                          defaultValue={address.city}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            backgroundColor: "white",
                          }}
                        >
                          <option value="">Select City*</option>
                          {cities?.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </fieldset>
                      <fieldset className="mb_20">
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          name="zip"
                          defaultValue={address.zip || ""}
                        />
                      </fieldset>

                      <div className="d-flex flex-column gap-20">
                        <button
                          type="submit"
                          className="tf-btn btn-fill radius-4"
                          disabled={editAddressMutation.isPending}
                        >
                          <span className="text">
                            {editAddressMutation.isPending
                              ? "Updating..."
                              : "Update address"}
                          </span>
                        </button>
                        <span
                          onClick={() => handleEditToggle(address.id)}
                          className="tf-btn btn-fill radius-4 btn-hide-edit-address"
                        >
                          <span className="text">Cancel</span>
                        </span>
                      </div>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
