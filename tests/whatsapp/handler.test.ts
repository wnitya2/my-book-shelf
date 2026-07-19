import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { Book } from "../../src/sheets/books";

const mockBook: Book = {
  id: "1", title: "Jejak Langkah", author: "Pramoedya", cover_url: "",
  current_page: 100, total_pages: 400, status: "reading", rating: null,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
};

const mockSendMessage = mock(() => Promise.resolve());
const mockGetAllBooks = mock(() => Promise.resolve([mockBook]));
const mockUpdateBook = mock(() => Promise.resolve({ ...mockBook, current_page: 200 }));
const mockAppendBook = mock(() => Promise.resolve(mockBook));
const mockDeleteBook = mock(() => Promise.resolve(true));
const mockAppendReadingLog = mock(() => Promise.resolve({}));
const mockGetReadingLog = mock(() => Promise.resolve([]));
const mockAppendNote = mock(() => Promise.resolve({}));

mock.module("../../src/whatsapp/client", () => ({ sendMessage: mockSendMessage }));
mock.module("../../src/sheets/books", () => ({
  getAllBooks: mockGetAllBooks,
  updateBook: mockUpdateBook,
  appendBook: mockAppendBook,
  deleteBook: mockDeleteBook,
}));
mock.module("../../src/sheets/reading-log", () => ({
  appendReadingLog: mockAppendReadingLog,
  getReadingLog: mockGetReadingLog,
}));
mock.module("../../src/sheets/notes", () => ({ appendNote: mockAppendNote }));

const mockParseMessage = mock(() =>
  Promise.resolve({ action: "update_progress", book_title: "Jejak Langkah", fields: { current_page: 200 } })
);
mock.module("../../src/whatsapp/parser", () => ({ parseMessage: mockParseMessage }));

const { handleIncomingMessage } = await import("../../src/whatsapp/handler");

const makePayload = (text: string) => ({
  entry: [{ changes: [{ value: { messages: [{ from: "628129469200", type: "text", text: { body: text } }] } }] }],
});

beforeEach(() => {
  mockSendMessage.mockClear();
  mockUpdateBook.mockClear();
  mockAppendReadingLog.mockClear();
});

describe("handleIncomingMessage", () => {
  it("ignores payload with no message", async () => {
    await handleIncomingMessage({});
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("update_progress: updates book and appends reading log", async () => {
    await handleIncomingMessage(makePayload("Jejak Langkah page 200"));
    expect(mockUpdateBook).toHaveBeenCalledWith("1", { current_page: 200 });
    expect(mockAppendReadingLog).toHaveBeenCalled();
    expect(mockSendMessage).toHaveBeenCalledWith("628129469200", "Jejak Langkah → page 200 ✓");
  });

  it("replies book not found when no match", async () => {
    mockParseMessage.mockImplementationOnce(() =>
      Promise.resolve({ action: "update_progress", book_title: "Unknown Book", fields: { current_page: 50 } })
    );
    await handleIncomingMessage(makePayload("Unknown Book page 50"));
    expect(mockSendMessage).toHaveBeenCalledWith("628129469200", "Book not found. Check the title and try again.");
  });

  it("unknown action: replies with help message", async () => {
    mockParseMessage.mockImplementationOnce(() => Promise.resolve({ action: "unknown" }));
    await handleIncomingMessage(makePayload("random text"));
    expect(mockSendMessage).toHaveBeenCalledWith(
      "628129469200",
      `I didn't understand that. Try: "Jejak Langkah page 200"`
    );
  });
});
