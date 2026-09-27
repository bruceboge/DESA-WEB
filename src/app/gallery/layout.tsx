import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus & Lab Photo Gallery | DESA DeKUT",
  description:
    "Browse photographs of DeKUT engineering labs, campus facilities, student project showcases, and DESA events at Dedan Kimathi University of Technology.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
