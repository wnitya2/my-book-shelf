import React from "react";
import { BookCard } from "./BookCard";

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

const SECTION_LABELS: Record<BookStatus, string> = {
  reading:      "Currently Reading",
  on_hold:      "On Hold",
  want_to_read: "Want to Read",
  finished:     "Finished",
};

const EMPTY_STATES: Record<BookStatus, string> = {
  reading:      "No books in progress. Send a WhatsApp message to start tracking!",
  on_hold:      "No books on hold.",
  want_to_read: "No books queued up yet.",
  finished:     "No finished books yet. Keep reading!",
};

export function BookSection({ status, books, isFirst = false }: { status: BookStatus; books: Book[]; isFirst?: boolean }) {
  const label = SECTION_LABELS[status];
  const twoColumn = status === "reading" || status === "finished" || status === "on_hold";

  return (
    <section style={{
      paddingTop: isFirst ? "0" : "20px",
      marginTop: isFirst ? "0" : "4px",
      borderTop: isFirst ? "none" : "1px solid #E4E0D8",
      marginBottom: "4px",
    }}>
      {/* Section heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
        <h2 style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#767676", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </h2>
        <span style={{ fontSize: "11px", color: "#999" }}>{books.length} book{books.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Empty state */}
      {books.length === 0 && (
        <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#AAAAAA", fontStyle: "italic" }}>
          {EMPTY_STATES[status]}
        </p>
      )}

      {/* 2-column grid for reading + finished */}
      {books.length > 0 && twoColumn && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "24px", rowGap: "4px" }}>
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Single-column list for want_to_read */}
      {books.length > 0 && !twoColumn && (
        <div>
          {books.map((book, i) => (
            <div key={book.id} style={{ borderBottom: i < books.length - 1 ? "1px solid #EBEBEB" : "none" }}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
