import React from "react";

type BookStatus = "reading" | "finished" | "want_to_read" | "on_hold";
interface Book { status: BookStatus; current_page: number; rating: number | null; }

const STATUS_LABELS: Record<BookStatus, string> = {
  reading: "Reading", finished: "Finished", want_to_read: "Want to Read", on_hold: "On Hold",
};
const STATUS_COLORS: Record<BookStatus, string> = {
  reading: "#C96442", finished: "#3D2B1F", want_to_read: "#D4A03A", on_hold: "#9BA5B0",
};

export function Sidebar({ books }: { books: Book[] }) {
  const total = books.length;
  const reading = books.filter((b) => b.status === "reading").length;
  const onHold = books.filter((b) => b.status === "on_hold").length;
  const finished = books.filter((b) => b.status === "finished").length;
  const wantToRead = books.filter((b) => b.status === "want_to_read").length;
  const totalPages = books.reduce((s, b) => s + (b.current_page ?? 0), 0);
  const ratings = books.filter((b) => b.rating != null).map((b) => b.rating as number);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, v) => a + v, 0) / ratings.length).toFixed(1) : null;

  const statusRows = [
    { key: "reading" as BookStatus, count: reading },
    { key: "on_hold" as BookStatus, count: onHold },
    { key: "finished" as BookStatus, count: finished },
    { key: "want_to_read" as BookStatus, count: wantToRead },
  ].filter((r) => r.count > 0);

  const card: React.CSSProperties = {
    backgroundColor: "#FFFFFF", border: "1px solid #D8D8D8",
    borderRadius: "4px", padding: "16px", marginBottom: "12px",
  };
  const label: React.CSSProperties = {
    fontSize: "11px", fontWeight: 700, color: "#767676",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px",
  };

  return (
    <aside style={{ width: "200px", flexShrink: 0, marginRight: "24px" }}>
      <div style={card}>
        <p style={label}>My Library</p>
        {[
          { l: "Total books", v: total },
          { l: "Pages read", v: totalPages.toLocaleString() },
          ...(avgRating ? [{ l: "Avg rating", v: `${avgRating} ★` }] : []),
        ].map(({ l, v }) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "#555" }}>{l}</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#1A1A1A" }}>{v}</span>
          </div>
        ))}
      </div>

      {statusRows.length > 0 && (
        <div style={card}>
          <p style={label}>By Status</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {statusRows.map(({ key, count }) => (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#333" }}>{STATUS_LABELS[key]}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{count}</span>
                </div>
                <div style={{ height: "4px", backgroundColor: "#EBEBEB", borderRadius: "2px" }}>
                  <div style={{ height: "100%", borderRadius: "2px", backgroundColor: STATUS_COLORS[key], width: `${Math.round((count / total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
