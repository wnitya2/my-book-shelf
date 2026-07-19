import React from "react";

type BookStatus = "reading" | "finished" | "want_to_read";

interface Book { status: BookStatus; }

export function StatusSection({ books }: { books: Book[] }) {
  const reading = books.filter((b) => b.status === "reading").length;
  const finished = books.filter((b) => b.status === "finished").length;
  const wantToRead = books.filter((b) => b.status === "want_to_read").length;

  const metrics = [
    { icon: "📖", label: "Reading", count: reading },
    { icon: "✓",  label: "Finished", count: finished },
    { icon: "📚", label: "Want to Read", count: wantToRead },
  ].filter((m) => m.count > 0);

  if (metrics.length === 0) return null;

  return (
    <section>
      <h2 style={{ fontFamily: "'Merriweather', serif", fontSize: "22px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 16px" }}>
        by status
      </h2>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {metrics.map(({ icon, label, count }) => (
          <div key={label} style={{
            flex: "1 1 140px",
            backgroundColor: "#F7F5F0",
            border: "1px solid #E8E4DC",
            borderRadius: "8px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}>
            <span style={{ fontSize: "22px" }}>{icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
              <p style={{ margin: "2px 0 0", fontSize: "28px", fontWeight: 700, color: "#1A1A1A", lineHeight: 1, fontFamily: "'Merriweather', serif" }}>{count}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
