import { sheets, SPREADSHEET_ID } from "./client";

const SHEET_NAME = "reading_log";

export interface ReadingLogEntry {
  id: string;
  book_id: string;
  book_title: string;
  pages_read: number;
  current_page: number;
  logged_at: string;
}

export async function appendReadingLog(entry: Omit<ReadingLogEntry, "id" | "logged_at">): Promise<ReadingLogEntry> {
  const id = crypto.randomUUID();
  const logged_at = new Date().toISOString();
  const row: ReadingLogEntry = { id, ...entry, logged_at };

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[row.id, row.book_id, row.book_title, row.pages_read, row.current_page, row.logged_at]],
    },
  });

  return row;
}

export async function getReadingLog(): Promise<ReadingLogEntry[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:F`,
  });

  return (res.data.values ?? []).filter((r) => r[0]).map((row) => ({
    id: row[0],
    book_id: row[1],
    book_title: row[2],
    pages_read: Number(row[3]),
    current_page: Number(row[4]),
    logged_at: row[5],
  }));
}
