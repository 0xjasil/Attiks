import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://attiks.in"),
  title: {
    default: "ATTIKS | Modern Architectural Masterpieces",
    template: "%s | ATTIKS Architecture",
  },
  description:
    "Attiks Architecture is a premier Kerala-based practice creating contextual, enduring architecture shaped by climate, material, and spatial experience across residential, commercial, and cultural domains.",
  keywords: [
    "Attiks Architecture",
    "Kerala Architecture Firm",
    "Luxury Residential Design",
    "Contemporary Architecture",
    "Contextual Architecture",
    "Sustainable Design",
    "Kochi Architects",
    "Commercial Architecture",
  ],
  authors: [{ name: "Attiks Architecture" }],
  creator: "Attiks Architecture",
  publisher: "Attiks Architecture",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ATTIKS | Modern Architectural Masterpieces",
    description:
      "Bespoke architectural design and luxury spatial experiences tailored to climate and context.",
    url: "https://attiks.in",
    siteName: "ATTIKS Architecture",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/villa_showcase.webp",
        width: 1200,
        height: 630,
        alt: "ATTIKS Architecture Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATTIKS | Modern Architectural Masterpieces",
    description:
      "Contextual, enduring architecture shaped by climate, material, and the experience of space.",
    images: ["/villa_showcase.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/logo-light.png", type: "image/png" },
    ],
    apple: [{ url: "/images/logo-light.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ProfessionalService", "ArchitecturalStudio", "Organization"],
      "@id": "https://attiks.in/#organization",
      name: "ATTIKS Architecture",
      legalName: "Attiks Architecture Studio",
      description:
        "A Kerala-based architectural practice creating contextual, enduring architecture informed by climate, material, and spatial experience across residential, commercial, and cultural domains.",
      url: "https://attiks.in",
      logo: "https://attiks.in/images/logo-light.png",
      image: "https://attiks.in/villa_showcase.webp",
      telephone: "+91-0483-2941308",
      email: "info@attiks.in",
      priceRange: "$$$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "#1/523, Krishna Building, NH 66, Azhinhilam PO",
        addressLocality: "Calicut",
        addressRegion: "Kerala",
        postalCode: "673632",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 11.2023,
        longitude: 75.8778,
      },
      areaServed: [
        { "@type": "AdministrativeArea", name: "Kerala" },
        { "@type": "AdministrativeArea", name: "Karnataka" },
        { "@type": "AdministrativeArea", name: "Tamil Nadu" },
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "India" },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "09:00",
          closes: "18:00",
        },
      ],
      sameAs: [
        "https://www.instagram.com/attiksarchitecture",
        "https://www.linkedin.com/company/attiks-architecture",
        "https://www.facebook.com/attiksarchitecture",
      ],
      knowsAbout: [
        "Tropical Modern Architecture",
        "Passive Climate Design",
        "Contextual Materiality",
        "Bespoke Residential Architecture",
        "Commercial & Hospitality Architecture",
        "Masterplanning & Landscape Integration",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Architectural Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Luxury Residential Architecture",
              description: "Custom tropical modern homes and private estates crafted for context and climate.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Commercial & Cultural Architecture",
              description: "Civic spaces, convention centers, boutique offices, and hospitality developments.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Masterplanning & Landscape Architecture",
              description: "Harmonious site planning integrating topography, flora, and architectural volumes.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://attiks.in/#website",
      url: "https://attiks.in",
      name: "ATTIKS Architecture",
      publisher: {
        "@id": "https://attiks.in/#organization",
      },
    },
  ],
};

import SmoothScroll from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="preload"
          href="/fonts/Canela-LightItalic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/NeueHaasDisplayRoman.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/NeueHaasDisplayBold.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/villa_showcase.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
