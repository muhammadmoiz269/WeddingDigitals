import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { BRAND, SITE_URL, GSC_VERIFICATION, BING_VERIFICATION, GA_MEASUREMENT_ID } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { organizationLd, localBusinessLd, websiteLd } from "@/lib/jsonld";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} | Premium Wedding Cards in Karachi`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: [
    "wedding cards Karachi",
    "shadi cards karachi",
    "wedding invitations pakistan",
    "nikkah card karachi",
    "valima card karachi",
    "mehndi card karachi",
    "baraat card",
    "luxury wedding cards pakistan",
    "premium shaadi cards",
    "wedding invitation printing Karachi",
    "shahi bulawa wedding cards",
    "nikkah ka card",
    "valima invitation",
    "customized wedding card karachi",
    "affordable shadi cards",
    "bulk wedding cards karachi discount",
  ],
  authors: [{ name: BRAND.legalName, url: SITE_URL }],
  creator: BRAND.legalName,
  publisher: BRAND.legalName,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
    languages: { "en-PK": "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: BRAND.name,
    title: `${BRAND.name} | Premium Wedding Cards in Karachi`,
    description: BRAND.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | Premium Wedding Cards in Karachi`,
    description: BRAND.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/images/logo.ico.png", type: "image/png" }],
    apple: [{ url: "/images/logo.ico.png", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  verification: {
    google: GSC_VERIFICATION || undefined,
    other: BING_VERIFICATION ? { "msvalidate.01": BING_VERIFICATION } : undefined,
  },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: "#FFFDF7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-PK"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-ivory text-charcoal">
        <ServiceWorkerRegistrar />
        <JsonLd
          id="ld-org"
          data={[organizationLd(), localBusinessLd(), websiteLd()]}
        />
        {children}
        <SpeedInsights />
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
        <Analytics mode="production" />
        {/* ── Meta Pixel ── */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '4530019813990787');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=4530019813990787&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
