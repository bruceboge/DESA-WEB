import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    const title = post ? post.title : "DESA Engineering Event";
    const eventType = post?.type === "event" ? "OFFICIAL DESA EVENT" : "DESA NEWS DISPATCH";
    const dateText = post?.eventDate || post?.date || "2026/2027";
    const locationText = post?.location || "DeKUT School of Engineering, Nyeri";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#071325",
            backgroundImage: "radial-gradient(circle at 25px 25px, #0e223f 2%, transparent 0%), radial-gradient(circle at 75px 75px, #0e223f 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            padding: "50px 60px",
            fontFamily: "sans-serif",
            color: "#ffffff",
            border: "8px solid #e5a93c",
          }}
        >
          {/* Top Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  backgroundColor: "#e5a93c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "24px",
                  color: "#071325",
                }}
              >
                DESA
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px", color: "#ffffff" }}>
                  DESA DeKUT
                </span>
                <span style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Engineering Students Association
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#e5a93c20",
                border: "1px solid #e5a93c60",
                padding: "8px 20px",
                borderRadius: "30px",
                color: "#e5a93c",
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {eventType}
            </div>
          </div>

          {/* Middle: Title */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "20px", marginBottom: "20px" }}>
            <h1
              style={{
                fontSize: "44px",
                fontWeight: "900",
                lineHeight: "1.2",
                color: "#ffffff",
                letterSpacing: "-0.5px",
                maxHeight: "190px",
                overflow: "hidden",
              }}
            >
              {title}
            </h1>
            {post?.excerpt && (
              <p
                style={{
                  fontSize: "20px",
                  color: "#cbd5e1",
                  marginTop: "12px",
                  lineHeight: "1.4",
                  maxHeight: "60px",
                  overflow: "hidden",
                }}
              >
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Bottom Footer Info Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "2px solid #1e293b",
              paddingTop: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: "#e5a93c", textTransform: "uppercase", fontWeight: "bold" }}>
                  Event Date
                </span>
                <span style={{ fontSize: "17px", fontWeight: "bold", color: "#f8fafc" }}>
                  {dateText}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: "#e5a93c", textTransform: "uppercase", fontWeight: "bold" }}>
                  Venue / Location
                </span>
                <span style={{ fontSize: "17px", fontWeight: "bold", color: "#f8fafc" }}>
                  {locationText}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", color: "#94a3b8", fontSize: "14px" }}>
              <span>esa-dekut.vercel.app</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    return new Response(`Failed to generate Open Graph image: ${error}`, { status: 500 });
  }
}
