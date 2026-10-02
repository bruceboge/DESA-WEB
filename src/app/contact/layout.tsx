import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support | DESA DeKUT",
  description:
    "Reach the DESA Secretariat. Submit official inquiries, member support requests, and leadership communications to the Engineering Students Association at Dedan Kimathi University of Technology, Nyeri.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact & Support | DESA DeKUT",
    description:
      "Reach the DESA Secretariat. Submit official inquiries, member support requests, and leadership communications to the Engineering Students Association at Dedan Kimathi University of Technology, Nyeri.",
    url: "https://esa-dekut.vercel.app/contact",
    siteName: "DESA - DeKUT Engineering Students Association",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
