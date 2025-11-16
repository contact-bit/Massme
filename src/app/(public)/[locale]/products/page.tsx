import ProductsClient from "./products-client";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const safeLocale = locale === "en" ? "en" : "fr";

  return <ProductsClient locale={safeLocale} />;
}
