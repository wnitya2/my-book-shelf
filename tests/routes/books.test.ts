import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { Book } from "../../src/sheets/books";

const mockBook: Book = {
  id: "test-id-1",
  title: "The Pragmatic Programmer",
  author: "David Thomas",
  current_page: 50,
  total_pages: 352,
  status: "reading",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const mockGetAllBooks = mock(() => Promise.resolve([mockBook]));
const mockAppendBook = mock(() => Promise.resolve(mockBook));
const mockUpdateBook = mock((id: string) =>
  id === mockBook.id ? Promise.resolve({ ...mockBook, current_page: 100 }) : Promise.resolve(null)
);
const mockDeleteBook = mock((id: string) => Promise.resolve(id === mockBook.id));

mock.module("../../src/sheets/books", () => ({
  getAllBooks: mockGetAllBooks,
  appendBook: mockAppendBook,
  updateBook: mockUpdateBook,
  deleteBook: mockDeleteBook,
}));

const { booksRoute } = await import("../../src/routes/books");
const { Elysia } = await import("elysia");
const app = new Elysia().use(booksRoute);

describe("GET /books", () => {
  it("returns an array of books", async () => {
    const res = await app.handle(new Request("http://localhost/books"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].title).toBe(mockBook.title);
  });
});

describe("POST /books", () => {
  it("creates a new book and returns it", async () => {
    const res = await app.handle(
      new Request("http://localhost/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: mockBook.title,
          author: mockBook.author,
          current_page: mockBook.current_page,
          total_pages: mockBook.total_pages,
          status: mockBook.status,
        }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.title).toBe(mockBook.title);
  });
});

describe("PATCH /books/:id", () => {
  it("updates an existing book", async () => {
    const res = await app.handle(
      new Request(`http://localhost/books/${mockBook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_page: 100 }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.current_page).toBe(100);
  });

  it("returns not found for unknown id", async () => {
    const res = await app.handle(
      new Request("http://localhost/books/unknown-id", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_page: 100 }),
      })
    );
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

describe("DELETE /books/:id", () => {
  it("deletes an existing book", async () => {
    const res = await app.handle(
      new Request(`http://localhost/books/${mockBook.id}`, {
        method: "DELETE",
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("returns not found for unknown id", async () => {
    const res = await app.handle(
      new Request("http://localhost/books/unknown-id", {
        method: "DELETE",
      })
    );
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
