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
  updated_at: string;
}

const COLUMNS = ["id", "title", "author", "current_page", "total_pages", "status", "created_at", "updated_at"];
const RANGE = `${SHEET_NAME}!A2:H`;

function rowToBook(row: string[]): Book {
  return {
    id: row[0],
    title: row[1],
    author: row[2],
    current_page: Number(row[3]),
    total_pages: Number(row[4]),
    status: row[5] as BookStatus,
    created_at: row[6],
    updated_at: row[7],
  };
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
  const row = [id, data.title, data.author, data.current_page, data.total_pages, data.status, now, now];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  return rowToBook(row.map(String));
}

async function findRowIndex(id: string): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:A`,
  });
  const rows = res.data.values ?? [];
  const idx = rows.findIndex((r) => r[0] === id);
  return idx === -1 ? -1 : idx + 2; // 1-indexed, offset by header row
}

export async function updateBook(id: string, updates: Partial<Omit<Book, "id" | "created_at">>): Promise<Book | null> {
  const rowIndex = await findRowIndex(id);
  if (rowIndex === -1) return null;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:H${rowIndex}`,
  });
  const existing = res.data.values?.[0];
  if (!existing) return null;

  const updated = rowToBook(existing);
  Object.assign(updated, updates, { updated_at: new Date().toISOString() });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:H${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[updated.id, updated.title, updated.author, updated.current_page, updated.total_pages, updated.status, updated.created_at, updated.updated_at]],
    },
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
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }],
    },
  });

  return true;
}
