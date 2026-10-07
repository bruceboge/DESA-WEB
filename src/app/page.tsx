import React from "react";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import LivePulseTicker from "@/components/LivePulseTicker";
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

export default function HomePage() {
  const posts = getAllPosts();
  const upcomingEvents = posts.filter((p) => p.type === "event" && !p.isPast);
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  return (
    <>
      {/* 1. Hero with Dual Command Buttons (Explore Events & Check Membership) */}
      <Hero />

      {/* 2. Live Pulse Ticker: Next Event, Student Innovations Blog, Secretariat Notice */}
      <LivePulseTicker nextEvent={nextEvent} />

      {/* 3. Why DESA: The 3 Pillars (Innovate, Network, Lead) */}
      <ThreePillars />

      {/* 4. Latest Dispatches: 2 Newest Upcoming Events + 1 Concluded Recap */}
      <LatestDispatches posts={posts} />

      {/* 5. One Closing CTA Banner → /membership */}
      <CommandCtaBanner />
    </>
  );
}
