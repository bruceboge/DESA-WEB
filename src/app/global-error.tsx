"use client";

export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          alignItems: "center",
          background: "#f8fafc",
          color: "#071325",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "560px" }}>
          <p style={{ color: "#b87a14", fontWeight: 700, letterSpacing: "0.15em" }}>
            TEMPORARY PROBLEM
          </p>
          <h1 style={{ fontSize: "2.25rem" }}>DESA could not load this page</h1>
          <p style={{ color: "#475569", lineHeight: 1.6 }}>
            Please try again. If the problem continues, come back later.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: "#071325",
              border: 0,
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              marginTop: "12px",
              padding: "12px 20px",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
