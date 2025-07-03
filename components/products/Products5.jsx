"use client";

import ProductCard1 from "@/components/productCards/ProductCard1";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getBestItems } from "@/actions/products";

export default function Products5() {
  const t = useTranslations("products");

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getBestItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log(products);

  // Transform API data to match ProductCard1 expected format
  const transformProduct = (product) => {
    return {
      id: product.id,
      title: product.name,
      imgSrc: product.image_path,
      imgHover:
        product.media && product.media[1]
          ? product.media[1].image_path
          : product.media && product.media[0]
          ? product.media[0].image_path
          : product.image_path,
      price: product.price,
      discount: product.discount,
      isOnSale: product.discount > 0,
      weight: product.weight,
      isAvailable: product.is_available === 1,
    };
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">{t("loading")}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <p className="text-danger">{t("errorTitle")}</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <p>{t("noProductsTitle")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">{t("topPicksTitle")}</h3>
          <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
        </div>
        <Swiper
          className="swiper tf-sw-latest"
          dir="ltr"
          spaceBetween={15}
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 15 },
            768: { slidesPerView: 3, spaceBetween: 30 },
            1200: { slidesPerView: 4, spaceBetween: 30 },
          }}
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".spd6",
          }}
        >
          {products.map((product, i) => (
            <SwiperSlide key={product.id || i} className="swiper-slide">
              <ProductCard1 product={transformProduct(product)} />
            </SwiperSlide>
          ))}

          <div className="sw-pagination-latest spd6 sw-dots type-circle justify-content-center" />
        </Swiper>
      </div>
    </section>
  );
}
