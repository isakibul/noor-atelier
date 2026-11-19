import { StoreProvider } from "@/components/store-provider";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noor Atelier — Made for your story",
  description: "A modern made-to-order occasionwear storefront.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
