"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useUserStore } from "@/store/userStore";
export default function AccountSidebar() {
  const locale = useLocale();
  const { user } = useUserStore();
  const pathname = usePathname();
  const t = useTranslations("header");
  return (
    <div className="wrap-sidebar-account">
      <div className="sidebar-account">
        <div className="account-avatar">
          <div className="image">
            <Image
              alt="avatar"
              src="data:image/png;base64,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"
              width={281}
              height={280}
            />
          </div>
          <h6 className="mb_4">{user?.fname}</h6>
          <div className="body-text-1">{user?.email}</div>
        </div>
        <ul className="my-account-nav">
          <li>
            <Link
              href={`/my-account`}
              className={`my-account-nav-item ${
                pathname == "/my-account" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("myProfile")}
            </Link>
          </li>
          <li>
            <Link
              href={`/my-account-orders`}
              className={`my-account-nav-item ${
                pathname == "/my-account-orders" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5078 10.8734V6.36686C16.5078 5.17166 16.033 4.02541 15.1879 3.18028C14.3428 2.33514 13.1965 1.86035 12.0013 1.86035C10.8061 1.86035 9.65985 2.33514 8.81472 3.18028C7.96958 4.02541 7.49479 5.17166 7.49479 6.36686V10.8734M4.11491 8.62012H19.8877L21.0143 22.1396H2.98828L4.11491 8.62012Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("myOrders")}
            </Link>
          </li>
          <li>
            <Link
              href={`/my-account-address`}
              className={`my-account-nav-item ${
                pathname == "/my-account-address" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {locale === "en" ? "My Address" : "عنواني"}
            </Link>
          </li>
          <li>
            <Link
              href={`/login`}
              className={`my-account-nav-item ${
                pathname == "/login" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17L21 12L16 7"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("logout")}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
