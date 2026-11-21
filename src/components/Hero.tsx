import React from "react";
import Image from "next/image";
import Link from "next/link";
import campusImage from "../../public/images/dekut-campus.webp";
import { ArrowRightIcon } from "./Icons";

export default function Hero() {
  return (
    <section id="hero" className="relative flex flex-col justify-between overflow-hidden bg-[#071325] text-white lg:min-h-[700px]">
      <div className="absolute inset-0 z-0 bg-[#071325]">
        <Image
          src={campusImage}
          alt="Dedan Kimathi University of Technology (DeKUT) Main Campus Aerial View"
          fill
          sizes="100vw"
          priority
          placeholder="blur"
          className="scale-105 object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-[#071325]/75"></div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-6 pt-6 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-3 sm:col-span-10 sm:col-start-2 sm:space-y-6">
            <div className="inline-flex items-center border-2 border-[#071325] bg-[#e5a93c] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#071325]">
              Official Students Body
            </div>

            <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Inspiring Engineering Minds.
              <span className="block text-[#e5a93c]">Shaping Kenya&apos;s Future.</span>
            </h1>

            <p className="text-base leading-relaxed text-slate-200 sm:max-w-4xl sm:text-lg">
              Welcome to the official page of the{" "}
              <strong className="font-semibold text-white">DeKUT Engineering Students Association (DESA)</strong>{" "}
              at{" "}
              <strong className="font-semibold text-white">Dedan Kimathi University of Technology (DeKUT)</strong>.
              {" "}We bring together student engineers across Mechatronics, Mechanical, Electrical, Civil, and Chemical disciplines.
            </p>

            <div className="grid grid-cols-2 items-stretch gap-3 pt-1 sm:flex sm:items-center sm:gap-4 sm:pt-2">
              <Link
                href="/membership#register"
                className="flex min-h-12 items-center justify-center gap-2 border-2 border-[#071325] bg-[#e5a93c] px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wide text-[#071325] shadow-[4px_4px_0_0_#e5a93c] transition-colors hover:bg-white sm:px-6 sm:text-sm"
              >
                Join DESA
              </Link>

              <Link
                href="/news-events"
                className="flex min-h-12 items-center justify-center gap-1.5 border-2 border-white/80 bg-[#071325]/35 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-white transition-colors hover:border-[#e5a93c] hover:text-[#e5a93c] sm:gap-2 sm:px-6 sm:text-sm"
              >
                Explore Events
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            </div>

            <div className="hidden border-t border-[#e5a93c]/70 pt-5 text-xs text-slate-200 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-2">
              <span>Official Student Body</span>
              <span>Engineering Centered</span>
              <span>Innovation &amp; Tech Hub</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
