"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
// import CountdownTimer from "../common/Countdown";
import { useContextElement } from "@/context/Context";
import { useQuery } from "@tanstack/react-query";
import { getCities } from "@/actions/main";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export default function ShopCart() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const { cartProducts, setCartProducts, totalPrice } = useContextElement();
  const setQuantity = (id, quantity) => {
    if (quantity >= 1) {
      const item = cartProducts.filter((elm) => elm.id == id)[0];
      const items = [...cartProducts];
      const itemIndex = items.indexOf(item);
      item.quantity = quantity;
      items[itemIndex] = item;
      setCartProducts(items);
    }
  };
  const removeItem = (id) => {
    setCartProducts((pre) => [...pre.filter((elm) => elm.id != id)]);
  };
  const handleOptionChange = (elm) => {
    setSelectedOption(elm);
  };

  // Helper function to calculate item total consistently
  const calculateItemTotal = (price, quantity) => {
    return (price * quantity).toFixed(2);
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return locale === "ar" ? `ج.م ${amount}` : `EGP ${amount}`;
  };

  useEffect(() => {
    if (cities && cities.length > 0) {
      setSelectedOption(cities[0]);
    }
  }, [cities]);

  console.log("cartProducts", cartProducts);

  // useEffect(() => {
  //   document.querySelector(".progress-cart .value").style.width = "70%";
  // }, []);

  return (
    <>
      <section className="flat-spacing">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-lg-7 mb-4 mb-xl-0">
              {/* <div className="tf-cart-sold">
                <div className="notification-sold bg-surface">
                  <Image
                    className="icon"
                    alt="img"
                    src="/images/logo/icon-fire.png"
                    width={48}
                    height={49}
                  />
                  <div className="count-text">
                    Your cart will expire in
                    <div
                      className="js-countdown time-count"
                      data-timer={600}
                      data-labels=":,:,:,"
                    >
                      <CountdownTimer
                        style={4}
                        targetDate={new Date(new Date().getTime() - 30 * 60000)}
                      />
                    </div>
                    minutes! Please checkout now before your items sell out!
                  </div>
                </div>
                <div className="notification-progress">
                  <div className="text">
                    Buy
                    <span className="fw-semibold text-primary">
                      $70.00
                    </span>{" "}
                    more to get <span className="fw-semibold">Freeship</span>
                  </div>
                  <div className="progress-cart">
                    <div
                      className="value"
                      style={{ width: "0%" }}
                      data-progress={50}
                    >
                      <span className="round" />
                    </div>
                  </div>
                </div>
              </div> */}
              {cartProducts.length ? (
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Desktop Table View - Large screens and up */}
                  <div className="d-none d-xl-block">
                    <table className="tf-table-page-cart">
                      <thead>
                        <tr>
                          <th>{t("products")}</th>
                          <th>{t("price")}</th>
                          <th>{t("quantity")}</th>
                          <th>{t("totalPrice")}</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {cartProducts.map((elm, i) => (
                          <tr key={i} className="tf-cart-item file-delete">
                            <td className="tf-cart-item_product">
                              <Link
                                href={`/product-detail/${elm.id}`}
                                className="img-box"
                              >
                                <Image
                                  alt="product"
                                  src={elm.image_path || elm.imgSrc}
                                  width={600}
                                  height={800}
                                />
                              </Link>
                              <div className="cart-info">
                                <Link
                                  href={`/product-detail/${elm.id}`}
                                  className="cart-title link"
                                >
                                  {elm.title}
                                </Link>
                                <div className="cart-weight">
                                  {locale === "ar" ? "الوزن:" : "Weight:"}{" "}
                                  {elm.weight}
                                </div>
                              </div>
                            </td>
                            <td
                              data-cart-title="Price"
                              className="tf-cart-item_price text-center"
                            >
                              <div className="cart-price text-button price-on-sale">
                                {formatCurrency(elm.price.toFixed(2))}
                              </div>
                            </td>
                            <td
                              data-cart-title="Quantity"
                              className="tf-cart-item_quantity"
                            >
                              <div className="wg-quantity mx-md-auto">
                                <span
                                  className="btn-quantity btn-decrease"
                                  onClick={() =>
                                    setQuantity(elm.id, elm.quantity - 1)
                                  }
                                >
                                  -
                                </span>
                                <input
                                  type="text"
                                  className="quantity-product"
                                  name="number"
                                  value={elm.quantity}
                                  readOnly
                                />
                                <span
                                  className="btn-quantity btn-increase"
                                  onClick={() =>
                                    setQuantity(elm.id, elm.quantity + 1)
                                  }
                                >
                                  +
                                </span>
                              </div>
                            </td>
                            <td
                              data-cart-title="Total"
                              className="tf-cart-item_total text-center"
                            >
                              <div className="cart-total text-button total-price">
                                {formatCurrency(
                                  calculateItemTotal(elm.price, elm.quantity)
                                )}
                              </div>
                            </td>
                            <td
                              data-cart-title="Remove"
                              className="remove-cart"
                              onClick={() => removeItem(elm.id)}
                            >
                              <span className="remove icon icon-close" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tablet Table View - Large screens only */}
                  <div className="d-none d-lg-block d-xl-none">
                    <div className="table-responsive">
                      <table className="tf-table-page-cart">
                        <thead>
                          <tr>
                            <th>{t("products")}</th>
                            <th className="text-center">{t("price")}</th>
                            <th className="text-center">{t("quantity")}</th>
                            <th className="text-center">{t("totalPrice")}</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {cartProducts.map((elm, i) => (
                            <tr key={i} className="tf-cart-item file-delete">
                              <td className="tf-cart-item_product">
                                <div className="d-flex align-items-center gap-3">
                                  <Link
                                    href={`/product-detail/${elm.id}`}
                                    className="img-box flex-shrink-0"
                                    style={{ width: "60px", height: "75px" }}
                                  >
                                    <Image
                                      alt="product"
                                      src={elm.image_path || elm.imgSrc}
                                      width={60}
                                      height={75}
                                      className="rounded"
                                    />
                                  </Link>
                                  <div className="cart-info">
                                    <Link
                                      href={`/product-detail/${elm.id}`}
                                      className="cart-title link"
                                    >
                                      {elm.title}
                                    </Link>
                                  </div>
                                </div>
                              </td>
                              <td className="tf-cart-item_price text-center">
                                <div className="cart-price text-button price-on-sale">
                                  {formatCurrency(elm.price.toFixed(2))}
                                </div>
                              </td>
                              <td className="tf-cart-item_quantity text-center">
                                <div
                                  className="wg-quantity mx-auto"
                                  style={{ width: "fit-content" }}
                                >
                                  <span
                                    className="btn-quantity btn-decrease"
                                    onClick={() =>
                                      setQuantity(elm.id, elm.quantity - 1)
                                    }
                                  >
                                    -
                                  </span>
                                  <input
                                    type="text"
                                    className="quantity-product"
                                    name="number"
                                    value={elm.quantity}
                                    readOnly
                                  />
                                  <span
                                    className="btn-quantity btn-increase"
                                    onClick={() =>
                                      setQuantity(elm.id, elm.quantity + 1)
                                    }
                                  >
                                    +
                                  </span>
                                </div>
                              </td>
                              <td className="tf-cart-item_total text-center">
                                <div className="cart-total text-button total-price">
                                  {formatCurrency(
                                    calculateItemTotal(elm.price, elm.quantity)
                                  )}
                                </div>
                              </td>
                              <td
                                className="remove-cart text-center"
                                onClick={() => removeItem(elm.id)}
                              >
                                <span
                                  className="remove icon icon-close"
                                  style={{ cursor: "pointer" }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Medium Screens - Card Layout with horizontal arrangement */}
                  <div className="d-none d-md-block d-lg-none">
                    {cartProducts.map((elm, i) => (
                      <div
                        key={i}
                        className="cart-item-medium mb-3 p-3 bg-surface rounded border"
                      >
                        <div className="row align-items-center">
                          <div className="col-md-5">
                            <div className="d-flex align-items-center gap-3">
                              <Link
                                href={`/product-detail/${elm.id}`}
                                className="cart-item-image flex-shrink-0"
                              >
                                <Image
                                  alt="product"
                                  src={elm.image_path || elm.imgSrc}
                                  width={70}
                                  height={90}
                                  className="rounded"
                                />
                              </Link>
                              <div className="cart-item-info">
                                <Link
                                  href={`/product-detail/${elm.id}`}
                                  className="cart-title link d-block fw-semibold"
                                >
                                  {elm.title}
                                </Link>
                                <div className="cart-price mt-1">
                                  <span className="fw-semibold">
                                    {formatCurrency(elm.price.toFixed(2))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3 text-center">
                            <div className="quantity-label text-muted small mb-1">
                              {t("quantity")}
                            </div>
                            <div
                              className="wg-quantity mx-auto"
                              style={{ width: "fit-content" }}
                            >
                              <span
                                className="btn-quantity btn-decrease"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity - 1)
                                }
                              >
                                -
                              </span>
                              <input
                                type="text"
                                className="quantity-product"
                                name="number"
                                value={elm.quantity}
                                readOnly
                              />
                              <span
                                className="btn-quantity btn-increase"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity + 1)
                                }
                              >
                                +
                              </span>
                            </div>
                          </div>
                          <div className="col-md-3 text-center">
                            <div className="total-label text-muted small mb-1">
                              {t("totalPrice")}
                            </div>
                            <div className="cart-total fw-bold">
                              {formatCurrency(
                                calculateItemTotal(elm.price, elm.quantity)
                              )}
                            </div>
                          </div>
                          <div className="col-md-1 text-center">
                            <span
                              className="remove icon icon-close btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(elm.id)}
                              style={{ cursor: "pointer", padding: "8px" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Card View - Small screens */}
                  <div className="d-md-none">
                    {cartProducts.map((elm, i) => (
                      <div
                        key={i}
                        className="cart-item-mobile mb-3 p-3 bg-surface rounded shadow-sm"
                      >
                        <div className="d-flex gap-3">
                          <Link
                            href={`/product-detail/${elm.id}`}
                            className="cart-item-image flex-shrink-0"
                          >
                            <Image
                              alt="product"
                              src={elm.image_path || elm.imgSrc}
                              width={85}
                              height={110}
                              className="rounded"
                            />
                          </Link>
                          <div className="cart-item-details flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Link
                                href={`/product-detail/${elm.id}`}
                                className="cart-title link fw-semibold text-decoration-none"
                                style={{ fontSize: "14px", lineHeight: "1.4" }}
                              >
                                {elm.title}
                              </Link>
                              <span
                                className="remove-btn ms-2 p-1"
                                onClick={() => removeItem(elm.id)}
                                style={{
                                  cursor: "pointer",
                                  minWidth: "30px",
                                  height: "30px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "50%",
                                  backgroundColor: "#f8f9fa",
                                }}
                              >
                                <span className="icon icon-close text-danger" />
                              </span>
                            </div>

                            <div className="cart-item-price mb-3">
                              <span className="text-muted small">
                                {t("price")}:{" "}
                              </span>
                              <span className="fw-semibold">
                                {formatCurrency(elm.price.toFixed(2))}
                              </span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                              <div className="quantity-section">
                                <div className="text-muted small mb-1">
                                  {t("quantity")}
                                </div>
                                <div
                                  className="wg-quantity"
                                  style={{ scale: "0.9" }}
                                >
                                  <span
                                    className="btn-quantity btn-decrease"
                                    onClick={() =>
                                      setQuantity(elm.id, elm.quantity - 1)
                                    }
                                    style={{
                                      minWidth: "35px",
                                      height: "35px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    -
                                  </span>
                                  <input
                                    type="text"
                                    className="quantity-product text-center"
                                    name="number"
                                    value={elm.quantity}
                                    readOnly
                                    style={{
                                      minWidth: "50px",
                                      height: "35px",
                                      border: "1px solid #dee2e6",
                                      borderLeft: "none",
                                      borderRight: "none",
                                    }}
                                  />
                                  <span
                                    className="btn-quantity btn-increase"
                                    onClick={() =>
                                      setQuantity(elm.id, elm.quantity + 1)
                                    }
                                    style={{
                                      minWidth: "35px",
                                      height: "35px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    +
                                  </span>
                                </div>
                              </div>

                              <div className="total-section text-end">
                                <div className="text-muted small mb-1">
                                  {t("totalPrice")}
                                </div>
                                <div
                                  className="fw-bold"
                                  style={{ fontSize: "16px" }}
                                >
                                  {formatCurrency(
                                    calculateItemTotal(elm.price, elm.quantity)
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </form>
              ) : (
                <div>
                  {t("emptyMessage")}{" "}
                  <Link className="btn-line" href="/shop">
                    {t("exploreProducts")}
                  </Link>
                </div>
              )}
            </div>
            <div className="col-xl-4 col-lg-5">
              <div className="fl-sidebar-cart">
                <div className="box-order bg-surface">
                  <h5 className="title">{t("orderSummary")}</h5>
                  <div className="subtotal text-button d-flex justify-content-between align-items-center">
                    <span>{t("subtotal")}</span>
                    <span className="total">
                      {formatCurrency(totalPrice.toFixed(2))}
                    </span>
                  </div>

                  <div className="ship">
                    <span className="text-button d-block mb-3">
                      {t("shipping")}
                    </span>
                    <div className="flex-grow-1">
                      {cities?.map((city) => (
                        <fieldset key={city.id} className="ship-item mb-2">
                          <input
                            type="radio"
                            name="ship-check"
                            className="tf-check-rounded"
                            id={`city-${city.id}`}
                            checked={selectedOption?.id === city.id}
                            onChange={() => handleOptionChange(city)}
                          />
                          <label
                            htmlFor={`city-${city.id}`}
                            className="d-flex justify-content-between align-items-center w-100 p-2 rounded"
                          >
                            <span className="fw-medium">{city.name}</span>
                            <span className="price fw-semibold">
                              {formatCurrency(city.delivery_tax.toFixed(2))}
                            </span>
                          </label>
                        </fieldset>
                      ))}
                    </div>
                  </div>
                  <hr className="my-3" />
                  <h5 className="total-order d-flex justify-content-between align-items-center mb-4">
                    <span>{t("total")}</span>
                    <span className="total fw-bold">
                      {formatCurrency(
                        (
                          totalPrice + (selectedOption?.delivery_tax || 0)
                        ).toFixed(2)
                      )}
                    </span>
                  </h5>
                  <div className="box-progress-checkout">
                    {/* <fieldset className="check-agree">
                      <input
                        type="checkbox"
                        id="check-agree"
                        className="tf-check-rounded"
                      />
                      <label htmlFor="check-agree">
                        {t("agreeTerms")}{" "}
                        <Link href={`/term-of-use`}>
                          {t("termsConditions")}
                        </Link>
                      </label>
                    </fieldset> */}
                    <Link
                      href={`/checkout`}
                      className="tf-btn btn-reset w-100 text-center py-3"
                    >
                      {t("processToCheckout")}
                    </Link>
                    {/* <p className="text-button text-center">
                      {t("continueShopping")}
                    </p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
