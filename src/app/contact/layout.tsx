import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Secretariat | DESA DeKUT",
  description:
    "Reach the DESA Secretariat — email, phone, campus location, and office hours for the Engineering Students Association at Dedan Kimathi University of Technology, Nyeri.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
