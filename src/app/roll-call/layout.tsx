import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roll Call & Session Check-In | DESA DeKUT",
  description:
    "Official session check-in and attendance verification for DESA meetings, assemblies, and technical workshops at Dedan Kimathi University of Technology.",
  alternates: { canonical: "/roll-call" },
  openGraph: {
    title: "Roll Call & Session Check-In | DESA DeKUT",
    description:
      "Official session check-in and attendance verification for DESA meetings, assemblies, and technical workshops at Dedan Kimathi University of Technology.",
    url: "https://esa-dekut.vercel.app/roll-call",
    siteName: "DESA - DeKUT Engineering Students Association",
    type: "website",
  },
};

export default function RollCallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
