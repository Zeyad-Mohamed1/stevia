import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import CartModal from "@/components/modals/CartModal";
import QuickView from "@/components/modals/QuickView";
import QuickAdd from "@/components/modals/QuickAdd";
import Compare from "@/components/modals/Compare";
import MobileMenu from "@/components/modals/MobileMenu";
import { Toaster } from "react-hot-toast";
import SearchModal from "@/components/modals/SearchModal";
import SizeGuide from "@/components/modals/SizeGuide";
import Wishlist from "@/components/modals/Wishlist";
import DemoModal from "@/components/modals/DemoModal";
import Categories from "@/components/modals/Categories";
import AccountSidebar from "@/components/modals/AccountSidebar";
import "@/styles/search-modal.css";

export const metadata = {
  title: "Stevia",
  description: "Stevia",
};

export default async function LocaleLayout({ children, params }) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <main dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <NextIntlClientProvider>
        <div id="wrapper">{children}</div>
        <CartModal />
        <QuickView />
        <QuickAdd />
        <Compare />
        <MobileMenu />
        <Toaster />
        {/* <NewsLetterModal /> */}
        <SearchModal />
        <SizeGuide />
        <Wishlist />
        <DemoModal />
        <Categories />
        <AccountSidebar />
      </NextIntlClientProvider>
    </main>
  );
}
