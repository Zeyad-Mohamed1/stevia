"use client";
import React from "react";
import { getSlidersNews } from "@/actions/slider";
import { useQuery } from "@tanstack/react-query";

export default function MarqueeSection2({ parentClass = "tf-marquee" }) {
  const { data: slidersNews } = useQuery({
    queryKey: ["slidersNews"],
    queryFn: () => getSlidersNews(),
  });

  return (
    <section className={parentClass}>
      <div className="marquee-wrapper">
        <div className="initial-child-container">
          {slidersNews?.map((slider, index) => (
            <React.Fragment key={index}>
              <div className="marquee-child-item">
                <span className="icon icon-lightning-line" />
              </div>
              <div className="marquee-child-item">
                <p className="text-btn-uppercase">{slider.title}</p>
              </div>
              <div className="marquee-child-item">
                <span className="icon icon-lightning-line" />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
