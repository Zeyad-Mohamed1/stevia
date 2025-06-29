"use client";

import { useContextElement } from "@/context/Context";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { checkout, checkoutWithOutAuth, getCart } from "@/actions/cart";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";
import { getCities } from "@/actions/main";
import { useLocale, useTranslations } from "next-intl";
import { login } from "@/actions/auth";

export default function Checkout() {
  const locale = useLocale();
  const t = useTranslations("checkout");
  const { cartProducts, totalPrice, setCartProducts } = useContextElement();
  const { user, fetchUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        const response = await getCart();
        // Map the response to ensure quantity is properly set
        const mappedItems =
          response.items?.map((item) => ({
            ...item,
            quantity: item.pivot?.qty || item.quantity || 1,
            // Keep the original pivot data for reference if needed
            originalPivot: item.pivot,
          })) || [];

        setCartProducts(mappedItems);
      };
      fetchCart();
    }
  }, [user]);

  // Fetch cities for shipping options
  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });

  // Form states
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    f_name: "",
    l_name: "",
    email: "",
    phone: "",
    city: "",
    zip: "",
    address: "",
    type: "",
    notes: "",
    cart: [],
  });

  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Calculate totals
  const selectedShippingCost = selectedShippingOption?.delivery_tax || 0;
  const finalTotal = totalPrice + selectedShippingCost;

  // Initialize with first city when cities are loaded
  useEffect(() => {
    if (cities && cities.length > 0 && !selectedShippingOption) {
      setSelectedShippingOption(cities[0]);
    }
  }, [cities, selectedShippingOption]);

  // Initialize with first address when user is authenticated and has addresses
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0].id);
    }
  }, [user?.addresses, selectedAddressId]);

  // Checkout mutations
  const checkoutMutation = useMutation({
    mutationFn: async (data) => {
      if (user) {
        // User is authenticated - use regular checkout with selected address
        return await checkout({
          address_id: selectedAddressId,
          notes: data.notes,
        });
      } else {
        // User not authenticated - use checkout without auth
        const cartItems = cartProducts?.map((item) => ({
          item_id: item.id,
          qty: item.quantity || item.pivot?.qty || 1,
          color: item.selectedColor
            ? typeof item.selectedColor === "object"
              ? item.selectedColor?.name || item.selectedColor?.value || ""
              : item.selectedColor
            : item.pivot?.color || "",
          size: item.selectedSize
            ? typeof item.selectedSize === "object"
              ? item.selectedSize?.name ||
                item.selectedSize?.value ||
                item.selectedSize?.size ||
                ""
              : item.selectedSize
            : item.pivot?.size || "",
        }));

        // Find the selected city object to get the city ID
        const selectedCity = cities?.find((city) => city.name === data.city);

        return await checkoutWithOutAuth({
          f_name: data.f_name,
          l_name: data.l_name,
          company_name: "",
          email: data.email,
          phone: data.phone,
          city: selectedCity?.id || data.city, // Use city ID if available, fallback to name
          zip: data.zip,
          notes: data.notes || "",
          cart: cartItems,
        });
      }
    },
    onSuccess: (data) => {
      // Clear cart
      setCartProducts([]);

      fetchUser();

      // Clear local storage cart for non-authenticated users
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
      }

      // Reset shipping form data
      setShippingInfo({
        name: "",
        f_name: "",
        l_name: "",
        email: "",
        phone: "",
        city: "",
        zip: "",
        address: "",
        type: "",
        notes: "",
        cart: [],
      });

      // Reset selected shipping option and address
      if (cities && cities.length > 0) {
        setSelectedShippingOption(cities[0]);
      }
      if (user?.addresses && user.addresses.length > 0) {
        setSelectedAddressId(user.addresses[0].id);
      }

      // Show success message
      !user
        ? toast.success(
            locale === "ar"
              ? "تم الطلب بنجاح, يرجي تسجيل الدخول لمتابعة الطلب"
              : "Order placed successfully, please login to track your order"
          )
        : toast.success(t("orderPlacedSuccess"));

      // Redirect after a short delay to allow user to see the success message
      setTimeout(() => {
        user ? router.push("/") : router.push("/login");
      }, 2000);
    },
    onError: (error) => {
      toast.error(t("checkoutFailed"));
      console.error("Checkout error:", error);
    },
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Validate login form
    if (!loginData.email || !loginData.password) {
      toast.error(t("fillRequiredFields") + "Email/Phone, Password");
      return;
    }

    setIsLoggingIn(true);

    try {
      const formData = new FormData();
      formData.append("phone", loginData.email); // Using email field as phone/email
      formData.append("password", loginData.password);

      const response = await login(formData);
      toast.success(t("loginSuccessful"));

      // Fetch updated user data
      await fetchUser();

      // Clear login form
      setLoginData({
        email: "",
        password: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(t("loginFailed"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = user
      ? [] // For authenticated users - address is selected from existing addresses
      : ["f_name", "l_name", "email", "phone", "city", "zip"]; // For non-authenticated users
    const missingFields = requiredFields.filter(
      (field) => !shippingInfo[field]
    );

    if (missingFields.length > 0) {
      toast.error(`${t("fillRequiredFields")}${missingFields.join(", ")}`);
      return;
    }

    // For authenticated users, ensure an address is selected
    if (user && !selectedAddressId) {
      toast.error(
        locale === "ar"
          ? "يرجى اختيار عنوان للتسليم"
          : "Please select a delivery address"
      );
      return;
    }

    if (cartProducts?.length === 0) {
      toast.error(t("cartEmpty"));
      return;
    }

    // For non-authenticated users, ensure we have a selected shipping option
    if (!user && !selectedShippingOption) {
      toast.error(
        t("selectShippingMethod") || "Please select a shipping method"
      );
      return;
    }

    // Validate email format for non-authenticated users
    if (!user) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shippingInfo.email)) {
        toast.error(t("invalidEmail") || "Please enter a valid email address");
        return;
      }
    }

    checkoutMutation.mutate(shippingInfo);
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If city is changed, update the selected shipping option
    if (name === "city" && value) {
      const selectedCity = cities?.find((city) => city.name === value);
      if (selectedCity) {
        setSelectedShippingOption(selectedCity);
      }
    }
  };

  const handleLoginDataChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShippingOptionChange = (city) => {
    setSelectedShippingOption(city);
    // Update the shipping info city when shipping option is selected
    setShippingInfo((prev) => ({
      ...prev,
      city: city.name,
    }));
  };

  const handleAddressSelection = (addressId) => {
    setSelectedAddressId(addressId);
  };

  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-xl-6">
            <div className="flat-spacing tf-page-checkout">
              {!user && (
                <div className="wrap">
                  <div className="title-login">
                    <p>{t("alreadyHaveAccount")}</p>{" "}
                    <Link href={`/login`} className="text-button">
                      {t("loginHere")}
                    </Link>
                  </div>
                  <form className="login-box" onSubmit={handleLoginSubmit}>
                    <div className="grid-2">
                      <input
                        type="text"
                        name="email"
                        placeholder={t("yourNameEmail")}
                        value={loginData.email}
                        onChange={handleLoginDataChange}
                        required
                        disabled={isLoggingIn}
                      />
                      <input
                        type="password"
                        name="password"
                        placeholder={t("password")}
                        value={loginData.password}
                        onChange={handleLoginDataChange}
                        required
                        disabled={isLoggingIn}
                      />
                    </div>
                    <button
                      className="tf-btn"
                      type="submit"
                      disabled={isLoggingIn}
                    >
                      <span className="text">
                        {isLoggingIn ? t("processing") : t("login")}
                      </span>
                    </button>
                  </form>
                </div>
              )}

              <div className="wrap">
                <h5 className="title">
                  {user ? t("deliveryInformation") : t("information")}
                </h5>
                <form className="info-box" onSubmit={handleCheckoutSubmit}>
                  {!user ? (
                    <>
                      <div className="grid-2">
                        <input
                          type="text"
                          name="f_name"
                          placeholder={
                            locale === "ar" ? "الاسم الاول" : "First Name"
                          }
                          value={shippingInfo.f_name}
                          onChange={handleShippingInfoChange}
                          required
                        />
                        <input
                          type="text"
                          name="l_name"
                          placeholder={
                            locale === "ar" ? "الاسم الاخير" : "Last Name"
                          }
                          value={shippingInfo.l_name}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>
                      <div className="grid-2">
                        <input
                          type="email"
                          name="email"
                          placeholder={t("emailAddress")}
                          value={shippingInfo.email}
                          onChange={handleShippingInfoChange}
                          required
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder={t("phoneNumber")}
                          value={shippingInfo.phone}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>
                      <div className="grid-2">
                        <div className="tf-select">
                          <select
                            className="text-title"
                            name="city"
                            value={shippingInfo.city}
                            onChange={handleShippingInfoChange}
                            required
                          >
                            <option value="">
                              {locale === "ar" ? "اختر المدينة" : "Choose City"}
                            </option>
                            {cities?.map((city) => (
                              <option key={city.id} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          name="zip"
                          placeholder={t("postalCode")}
                          value={shippingInfo.zip}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div className="address-selection">
                      <h6 className="mb-3">
                        {locale === "ar"
                          ? "اختر عنوان التسليم"
                          : "Select Delivery Address"}
                      </h6>
                      {user?.addresses && user.addresses.length > 0 ? (
                        <div className="address-list">
                          {user.addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`address-item ${
                                selectedAddressId === address.id
                                  ? "selected"
                                  : ""
                              }`}
                              style={{
                                border:
                                  selectedAddressId === address.id
                                    ? "2px solid #007bff"
                                    : "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "15px",
                                marginBottom: "10px",
                                cursor: "pointer",
                                backgroundColor:
                                  selectedAddressId === address.id
                                    ? "#f8f9fa"
                                    : "white",
                              }}
                              onClick={() => handleAddressSelection(address.id)}
                            >
                              <div className="d-flex align-items-center">
                                <input
                                  type="radio"
                                  name="address"
                                  checked={selectedAddressId === address.id}
                                  onChange={() =>
                                    handleAddressSelection(address.id)
                                  }
                                  className="me-3"
                                />
                                <div className="address-details">
                                  <div className="fw-bold">
                                    {address.f_name} {address.l_name}
                                  </div>
                                  <div className="text-muted">
                                    {address.city} - {address.zip}
                                  </div>
                                  <div className="text-muted">
                                    {address.phone}
                                  </div>
                                  <div className="text-muted small">
                                    {address.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-addresses text-center p-4">
                          <p className="text-muted mb-3">
                            {locale === "ar"
                              ? "لا توجد عناوين محفوظة"
                              : "No saved addresses found"}
                          </p>
                          <Link
                            href="/my-account-address"
                            className="tf-btn btn-outline"
                          >
                            {locale === "ar" ? "إضافة عنوان" : "Add Address"}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                  <textarea
                    name="notes"
                    placeholder={t("writeNote")}
                    value={shippingInfo.notes}
                    onChange={handleShippingInfoChange}
                  />

                  <button
                    className="tf-btn btn-reset mt-4"
                    type="submit"
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending
                      ? t("processing")
                      : t("placeOrder")}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-xl-1">
            <div className="line-separation" />
          </div>
          <div className="col-xl-5">
            <div className="flat-spacing flat-sidebar-checkout">
              <div className="sidebar-checkout-content">
                <h5 className="title">{t("shoppingCart")}</h5>
                <div className="list-product">
                  {cartProducts?.map((elm, i) => (
                    <div key={i} className="item-product">
                      <Link
                        href={`/product-detail/${elm.id}`}
                        className="img-product"
                      >
                        <Image
                          alt="img-product"
                          src={elm.image_path || elm.imgSrc}
                          width={600}
                          height={800}
                        />
                      </Link>
                      <div className="content-box">
                        <div className="info">
                          <Link
                            href={`/product-detail/${elm.id}`}
                            className="name-product link text-title"
                          >
                            {elm.name || elm.title}
                          </Link>
                          <div className="cart-weight">
                            {locale === "ar" ? "الوزن:" : "Weight:"}{" "}
                            {elm.weight}
                          </div>
                          <div className="variant text-caption-1 text-secondary">
                            <span className="size">
                              {typeof elm.selectedSize === "object"
                                ? elm.selectedSize?.value ||
                                  elm.selectedSize?.size ||
                                  elm.selectedSize?.name
                                : elm.selectedSize}
                            </span>
                            {(elm.selectedColor || elm.selectedSize) && "/"}
                            {elm.selectedColor && (
                              <span
                                className="color"
                                style={{
                                  backgroundColor:
                                    typeof elm.selectedColor === "object"
                                      ? elm.selectedColor?.bgColor ||
                                        elm.selectedColor?.colorCode ||
                                        elm.selectedColor?.name
                                      : elm.selectedColor,
                                  width: "15px",
                                  height: "15px",
                                  display: "inline-block",
                                  borderRadius: "50%",
                                  marginLeft: "5px",
                                  marginRight: "5px",
                                }}
                              ></span>
                            )}
                          </div>
                        </div>
                        <div className="total-price text-button">
                          <span className="count">{elm.quantity}</span>X
                          <span className="price">
                            {locale === "ar"
                              ? `ج.م ${elm.price?.toFixed(2)}`
                              : `EGP ${elm.price?.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Methods */}
                <div className="ship">
                  <span className="text-button">{t("shippingMethod")}</span>
                  <div className="flex-grow-1">
                    {cities?.map((city) => (
                      <fieldset
                        key={city.id}
                        className="ship-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <input
                          type="radio"
                          name="ship-check"
                          className="tf-check-rounded"
                          id={`city-${city.id}`}
                          checked={selectedShippingOption?.id === city.id}
                          onChange={() => handleShippingOptionChange(city)}
                        />
                        <label
                          htmlFor={`city-${city.id}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexGrow: 1,
                            cursor: "pointer",
                          }}
                        >
                          <span>{city.name}</span>
                          <span className="price">
                            {locale === "ar"
                              ? `ج.م ${city.delivery_tax?.toFixed(2)}`
                              : `EGP ${city.delivery_tax?.toFixed(2)}`}
                          </span>
                        </label>
                      </fieldset>
                    ))}
                  </div>
                </div>

                <div className="sec-total-price">
                  <div className="top">
                    <div className="item d-flex align-items-center justify-content-between text-button">
                      <span>{t("subtotal")}</span>
                      <span>
                        {locale === "ar"
                          ? `ج.م ${totalPrice?.toFixed(2)}`
                          : `EGP ${totalPrice?.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="item d-flex align-items-center justify-content-between text-button">
                      <span>{t("shipping")}</span>
                      <span>
                        {locale === "ar"
                          ? `ج.م ${selectedShippingCost?.toFixed(2)}`
                          : `EGP ${selectedShippingCost?.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <div className="bottom">
                    <h5 className="d-flex justify-content-between">
                      <span>{t("total")}</span>
                      <span className="total-price-checkout">
                        {locale === "ar"
                          ? `ج.م ${finalTotal?.toFixed(2)}`
                          : `EGP ${finalTotal?.toFixed(2)}`}
                      </span>
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
