import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Highlights & Photo Gallery | DESA DeKUT",
  description:
    "Explore photos and highlights from DESA events at Dedan Kimathi University of Technology, including the Annual Masquerade Gala Dinner, Game Nights, technical mentorship sessions, and campus life.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Event Highlights & Photo Gallery | DESA DeKUT",
    description:
      "Explore photos and highlights from DESA events at Dedan Kimathi University of Technology, including the Annual Masquerade Gala Dinner, Game Nights, technical mentorship sessions, and campus life.",
    url: "https://esa-dekut.vercel.app/gallery",
    siteName: "DESA - DeKUT Engineering Students Association",
    type: "website",
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
