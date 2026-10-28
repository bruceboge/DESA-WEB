import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration | ESA ",
  description: "Official administrative studio for DESA DeKUT Executive Secretariat.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
