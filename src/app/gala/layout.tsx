import { Metadata } from "next";

const siteUrl = "https://esa-dekut.vercel.app";
const galaOgImage = `${siteUrl}/images/events/masquerade-dinner.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Gala Seat Reservation | DESA - DeKUT Engineering Students Association",
  description:
    "Official Seat Reservation for the DESA Annual Engineering Gala 2026: Masquerade Dinner. Theme: 'Structures That Stand, Standards That Endure'. Golden Gates Hotel, Nyeri • 20 Nov 2026 • Lipa polepole allowed.",
  alternates: {
    canonical: "/gala",
  },
  keywords: [
    "DESA Gala",
    "Gala Seat Reservation",
    "DeKUT Engineering Gala",
    "Engineering Gala Registration",
    "Dedan Kimathi University of Technology",
    "Slits and Suits Gala",
    "Masquerade Dinner 2026",
    "Golden Gates Hotel Nyeri",
    "Engineering Awards Dinner",
  ],
  openGraph: {
    title: "DESA Annual Engineering Gala 2026 | Seat Reservation",
    description:
      "Engineering Masquerade Dinner • Golden Gates Hotel, Nyeri • 20 Nov 2026. Reserve your table seat now — Lipa polepole allowed.",
    url: `${siteUrl}/gala`,
    siteName: "DESA - Dedan Kimathi University Engineering Students Association",
    type: "website",
    locale: "en_KE",
    images: [
      {
        url: galaOgImage,
        width: 682,
        height: 1024,
        alt: "DESA Annual Engineering Gala 2026 - Masquerade Dinner",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DESA Annual Engineering Gala 2026 | Seat Reservation",
    description:
      "Engineering Masquerade Dinner • 20 Nov 2026 at Golden Gates Hotel, Nyeri. Lipa polepole allowed.",
    images: [galaOgImage],
    creator: "@desa_dekut",
  },
};

export default function GalaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
