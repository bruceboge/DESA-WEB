"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { convertImageToWebP } from "@/lib/imageOptimization";

interface RichArticleEditorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function RichArticleEditor({
  value,
  onChange,
  required = true,
}: RichArticleEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting state
  const [fontFamily, setFontFamily] = useState<string>("DM Sans");
  const [fontSize, setFontSize] = useState<string>("16px");
  const [lineSpacing, setLineSpacing] = useState<string>("1.5");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left");

  // History stack for Undo / Redo
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals & Popovers
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Drag and drop image upload state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Update history on edit
  const updateContent = (newContent: string) => {
    onChange(newContent);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newContent]);
    setHistoryIndex((prev) => prev + 1);
  };

  // Sync external changes
  useEffect(() => {
    if (value !== history[historyIndex]) {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), value]);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [value]);

  // Statistics
  const stats = useMemo(() => {
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = value.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTime };
  }, [value]);

  // Helper to wrap or insert text around current selection in textarea
  const insertFormatting = (
    prefix: string,
    suffix: string = "",
    defaultText: string = ""
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || defaultText;

    const newContent =
      value.substring(0, start) +
      prefix +
      textToInsert +
      suffix +
      value.substring(end);

    updateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + textToInsert.length
      );
    }, 10);
  };

  // Line prefix helper (for headings, quotes, lists)
  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start of the current line
    const beforeCursor = value.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf("\n") + 1;

    // Find the end of the current line
    const afterCursor = value.substring(end);
    const nextNewline = afterCursor.indexOf("\n");
    const lineEnd = nextNewline === -1 ? value.length : end + nextNewline;

    const currentLine = value.substring(lineStart, lineEnd);
    // Remove existing heading/list prefixes if any
    const cleanLine = currentLine.replace(/^(#{1,6}\s+|>\s+|[-*]\s+|\d+\.\s+)/, "");
    const newLine = `${prefix}${cleanLine}`;

    const newContent =
      value.substring(0, lineStart) + newLine + value.substring(lineEnd);

    updateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPos = lineStart + newLine.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      onChange(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      onChange(history[newIdx]);
    }
  };

  // Indent / Outdent
  const handleIndent = () => {
    insertFormatting("  ", "");
  };

  const handleOutdent = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeCursor = value.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf("\n") + 1;
    const currentLine = value.substring(lineStart, end);

    if (currentLine.startsWith("  ")) {
      const newContent =
        value.substring(0, lineStart) +
        currentLine.substring(2) +
        value.substring(end);
      updateContent(newContent);
    }
  };

  // Image Upload & Insert (WebP + Blob)
  const processAndInsertImage = async (file: File) => {
    try {
      setIsUploadingImage(true);
      setUploadNotice("Compressing to WebP and uploading to Blob...");

      // 1. Client-side WebP compression
      const webpResult = await convertImageToWebP(file, {
        quality: 0.85,
        maxWidth: 1600,
      });

      // 2. Upload to Blob
      const bodyFormData = new FormData();
      bodyFormData.append("file", webpResult.file);

      const res = await fetch("/api/blob/upload", {
        method: "POST",
        body: bodyFormData,
      });

      const data = await res.json();
      const imageUrl = data.url || webpResult.previewUrl;
      const cleanName = file.name.replace(/\.[^/.]+$/, "");

      // 3. Insert into article at cursor
      const imageMarkdown = `\n\n![${cleanName}](${imageUrl})\n\n`;
      insertFormatting(imageMarkdown, "", "");

      setUploadNotice(null);
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadNotice("Could not upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        await processAndInsertImage(file);
      }
    }
  };

  // Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Z, Ctrl+Y)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        insertFormatting("**", "**", "bold text");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        insertFormatting("*", "*", "italic text");
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        insertFormatting("<u>", "</u>", "underlined text");
      } else if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        handleRedo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "z" || e.key === "Z")) {
      e.preventDefault();
      handleRedo();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        handleOutdent();
      } else {
        handleIndent();
      }
    }
  };

  // Dynamic font family style
  const fontStyle = useMemo(() => {
    switch (fontFamily) {
      case "Inter":
        return "font-sans";
      case "Roboto":
        return "font-sans";
      case "Outfit":
        return "font-sans";
      case "Monospace":
        return "font-mono";
      case "DM Sans":
      default:
        return "font-sans";
    }
  }, [fontFamily]);

  return (
    <div className="space-y-2">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR: Title & Real-time Live Stats Pill
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Full Content <span className="text-red-500">*</span>
        </label>

        {/* Stats Badge matching user's reference */}
        <div className="flex items-center gap-3 bg-slate-100/90 border border-slate-200 px-3.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 shadow-2xs">
          <span>
            <strong className="text-slate-900">{stats.words}</strong> words
          </span>
          <span className="text-slate-300">•</span>
          <span>
            <strong className="text-slate-900">{stats.chars}</strong> chars
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">~{stats.readingTime} min read</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EDITOR BOX: Rounded Blue Frame with Full WYSIWYG Toolbar
         ───────────────────────────────────────────────────────────── */}
      <div
        className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-xs relative ${
          isDraggingOver
            ? "border-[#3b82f6] ring-4 ring-blue-100 bg-blue-50/20"
            : "border-[#3b82f6] focus-within:ring-4 focus-within:ring-blue-100/70"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hidden file input for Image button */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processAndInsertImage(file);
          }}
        />

        {/* Toolbar Header matching reference layout */}
        <div className="p-2 sm:p-2.5 bg-white border-b border-slate-200/90 flex flex-wrap items-center gap-1 sm:gap-1.5 select-none text-slate-700">
          {/* Group 1: Undo / Redo */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer text-slate-600 hover:text-slate-900"
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer text-slate-600 hover:text-slate-900"
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
              </svg>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Group 2: Format Style Dropdown (Paragraph, H1, H2, H3, Quote, Code) */}
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === "h1") applyLinePrefix("# ");
              else if (val === "h2") applyLinePrefix("## ");
              else if (val === "h3") applyLinePrefix("### ");
              else if (val === "quote") applyLinePrefix("> ");
              else if (val === "code") insertFormatting("```\n", "\n```\n", "code block");
              else applyLinePrefix("");
            }}
            defaultValue="p"
            className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="quote">Quote Block</option>
            <option value="code">Code Block</option>
          </select>

          {/* Group 3: Font Family Dropdown */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="text-xs font-medium bg-blue-50/50 border border-blue-200 text-blue-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="DM Sans">DM Sans</option>
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Outfit">Outfit</option>
            <option value="Monospace">Monospace</option>
          </select>

          {/* Group 4: Font Size Dropdown */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
          </select>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Group 5: Basic Formatting (B, I, U, S, A, H) */}
          <button
            type="button"
            onClick={() => insertFormatting("**", "**", "bold text")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 font-bold text-xs text-slate-800 transition-colors cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("*", "*", "italic text")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 italic text-xs font-serif text-slate-800 transition-colors cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("<u>", "</u>", "underlined text")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 underline text-xs font-medium text-slate-800 transition-colors cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("~~", "~~", "strikethrough text")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 line-through text-xs text-slate-800 transition-colors cursor-pointer"
            title="Strikethrough"
          >
            S
          </button>

          {/* Color Picker Popover Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xs font-bold text-[#e5a93c] transition-colors cursor-pointer"
              title="Text Color"
            >
              <span className="border-b-2 border-[#e5a93c]">A</span>
            </button>
            {isColorPickerOpen && (
              <div className="absolute top-9 left-0 z-30 p-2 bg-white rounded-xl shadow-lg border border-slate-200 flex gap-1.5">
                {[
                  { name: "Navy", code: "#071325" },
                  { name: "Gold", code: "#b87a14" },
                  { name: "Emerald", code: "#0a5c36" },
                  { name: "Blue", code: "#2563eb" },
                  { name: "Red", code: "#dc2626" },
                ].map((color) => (
                  <button
                    key={color.code}
                    type="button"
                    onClick={() => {
                      insertFormatting(`<span style="color: ${color.code}">`, "</span>", "colored text");
                      setIsColorPickerOpen(false);
                    }}
                    className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: color.code }}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Marker Button */}
          <button
            type="button"
            onClick={() => insertFormatting("==", "==", "highlighted text")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            title="Highlight Text"
          >
            <span className="bg-amber-300 text-slate-900 px-1 rounded-sm leading-none">H</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Group 6: Lists (Bullet, Numbered) */}
          <button
            type="button"
            onClick={() => applyLinePrefix("- ")}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
            title="Bulleted List"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => applyLinePrefix("1. ")}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M4.5 4.5v3m0 0H3m1.5 0h1.5M3 13.5h3l-3 3h3m-3 4.5h3" />
            </svg>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Group 7: Alignments */}
          <button
            type="button"
            onClick={() => setTextAlign("left")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              textAlign === "left" ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-700"
            }`}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5m-10.5 5.25h16.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setTextAlign("center")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              textAlign === "center" ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-700"
            }`}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M6.75 12h10.5m-13.5 5.25h16.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setTextAlign("right")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              textAlign === "right" ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-700"
            }`}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M9.75 12h10.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setTextAlign("justify")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              textAlign === "justify" ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-700"
            }`}
            title="Justify"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Indent / Outdent */}
          <button
            type="button"
            onClick={handleOutdent}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
            title="Outdent (Shift+Tab)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M10.5 12h9.75m-9.75 5.25h9.75M3.75 9.75 6.75 12l-3 2.25" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleIndent}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
            title="Indent (Tab)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M10.5 12h9.75m-9.75 5.25h9.75M6.75 9.75 3.75 12l3 2.25" />
            </svg>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Group 8: Spacing Dropdown */}
          <select
            value={lineSpacing}
            onChange={(e) => setLineSpacing(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="1.0">1.0× spacing</option>
            <option value="1.2">1.2× spacing</option>
            <option value="1.5">1.5× spacing</option>
            <option value="2.0">2.0× spacing</option>
          </select>

          {/* Horizontal Rule */}
          <button
            type="button"
            onClick={() => insertFormatting("\n\n---\n\n", "", "")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Horizontal Divider"
          >
            —
          </button>

          {/* Hyperlink Button */}
          <button
            type="button"
            onClick={() => {
              const textarea = textareaRef.current;
              const selected = textarea
                ? value.substring(textarea.selectionStart, textarea.selectionEnd)
                : "";
              setLinkText(selected || "link text");
              setIsLinkModalOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
            title="Insert Link"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          </button>

          {/* Image Upload / Insert Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
            title="Insert / Upload Image"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>

          {/* Video / Embed Button */}
          <button
            type="button"
            onClick={() => setIsVideoModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
            title="Insert Video Embed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </button>

          {/* Code Block Button */}
          <button
            type="button"
            onClick={() => insertFormatting("```\n", "\n```\n", "console.log('code');")}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
            title="Insert Code Snippet"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </button>
        </div>

        {/* Upload in Progress Alert */}
        {isUploadingImage && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>{uploadNotice || "Processing image..."}</span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. WRITING SURFACE: Clean textarea with font & spacing styles
           ───────────────────────────────────────────────────────────── */}
        <div className="relative min-h-[360px] sm:min-h-[420px]">
          <textarea
            ref={textareaRef}
            required={required}
            value={value}
            onChange={(e) => updateContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your article here... Drag and drop images directly into the editor."
            style={{
              fontSize: fontSize,
              lineHeight: lineSpacing,
              textAlign: textAlign,
            }}
            className={`w-full min-h-[360px] sm:min-h-[420px] p-5 sm:p-7 text-slate-800 focus:outline-none resize-y bg-transparent ${fontStyle}`}
          />

          {/* Drag and Drop Active Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 bg-blue-50/90 backdrop-blur-xs border-2 border-dashed border-blue-500 rounded-xl flex flex-col items-center justify-center p-6 pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-sm font-bold text-blue-900">
                Drop image here to convert to WebP & insert
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Automatically optimized for fast loading
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. TIP FOOTER matching user reference exactly
         ───────────────────────────────────────────────────────────── */}
      <p className="text-xs text-slate-500 pt-0.5">
        Tip: Drag &amp; drop images directly into the editor. Use the toolbar to format, insert videos, and add hyperlinks.
      </p>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: Insert Hyperlink
         ───────────────────────────────────────────────────────────── */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#071325]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#071325]">Insert Hyperlink</h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Link Display Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Read EBK Standards"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Destination URL
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (linkUrl) {
                    insertFormatting(`[${linkText || "link"}](${linkUrl})`, "", "");
                  }
                  setIsLinkModalOpen(false);
                  setLinkUrl("");
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#071325] text-[#e5a93c] hover:bg-[#0c1a32] cursor-pointer"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: Insert Video Embed
         ───────────────────────────────────────────────────────────── */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#071325]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#071325]">Insert Video Embed</h3>
            <p className="text-xs text-slate-500">
              Paste a YouTube or video URL to embed directly into your article.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Video URL (YouTube or MP4)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (videoUrl) {
                    insertFormatting(`\n\n${videoUrl}\n\n`, "", "");
                  }
                  setIsVideoModalOpen(false);
                  setVideoUrl("");
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#071325] text-[#e5a93c] hover:bg-[#0c1a32] cursor-pointer"
              >
                Embed Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
