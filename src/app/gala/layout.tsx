import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gala Seat Reservation | DESA - DeKUT Engineering Students Association",
  description:
    "Official Seat Reservation for the DESA Annual Engineering Gala & Awards Dinner. Secure your table seat with a Ksh 500 commitment deposit for the flagship celebration of DeKUT engineering scholars, alumni, and industry leaders.",
  keywords: [
    "DESA Gala",
    "Gala Seat Reservation",
    "DeKUT Engineering Gala",
    "Engineering Gala Registration",
    "Dedan Kimathi University of Technology",
    "Slits and Suits Gala",
    "Engineering Awards Dinner",
  ],
  openGraph: {
    title: "DESA Annual Engineering Gala Seat Reservation 2026",
    description:
      "Reserve your table seat at the premier engineering celebration at Dedan Kimathi University of Technology. Live ticketing, awards ceremony, and fine dining.",
    type: "website",
    locale: "en_KE",
    siteName: "DESA - Dedan Kimathi University Engineering Students Association",
  },
};

export default function GalaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
