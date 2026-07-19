import Anthropic from "@anthropic-ai/sdk";

export type ParsedAction =
  | "update_progress"
  | "update_status"
  | "update_book"
  | "set_rating"
  | "add_note"
  | "add_book"
  | "delete_book"
  | "get_status"
  | "list_books"
  | "reading_stats"
  | "unknown";

export interface ParsedIntent {
  action: ParsedAction;
  book_title?: string;
  fields?: {
    current_page?: number;
    total_pages?: number;
    author?: string;
    cover_url?: string;
    status?: "reading" | "finished" | "want_to_read" | "on_hold";
    rating?: number;
    note?: string;
    note_page?: number;
  };
}

const SYSTEM_PROMPT = `You are a parser for a personal book tracker app.
Parse the user's message and return a JSON object with the intent.

Supported actions:
- update_progress: user updates reading page (e.g. "Jejak Langkah page 200")
- update_status: user marks book as reading/finished/want_to_read/on_hold
- update_book: user updates book metadata (author, cover_url, total_pages)
- set_rating: user rates a book 1-5
- add_note: user saves a note/quote for a book
- add_book: user adds a new book
- delete_book: user deletes a book
- get_status: user asks about progress of a specific book
- list_books: user asks for list of books (by status)
- reading_stats: user asks for reading statistics
- unknown: message doesn't match any intent

Return ONLY valid JSON matching this schema:
{
  "action": "<action>",
  "book_title": "<title or null>",
  "fields": {
    "current_page": <number or null>,
    "total_pages": <number or null>,
    "author": "<string or null>",
    "cover_url": "<string or null>",
    "status": "<reading|finished|want_to_read|on_hold or null>",
    "rating": <1-5 or null>,
    "note": "<string or null>",
    "note_page": <number or null>
  }
}

User may write in Indonesian, English, or mixed. Be lenient.
Examples:
- "Jejak Langkah sudah sampai halaman 200" → update_progress, page 200
- "Laskar Pelangi sudah selesai dibaca" → update_status, finished
- "kasih bintang 4 untuk Bumi Manusia" → set_rating, rating 4
- "tambah buku Pulang karya Tere Liye, 400 halaman" → add_book
- "sampai mana aku baca Negeri 5 Menara?" → get_status
- "taruh on hold Jejak Langkah" → update_status, on_hold
- "Jejak Langkah ditunda dulu" → update_status, on_hold`;

export async function parseMessage(text: string, client?: Anthropic): Promise<ParsedIntent> {
  const c = client ?? new Anthropic();
  const message = await c.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  const content = message?.content[0];
  if (content.type !== "text") return { action: "unknown" };

  const raw = content.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    return JSON.parse(raw) as ParsedIntent;
  } catch {
    return { action: "unknown" };
  }
}
