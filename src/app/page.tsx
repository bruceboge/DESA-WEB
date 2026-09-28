import React from "react";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import FocusAreas from "@/components/FocusAreas";
import GallerySection from "@/components/GallerySection";
import CallForMembers from "@/components/CallForMembers";

export const metadata: Metadata = {
  title: "DESA | DeKUT Engineering Students Association — Nyeri, Kenya",
  description:
    "Official home of DESA at Dedan Kimathi University of Technology. Uniting Mechatronic, Mechanical, Electrical, Civil & Chemical engineering students through projects, hackathons, and industry partnerships.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DESA | DeKUT Engineering Students Association",
    description:
      "Student engineering community at Dedan Kimathi University of Technology, Nyeri, Kenya. Projects, hackathons, academic resources & industry links.",
    url: "https://esa-dekut.vercel.app",
    siteName: "DESA - DeKUT Engineering Students Association",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/images/desa-logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Official Logo of DESA - DeKUT Engineering Students Association",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "DESA | DeKUT Engineering Students Association",
    description:
      "Official portal for student engineers at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya.",
    images: ["/images/desa-logo.jpg"],
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section introducing DESA & DeKUT School of Engineering */}
      <Hero />

      {/* Association Overview & Faculty Patronage */}
      <AboutSection />

      {/* Objectives of the Association */}
      <FocusAreas />

      {/* Laboratory & Campus Archives Teaser */}
      <GallerySection />

      {/* Call for Members Registration Section */}
      <CallForMembers />
    </>
  );
}
