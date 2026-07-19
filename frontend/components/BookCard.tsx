import React from "react";

type BookStatus = "reading" | "finished" | "want_to_read" | "on_hold";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  current_page: number;
  total_pages: number;
  status: BookStatus;
  rating: number | null;
  date_finished: string | null;
  date_last_read: string | null;
}

const COVER_COLORS = [
  "#7BC4B2", "#6B5CA5", "#89A7CC", "#C96442", "#D4A03A",
  "#2D3A5C", "#A0614B", "#B5708A", "#4A4A4A", "#5B8A5B",
];

function coverColor(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) & 0xffffff;
  return COVER_COLORS[Math.abs(h) % COVER_COLORS.length];
}

export function BookCard({ book }: { book: Book }) {
  const pct = book.total_pages > 0
    ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100))
    : 0;
  const bg = coverColor(book.title);

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0" }}>
      {/* Thumbnail cover */}
      <div style={{ width: "52px", height: "76px", flexShrink: 0, borderRadius: "3px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "6px" }}>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "9px", fontWeight: 600, textAlign: "center", lineHeight: "1.3", fontFamily: "'Merriweather', serif" }}>
              {book.title}
            </span>
          </div>
        )}
      </div>

      {/* Book info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1A1A1A", lineHeight: "1.3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={book.title}>
          {book.title}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#767676" }}>by {book.author}</p>

        {/* Progress bar + stats for reading / on_hold */}
        {(book.status === "reading" || book.status === "on_hold") && book.total_pages > 0 && (
          <>
            <div style={{ marginTop: "8px", height: "4px", backgroundColor: "#EBEBEB", borderRadius: "2px", maxWidth: "220px" }}>
              <div style={{ height: "100%", width: `${pct}%`, backgroundColor: book.status === "on_hold" ? "#9BA5B0" : "#409080", borderRadius: "2px" }} />
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#767676" }}>
              {pct}% — p. {book.current_page} of {book.total_pages}
            </p>
            {book.date_last_read && (
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#AAAAAA" }}>
                Last read {new Date(book.date_last_read).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </>
        )}

        {/* Rating + date for finished */}
        {book.status === "finished" && (
          <div style={{ marginTop: "4px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {book.rating && (
              <span style={{ fontSize: "12px", color: "#D4A03A" }}>{"★".repeat(book.rating)}{"☆".repeat(5 - book.rating)}</span>
            )}
            {book.date_finished && (
              <span style={{ fontSize: "12px", color: "#767676" }}>
                Finished {new Date(book.date_finished).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
