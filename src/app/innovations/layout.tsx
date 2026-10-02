import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Blog & Student Articles | DESA DeKUT",
  description:
    "Authentic engineering write-ups, technical analyses, and student articles authored by engineering students at Dedan Kimathi University of Technology, Nyeri, Kenya.",
  alternates: { canonical: "/innovations" },
  openGraph: {
    title: "Engineering Blog & Student Articles | DESA DeKUT",
    description:
      "Authentic engineering write-ups, technical analyses, and student articles authored by engineering students at Dedan Kimathi University of Technology, Nyeri, Kenya.",
    url: "https://esa-dekut.vercel.app/innovations",
    siteName: "DESA - DeKUT Engineering Students Association",
    type: "website",
  },
};

export default function InnovationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
