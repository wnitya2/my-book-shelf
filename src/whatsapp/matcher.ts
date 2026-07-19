import type { Book } from "../sheets/books";

export function matchBook(title: string, books: Book[]): Book | null {
  const needle = title.toLowerCase().trim();
  if (!needle) return null;

  // exact match first
  const exact = books.find((b) => b.title.toLowerCase() === needle);
  if (exact) return exact;

  // substring match
  const partial = books.find(
    (b) => b.title.toLowerCase().includes(needle) || needle.includes(b.title.toLowerCase())
  );

  return partial ?? null;
}
