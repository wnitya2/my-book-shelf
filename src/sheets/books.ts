import { sheets, SPREADSHEET_ID, SHEET_NAME } from "./client";

export type BookStatus = "reading" | "finished" | "want_to_read";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  current_page: number;
  total_pages: number;
  status: BookStatus;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

const RANGE = `${SHEET_NAME}!A2:J`;

function rowToBook(row: string[]): Book {
  return {
    id: row[0],
    title: row[1],
    author: row[2],
    cover_url: row[3] ?? "",
    current_page: Number(row[4]),
    total_pages: Number(row[5]),
    status: row[6] as BookStatus,
    rating: row[7] ? Number(row[7]) : null,
    created_at: row[8],
    updated_at: row[9],
  };
}

function bookToRow(book: Book): (string | number | null)[] {
  return [
    book.id, book.title, book.author, book.cover_url,
    book.current_page, book.total_pages, book.status,
    book.rating, book.created_at, book.updated_at,
  ];
}

export async function getAllBooks(): Promise<Book[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });
  return (res.data.values ?? []).filter((r) => r[0]).map(rowToBook);
}

export async function appendBook(data: Omit<Book, "id" | "created_at" | "updated_at">): Promise<Book> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const book: Book = { id, ...data, created_at: now, updated_at: now };

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

  const updated: Book = { ...rowToBook(existing), ...updates, updated_at: new Date().toISOString() };

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
