"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#f7f9fc", color: "#14213d" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
          <section style={{ width: "100%", maxWidth: "520px", padding: "40px 28px", border: "1px solid #dbe4f0", borderRadius: "18px", background: "white", textAlign: "center" }}>
            <p style={{ color: "#2563eb", fontSize: "12px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>Something went wrong</p>
            <h1 style={{ margin: "12px 0 8px", fontSize: "28px" }}>We could not load ZoeLit</h1>
            <p style={{ margin: 0, color: "#5b6b82", lineHeight: 1.6 }}>Please try again in a moment.</p>
            <button type="button" onClick={() => reset()} style={{ marginTop: "24px", border: 0, borderRadius: "8px", padding: "11px 20px", background: "#2563eb", color: "white", fontWeight: 700, cursor: "pointer" }}>Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
