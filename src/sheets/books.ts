import { sheets, SPREADSHEET_ID, SHEET_NAME } from "./client";

export type BookStatus = "reading" | "finished" | "want_to_read" | "on_hold";

export interface Book {
  id: string;
  title: string;
  author: string;
  current_page: number;
  total_pages: number;
  status: BookStatus;
  date_started: string;
  date_last_read: string | null;
  date_finished: string | null;
  cover_url: string;
  rating: number | null;
}

const RANGE = `${SHEET_NAME}!A2:K`;

function rowToBook(row: string[]): Book {
  return {
    id: row[0],
    title: row[1],
    author: row[2],
    current_page: Number(row[3]),
    total_pages: Number(row[4]),
    status: row[5] as BookStatus,
    date_started: row[6],
    date_last_read: row[7] || null,
    date_finished: row[8] || null,
    cover_url: row[9] ?? "",
    rating: row[10] ? Number(row[10]) : null,
  };
}

function bookToRow(book: Book): (string | number | null)[] {
  return [
    book.id, book.title, book.author,
    book.current_page, book.total_pages, book.status,
    book.date_started, book.date_last_read, book.date_finished,
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

export async function appendBook(data: Omit<Book, "id" | "date_started" | "date_last_read" | "date_finished">): Promise<Book> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const book: Book = { id, ...data, date_started: now, date_last_read: null, date_finished: null };

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

export async function updateBook(id: string, updates: Partial<Omit<Book, "id" | "date_started">>): Promise<Book | null> {
  const rowIndex = await findRowIndex(id);
  if (rowIndex === -1) return null;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:K${rowIndex}`,
  });
  const existing = res.data.values?.[0];
  if (!existing) return null;

  const updated: Book = { ...rowToBook(existing), ...updates };

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:K${rowIndex}`,
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
