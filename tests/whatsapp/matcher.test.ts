import { describe, it, expect } from "bun:test";
import { matchBook } from "../../src/whatsapp/matcher";
import type { Book } from "../../src/sheets/books";

const books: Book[] = [
  {
    id: "1", title: "Jejak Langkah", author: "Pramoedya", cover_url: "",
    current_page: 100, total_pages: 400, status: "reading", rating: null,
    created_at: "", updated_at: "",
  },
  {
    id: "2", title: "Laskar Pelangi", author: "Andrea Hirata", cover_url: "",
    current_page: 200, total_pages: 529, status: "reading", rating: null,
    created_at: "", updated_at: "",
  },
];

describe("matchBook", () => {
  it("matches exact title (case-insensitive)", () => {
    expect(matchBook("jejak langkah", books)?.id).toBe("1");
    expect(matchBook("Jejak Langkah", books)?.id).toBe("1");
  });

  it("matches partial title", () => {
    expect(matchBook("jejak", books)?.id).toBe("1");
    expect(matchBook("pelangi", books)?.id).toBe("2");
  });

  it("returns null when no match", () => {
    expect(matchBook("Bumi Manusia", books)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(matchBook("", books)).toBeNull();
  });
});
