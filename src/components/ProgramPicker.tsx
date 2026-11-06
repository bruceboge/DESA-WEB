"use client";

import { useEffect, useMemo, useState } from "react";

interface ProgramPickerProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  required?: boolean;
}

export default function ProgramPicker({ label, value, options, onChange, required = false }: ProgramPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredOptions = useMemo(
    () => options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const choose = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="flex min-h-12 w-full items-center justify-between gap-3 border border-slate-300 bg-slate-50 px-3.5 py-3 text-left text-sm text-[#071325] transition-colors hover:border-[#071325] focus:outline-none focus:ring-2 focus:ring-[#071325]"
      >
        <span className="min-w-0 truncate">{value || "Choose your engineering program"}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-slate-500"><path fillRule="evenodd" d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#071325]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-label={label} className="max-h-[88dvh] w-full overflow-hidden border-t-2 border-[#071325] bg-white shadow-[0_-6px_0_0_#071325] sm:max-w-xl sm:border-2 sm:shadow-[6px_6px_0_0_#071325]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Select one option</p>
                <h2 className="mt-1 text-base font-extrabold text-[#071325]">{label}</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close program picker" className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 text-xl text-[#071325] hover:bg-slate-100">×</button>
            </div>
            <div className="border-b border-slate-200 p-4 sm:px-5">
              <label className="sr-only" htmlFor="program-picker-search">Search programs</label>
              <input id="program-picker-search" autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search engineering programs" className="min-h-12 w-full border border-slate-300 bg-slate-50 px-3.5 text-base text-[#071325] outline-none focus:border-[#071325] focus:ring-2 focus:ring-[#071325]" />
            </div>
            <div className="max-h-[55dvh] overflow-y-auto overscroll-contain p-2 sm:p-3">
              {filteredOptions.length ? filteredOptions.map((option) => {
                const selected = option === value;
                return <button key={option} type="button" onClick={() => choose(option)} aria-pressed={selected} className={`flex min-h-12 w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-semibold transition-colors ${selected ? "bg-[#071325] text-white" : "text-slate-800 hover:bg-slate-100"}`}><span>{option}</span>{selected && <span aria-hidden="true" className="text-[#e5a93c]">✓</span>}</button>;
              }) : <p className="px-4 py-10 text-center text-sm text-slate-500">No programs match “{query}”.</p>}
            </div>
            {required && <p className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:px-5">A program is required to complete registration.</p>}
          </section>
        </div>
      )}
    </>
  );
}
