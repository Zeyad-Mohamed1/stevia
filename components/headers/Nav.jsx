"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function Nav() {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  const navItems = [
    { name: t("home"), href: "/" },
    { name: t("shop"), href: "/shop" },
    { name: t("storeList"), href: "/our-brands" },
    { name: t("aboutUs"), href: "/about-us" },
    { name: t("contact"), href: "/contact" },
  ];

  return (
    <>
      {navItems.map((item, index) => (
        <li
          key={index}
          className={`menu-item ${
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
              ? "active"
              : ""
          }`}
        >
          <Link href={item.href} className="item-link">
            {item.name}
          </Link>
        </li>
      ))}
    </>
  );
}
