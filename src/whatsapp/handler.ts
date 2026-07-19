import { parseMessage } from "./parser";
import { matchBook } from "./matcher";
import { sendMessage } from "./client";
import { getAllBooks, appendBook, updateBook, deleteBook } from "../sheets/books";
import { appendReadingLog, getReadingLog } from "../sheets/reading-log";
import { appendNote } from "../sheets/notes";

function extractMessageData(body: any): { from: string; text: string } | null {
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== "text") return null;
  return { from: message.from, text: message.text.body };
}

export async function handleIncomingMessage(body: any): Promise<void> {
  const data = extractMessageData(body);
  if (!data) return;

  const { from, text } = data;

  try {
    const intent = await parseMessage(text);
    const books = await getAllBooks();

    switch (intent.action) {
      case "update_progress": {
        const book = matchBook(intent.book_title ?? "", books);
        if (!book) { await sendMessage(from, "Book not found. Check the title and try again."); return; }
        const prevPage = book.current_page;
        const newPage = intent.fields?.current_page ?? prevPage;
        await updateBook(book.id, { current_page: newPage });
        await appendReadingLog({
          book_id: book.id,
          book_title: book.title,
          pages_read: Math.max(0, newPage - prevPage),
          current_page: newPage,
        });
        await sendMessage(from, `${book.title} → page ${newPage} ✓`);
        break;
      }

      case "update_status": {
        const book = matchBook(intent.book_title ?? "", books);
        if (!book) { await sendMessage(from, "Book not found. Check the title and try again."); return; }
        const status = intent.fields?.status ?? "reading";
        await updateBook(book.id, { status });
        await sendMessage(from, `${book.title} marked as ${status} ✓`);
        break;
      }

      case "update_book": {
        const book = matchBook(intent.book_title ?? "", books);
        if (!book) { await sendMessage(from, "Book not found. Check the title and try again."); return; }
        await updateBook(book.id, intent.fields ?? {});
        await sendMessage(from, `Updated: ${book.title} ✓`);
        break;
      }

      case "set_rating": {
        const book = matchBook(intent.book_title ?? "", books);
        if (!book) { await sendMessage(from, "Book not found. Check the title and try again."); return; }
        const rating = intent.fields?.rating ?? 0;
        await updateBook(book.id, { rating });
        await sendMessage(from, `Rated ${book.title} ${rating}/5 ✓`);
        break;
      }

      case "add_note": {
        const book = matchBook(intent.book_title ?? "", books);
        if (!book) { await sendMessage(from, "Book not found. Check the title and try again."); return; }
        await appendNote({
          book_id: book.id,
          book_title: book.title,
          note: intent.fields?.note ?? "",
          page: intent.fields?.note_page ?? null,
        });
        await sendMessage(from, `Note saved for ${book.title} ✓`);
        break;
      }

      case "add_book": {
        const book = await appendBook({
          title: intent.book_title ?? "Unknown",
          author: intent.fields?.author ?? "",
          cover_url: intent.fields?.cover_url ?? "",
          current_page: 0,
          total_pages: intent.fields?.total_pages ?? 0,
          status: "want_to_read",
          rating: null,
        });
        await sendMessage(from, `Added: ${book.title} ✓`);
        break;
      }

      case "delete_book": {
        const book = matchBook(intent.book_title ?? "", books);
        if (!book) { await sendMessage(from, "Book not found. Check the title and try again."); return; }
        await deleteBook(book.id);
        await sendMessage(from, `Deleted: ${book.title} ✓`);
        break;
      }

      case "get_status": {
        const book = matchBook(intent.book_title ?? "", books);
        if (!book) { await sendMessage(from, "Book not found. Check the title and try again."); return; }
        await sendMessage(from, `${book.title}: page ${book.current_page} of ${book.total_pages} (${book.status})`);
        break;
      }

      case "list_books": {
        const reading = books.filter((b) => b.status === "reading");
        const finished = books.filter((b) => b.status === "finished");
        const wantToRead = books.filter((b) => b.status === "want_to_read");
        const lines = [
          reading.length ? `📖 Reading:\n${reading.map((b) => `- ${b.title}`).join("\n")}` : null,
          finished.length ? `✅ Finished:\n${finished.map((b) => `- ${b.title}`).join("\n")}` : null,
          wantToRead.length ? `📚 Want to read:\n${wantToRead.map((b) => `- ${b.title}`).join("\n")}` : null,
        ].filter(Boolean);
        await sendMessage(from, lines.length ? lines.join("\n\n") : "No books found.");
        break;
      }

      case "reading_stats": {
        const log = await getReadingLog();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thisWeek = log.filter((e) => e.logged_at >= weekAgo);
        const totalPages = thisWeek.reduce((sum, e) => sum + e.pages_read, 0);
        const uniqueBooks = new Set(thisWeek.map((e) => e.book_id)).size;
        await sendMessage(from, `This week: ${totalPages} pages across ${uniqueBooks} book(s) ✓`);
        break;
      }

      default:
        await sendMessage(from, `I didn't understand that. Try: "Jejak Langkah page 200"`);
    }
  } catch (err) {
    console.error("Handler error:", err);
    await sendMessage(from, "Something went wrong. Please try again.");
  }
}
