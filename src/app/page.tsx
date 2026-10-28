import React from "react";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import ThreePillars from "@/components/ThreePillars";
import LatestDispatches from "@/components/LatestDispatches";
import CommandCtaBanner from "@/components/CommandCtaBanner";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "DESA | Dedan Kimathi University Engineering Students Association — Nyeri, Kenya",
  description:
    "Official home of DESA at Dedan Kimathi University of Technology. Uniting Mechatronic, Mechanical, Electrical, Civil & Chemical engineering students.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DESA | Dedan Kimathi University Engineering Students Association",
    description:
      "Student engineering community at Dedan Kimathi University of Technology, Nyeri, Kenya. Technical articles, student blog, hackathons.",
    url: "https://esa-dekut.vercel.app",
    siteName: "DESA - DeKUT Engineering Students Association",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "https://esa-dekut.vercel.app/images/desa-logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Official Logo of DESA - DeKUT Engineering Students Association",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DESA | Dedan Kimathi University Engineering Students Association",
    description:
      "Official portal for student engineers at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya.",
    images: ["https://esa-dekut.vercel.app/images/desa-logo.jpg"],
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <>
      <Hero />
      <ThreePillars />
      <LatestDispatches posts={posts} />
      <CommandCtaBanner />
    </>
  );
}
