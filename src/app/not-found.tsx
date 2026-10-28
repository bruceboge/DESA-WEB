import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-20">
      <div className="max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b87a14]">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-[#071325] sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-slate-600">
          This page may have moved, or the address may be incorrect.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-lg bg-[#071325] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#0a5c36]"
        >
          Return to DESA home
        </Link>
      </div>
    </section>
  );
}
