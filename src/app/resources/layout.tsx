import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Vault & Resources | DESA DeKUT",
  description:
    "Download study guides, lab manuals, course syllabi, and industrial attachment guidelines curated by DESA for DeKUT engineering students across all departments.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
