import React, { useState } from "react";
import { BookCard } from "./BookCard";

type BookStatus = "reading" | "finished" | "want_to_read" | "on_hold" | "dropped";

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

const SECTION_LABELS: Record<BookStatus, string> = {
  reading:      "Currently Reading",
  on_hold:      "On Hold",
  dropped:      "Dropped",
  want_to_read: "Want to Read",
  finished:     "Finished",
};

const SECTION_NOTES: Record<BookStatus, string> = {
  reading:      "currently in my main character era 📖",
  on_hold:      "it's not you, it's me. I'll be back (probably) 😅",
  dropped:      "Sad that I have to let you go, thank you for the knowledge 👋",
  want_to_read: "my ever-growing, slightly delusional TBR list 📚",
  finished:     "I did it! no harm celebrating small wins 🎉",
};

const EMPTY_STATES: Record<BookStatus, string> = {
  reading:      "No books in progress. Send a WhatsApp message to start tracking!",
  on_hold:      "No books on hold.",
  dropped:      "No dropped books.",
  want_to_read: "No books queued up yet.",
  finished:     "No finished books yet. Keep reading!",
};

const PAGE_SIZE = 6;

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  background: "none",
  border: "1px solid #D8D4CC",
  borderRadius: "3px",
  padding: "3px 10px",
  fontSize: "12px",
  color: disabled ? "#CCC" : "#555",
  cursor: disabled ? "default" : "pointer",
  fontFamily: "'Lato', sans-serif",
});

export function BookSection({ status, books, isFirst = false, isMobile = false }: { status: BookStatus; books: Book[]; isFirst?: boolean; isMobile?: boolean }) {
  const [page, setPage] = useState(0);
  const label = SECTION_LABELS[status];
  const twoColumn = !isMobile && (status === "reading" || status === "finished" || status === "on_hold" || status === "dropped");
  const totalPages = Math.ceil(books.length / PAGE_SIZE);
  const paged = books.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section style={{
      paddingTop: isFirst ? "0" : "20px",
      marginTop: isFirst ? "0" : "4px",
      borderTop: isFirst ? "none" : "1px solid #E4E0D8",
      marginBottom: "4px",
    }}>
      {/* Section heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#767676", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {label}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#B5705A", fontStyle: "italic", fontFamily: "'Merriweather', serif", fontWeight: 400, lineHeight: 1.4 }}>
            {SECTION_NOTES[status]}
          </p>
        </div>
        <span style={{ fontSize: "11px", color: "#999", flexShrink: 0, marginLeft: "12px", marginTop: "2px" }}>
          {books.length} book{books.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {books.length === 0 && (
        <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#AAAAAA", fontStyle: "italic" }}>
          {EMPTY_STATES[status]}
        </p>
      )}

      {/* 2-column grid */}
      {books.length > 0 && twoColumn && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "24px", rowGap: "0" }}>
          {paged.map((book, i) => {
            const lastRowStart = 2 * Math.floor((paged.length - 1) / 2);
            return (
              <div key={book.id} style={{ borderBottom: i >= lastRowStart ? "none" : "1px solid #EBEBEB" }}>
                <BookCard book={book} isMobile={isMobile} />
              </div>
            );
          })}
        </div>
      )}

      {/* Single-column list */}
      {books.length > 0 && !twoColumn && (
        <div>
          {paged.map((book, i) => (
            <div key={book.id} style={{ borderBottom: i < paged.length - 1 ? "1px solid #EBEBEB" : "none" }}>
              <BookCard book={book} isMobile={isMobile} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
          <button style={btnStyle(page === 0)} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← prev</button>
          <span style={{ fontSize: "11px", color: "#999" }}>{page + 1} / {totalPages}</span>
          <button style={btnStyle(page >= totalPages - 1)} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>next →</button>
        </div>
      )}
    </section>
  );
}
