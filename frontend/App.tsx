import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookSection } from "./components/BookSection";
import { Sidebar } from "./components/Sidebar";

type BookStatus = "reading" | "finished" | "want_to_read" | "on_hold" | "dropped";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  current_page: number;
  total_pages: number;
  status: BookStatus;
  rating: number | null;
  date_started: string;
  date_last_read: string | null;
  date_finished: string | null;
}

function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch("/books")
      .then((r) => r.json())
      .then((data) => { setBooks(data); setLoading(false); })
      .catch(() => { setError("Failed to load books."); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F1EA", fontFamily: "'Lato', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: isMobile ? "16px 16px" : "20px 32px", borderBottom: "1px solid #D8D4CC" }}>
        <h1 style={{ fontFamily: "'Merriweather', serif", fontSize: "24px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px" }}>
          My Book Shelf
        </h1>
        <p style={{ fontFamily: "'Merriweather', serif", fontStyle: "italic", fontSize: "13px", color: "#999", margin: 0 }}>
          "A library is a hospital for the mind."
        </p>
      </header>

      {/* Body: sidebar + main */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", padding: isMobile ? "16px 12px" : "24px 32px", alignItems: "flex-start" }}>
        {/* Sidebar */}
        {!loading && !error && <Sidebar books={books} isMobile={isMobile} />}

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, width: isMobile ? "100%" : undefined }}>
          {loading && <p style={{ color: "#888", fontSize: "14px" }}>Loading your shelf…</p>}
          {error && <p style={{ color: "#888", fontSize: "14px" }}>{error}</p>}

          {!loading && !error && (() => {
            const byLastRead = (a: Book, b: Book) =>
              (b.date_last_read ?? "").localeCompare(a.date_last_read ?? "");
            const byFinished = (a: Book, b: Book) =>
              (b.date_finished ?? "").localeCompare(a.date_finished ?? "");

            return (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D8D8", borderRadius: "4px", padding: isMobile ? "16px" : "20px 24px" }}>
                <BookSection status="reading"      books={books.filter((b) => b.status === "reading").sort(byLastRead)}      isFirst isMobile={isMobile} />
                <BookSection status="on_hold"      books={books.filter((b) => b.status === "on_hold").sort(byLastRead)} isMobile={isMobile} />
                <BookSection status="finished"     books={books.filter((b) => b.status === "finished").sort(byFinished)} isMobile={isMobile} />
                <BookSection status="dropped"      books={books.filter((b) => b.status === "dropped").sort(byLastRead)} isMobile={isMobile} />
                <BookSection status="want_to_read" books={books.filter((b) => b.status === "want_to_read").sort(byLastRead)} isMobile={isMobile} />
              </div>
            );
          })()}
        </main>
      </div>
      {/* Footer */}
      <footer style={{ padding: isMobile ? "20px 16px" : "24px 32px", borderTop: "1px solid #D8D4CC", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#AAAAAA", fontFamily: "'Lato', sans-serif" }}>
          © 2026 Nitya Wijayanti &nbsp;·&nbsp; made with <span style={{ color: "#E53935" }}>♥</span> & a slightly awkward robot 🤖
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#C8C4BC", fontFamily: "'Merriweather', serif", fontStyle: "italic" }}>
          vibe-coded with Claude, in stolen moments between playtime chaos with my daughters 🧸
        </p>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
