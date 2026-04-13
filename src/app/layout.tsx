import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paighaam Wedding Cards | Premium Invitations Crafted in Karachi",
  description:
    "Karachi's finest wedding card studio. Premium Nikkah, Walima, Mehndi & Baraat invitations with transparent pricing. Starting from PKR 120/card. No hidden charges.",
  keywords: [
    "wedding cards Karachi",
    "Nikkah invitation cards",
    "Walima cards Pakistan",
    "premium shaadi cards",
    "wedding invitation printing Karachi",
    "Mehndi invites",
    "Baraat cards",
  ],
  openGraph: {
    title: "Paighaam Wedding Cards | Premium Invitations Crafted in Karachi",
    description:
      "Premium wedding invitations with transparent pricing. Starting from PKR 120/card.",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        {children}
      </body>
    </html>
  );
}
