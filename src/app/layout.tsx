import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const viewport: Viewport = {
  themeColor: "#071325",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://esa-dekut.vercel.app"),
  title: {
    default: "DESA | Dedan Kimathi University Engineering Students Association",
    template: "%s | DESA DeKUT",
  },
  description:
    "Official Website of DESA — the Engineering Students Association at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya. Student projects, hackathons, and resources across five engineering disciplines.",
  keywords: [
    "DESA DeKUT",
    "Dedan Kimathi University Engineering",
    "DeKUT student projects",
    "Engineering Students Association Kenya",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "DESA Executive Council", url: "https://www.dkut.ac.ke" }],
  creator: "Dedan Kimathi University Engineering Students Association (DESA)",
  publisher: "Dedan Kimathi University of Technology",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "DESA | Dedan Kimathi University Engineering Students Association",
    description:
      "Pioneering engineering minds and technological innovation at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya. Official student chapter affiliated with EBK and IEK.",
    url: "https://esa-dekut.vercel.app",
    siteName: "DESA - DeKUT Engineering Students Association",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/images/desa-official-logo.png",
        width: 1024,
        height: 1024,
        alt: "Official Logo of DESA - DeKUT Engineering Students Association",
      },
      {
        url: "/images/dekut-campus.jpg",
        width: 1200,
        height: 630,
        alt: "Dedan Kimathi University of Technology Engineering Complex & Campus",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "DESA | Dedan Kimathi University Engineering Students Association",
    description:
      "Official portal for student engineers at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya.",
    images: ["/images/desa-official-logo.png"],
  },
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
  icons: {
    icon: "/images/desa-official-logo.png",
    apple: "/images/desa-official-logo.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Comprehensive Schema.org JSON-LD linking DESA to Dedan Kimathi University of Technology
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollegeOrUniversity",
        "@id": "https://www.dkut.ac.ke/#university",
        name: "Dedan Kimathi University of Technology",
        alternateName: "DeKUT",
        url: "https://www.dkut.ac.ke",
        logo: "https://www.dkut.ac.ke/images/logo.png",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Nyeri-Mweiga Road",
          postOfficeBoxNumber: "Private Bag - 10143 Dedan Kimathi",
          addressLocality: "Nyeri",
          addressRegion: "Central Kenya",
          addressCountry: "KE",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -0.3980,
          longitude: 36.9604,
        },
      },
      {
        "@type": "EducationalOrganization",
        "@id": "https://esa-dekut.vercel.app/#organization",
        name: "Dedan Kimathi University Engineering Students Association",
        alternateName: ["DESA", "DESA DeKUT", "DeKUT Engineering Students Association"],
        url: "https://esa-dekut.vercel.app",
        logo: "https://esa-dekut.vercel.app/images/desa-official-logo.png",
        sameAs: [
          "https://www.tiktok.com/@desa_dekut",
          "https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5",
          "https://www.instagram.com/dekut_engineeringstudents"
        ],
        parentOrganization: {
          "@id": "https://www.dkut.ac.ke/#university",
        },
        description:
          "Official student association for the School of Engineering at Dedan Kimathi University of Technology (DeKUT), representing undergraduate and postgraduate students in Mechatronic, Mechanical, Electrical, Civil, and Chemical engineering.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "School of Engineering, Main Campus, Nyeri-Mweiga Road",
          postOfficeBoxNumber: "Private Bag - 10143 Dedan Kimathi",
          addressLocality: "Nyeri",
          addressRegion: "Central",
          addressCountry: "KE",
        },
        email: "engineeringstudentsassociation@dkut.ac.ke",
        telephone: "+254709202942",
        memberOf: [
          {
            "@type": "Organization",
            name: "Engineers Board of Kenya",
            url: "https://ebk.go.ke",
          },
          {
            "@type": "Organization",
            name: "Institution of Engineers of Kenya",
            url: "https://iekenya.org",
          },
        ],
        department: [
          { "@type": "Department", name: "Department of Mechatronic Engineering" },
          { "@type": "Department", name: "Department of Mechanical Engineering" },
          { "@type": "Department", name: "Department of Electrical and Electronic Engineering" },
          { "@type": "Department", name: "Department of Civil Engineering" },
          { "@type": "Department", name: "Department of Chemical Engineering" },
        ],
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-[#e5a93c] selection:text-[#071325]" suppressHydrationWarning>
        <GoogleAnalytics />
        <TopBar />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
        <CookieConsent />
      </body>
    </html>
  );
}
