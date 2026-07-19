import { sheets, SPREADSHEET_ID, SHEET_NAME } from "./client";

export type BookStatus = "reading" | "finished" | "want_to_read";

export interface Book {
  id: string;
  title: string;
  author: string;
  current_page: number;
  total_pages: number;
  status: BookStatus;
  created_at: string;
  last_read: string | null;
  cover_url: string;
  rating: number | null;
}

const RANGE = `${SHEET_NAME}!A2:J`;

function rowToBook(row: string[]): Book {
  return {
    id: row[0],
    title: row[1],
    author: row[2],
    current_page: Number(row[3]),
    total_pages: Number(row[4]),
    status: row[5] as BookStatus,
    created_at: row[6],
    last_read: row[7] || null,
    cover_url: row[8] ?? "",
    rating: row[9] ? Number(row[9]) : null,
  };
}

function bookToRow(book: Book): (string | number | null)[] {
  return [
    book.id, book.title, book.author,
    book.current_page, book.total_pages, book.status,
    book.created_at, book.last_read,
    book.cover_url, book.rating,
  ];
}

export async function getAllBooks(): Promise<Book[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });
  return (res.data.values ?? []).filter((r) => r[0]).map(rowToBook);
}

export async function appendBook(data: Omit<Book, "id" | "created_at" | "last_read">): Promise<Book> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const book: Book = { id, ...data, created_at: now, last_read: null };

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [bookToRow(book)] },
  });

  return book;
}

async function findRowIndex(id: string): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:A`,
  });
  const rows = res.data.values ?? [];
  const idx = rows.findIndex((r) => r[0] === id);
  return idx === -1 ? -1 : idx + 2;
}

export async function updateBook(id: string, updates: Partial<Omit<Book, "id" | "created_at">>): Promise<Book | null> {
  const rowIndex = await findRowIndex(id);
  if (rowIndex === -1) return null;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:J${rowIndex}`,
  });
  const existing = res.data.values?.[0];
  if (!existing) return null;

  const updated: Book = { ...rowToBook(existing), ...updates };

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:J${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [bookToRow(updated)] },
  });

  return updated;
}

export async function deleteBook(id: string): Promise<boolean> {
  const rowIndex = await findRowIndex(id);
  if (rowIndex === -1) return false;

  const sheetRes = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = sheetRes.data.sheets?.find((s) => s.properties?.title === SHEET_NAME);
  const sheetId = sheet?.properties?.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: "ROWS", startIndex: rowIndex - 1, endIndex: rowIndex },
        },
      }],
    },
  });

  return true;
}
