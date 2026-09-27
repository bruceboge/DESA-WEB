import React from "react";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import FocusAreas from "@/components/FocusAreas";
import GallerySection from "@/components/GallerySection";
import CallForMembers from "@/components/CallForMembers";

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
