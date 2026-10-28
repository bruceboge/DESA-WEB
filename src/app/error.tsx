"use client";

export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6 py-20">
      <div className="max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b87a14]">
          Temporary problem
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-[#071325] sm:text-4xl">
          This page could not load
        </h1>
        <p className="mt-4 text-slate-600">
          The rest of the website may still be available. Please try again in a
          moment.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-8 rounded-lg bg-[#071325] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#0a5c36]"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
