import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";

export const viewport: Viewport = {
  themeColor: "#071325",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://desa-dekut.co.ke"),
  title: {
    default: "DESA | Dedan Kimathi University Engineering Students Association",
    template: "%s | DESA DeKUT",
  },
  description:
    "Official website of the Dedan Kimathi University Engineering Students Association (DESA) at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya. Uniting students across Mechatronic, Mechanical, Electrical, Civil, and Chemical Engineering with EBK, IEK, hands-on technical labs, and breakthrough student innovations.",
  keywords: [
    "Dedan Kimathi University of Technology",
    "DeKUT Engineering",
    "DESA DeKUT",
    "Dedan Kimathi University Engineering Students Association",
    "School of Engineering DeKUT",
    "DeKUT Mechatronics",
    "DESA Engineering Projects",
    "DeKUT Mechanical Engineering",
    "DeKUT Electrical and Electronic Engineering",
    "DeKUT Civil Engineering",
    "DeKUT Chemical Engineering",
    "Engineers Board of Kenya DeKUT",
    "IEK Student Chapter DeKUT",
    "Engineering course syllabi DeKUT",
    "Nyeri Engineering Students Association",
    "DESA Student Hackathons",
    "DeKUT Engineering Week",
  ],
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
    url: "https://desa-dekut.co.ke",
    siteName: "DESA - DeKUT Engineering Students Association",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/images/dekut-campus.jpg",
        width: 1200,
        height: 630,
        alt: "Dedan Kimathi University of Technology Engineering Complex & Campus",
      },
      {
        url: "/images/desa-logo.jpg",
        width: 600,
        height: 600,
        alt: "Official Crest of DESA - DeKUT Engineering Students Association",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DESA | Dedan Kimathi University Engineering Students Association",
    description:
      "Official portal for student engineers at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya.",
    images: ["/images/dekut-campus.jpg"],
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
    icon: "/images/desa-logo.jpg",
    apple: "/images/desa-logo.jpg",
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
        "@id": "https://desa-dekut.co.ke/#organization",
        name: "Dedan Kimathi University Engineering Students Association",
        alternateName: ["DESA", "DESA DeKUT", "DeKUT Engineering Students Association"],
        url: "https://desa-dekut.co.ke",
        logo: "https://desa-dekut.co.ke/images/desa-logo.jpg",
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
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-[#e5a93c] selection:text-[#071325]">
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
