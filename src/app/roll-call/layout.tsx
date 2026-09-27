import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roll Call & Attendance | DESA DeKUT",
  description:
    "Submit and verify your DESA general meeting attendance. Confidential roll call portal for engineering students at Dedan Kimathi University of Technology.",
  alternates: { canonical: "/roll-call" },
};

export default function RollCallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
