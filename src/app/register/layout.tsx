import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join DESA — Member Registration | DeKUT",
  description:
    "Register as an active DESA member. Open to all undergraduate engineering students at Dedan Kimathi University of Technology across every department and year.",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
