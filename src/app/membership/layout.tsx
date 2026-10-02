import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Hub & Portal | DESA DeKUT",
  description:
    "Official DESA Membership Hub at Dedan Kimathi University of Technology. Check membership status, register as an engineering student, view dues info, and access member services.",
  alternates: { canonical: "/membership" },
  openGraph: {
    title: "Membership Hub & Portal | DESA DeKUT",
    description:
      "Official DESA Membership Hub at Dedan Kimathi University of Technology. Check membership status, register as an engineering student, view dues info, and access member services.",
    url: "https://esa-dekut.vercel.app/membership",
    siteName: "DESA - DeKUT Engineering Students Association",
    type: "website",
  },
};

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
