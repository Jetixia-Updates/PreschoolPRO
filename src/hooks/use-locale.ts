"use client";

import { useParams } from "next/navigation";

/**
 * Custom hook to get locale information
 */
export function useLocale() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isRTL = locale === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  return {
    locale,
    isRTL,
    dir,
    otherLocale: locale === "ar" ? "en" : "ar",
  };
}
