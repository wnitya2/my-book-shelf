import { sheets, SPREADSHEET_ID } from "./client";

const SHEET_NAME = "notes";

export interface Note {
  id: string;
  book_id: string;
  book_title: string;
  note: string;
  page: number | null;
  created_at: string;
}

export async function appendNote(entry: Omit<Note, "id" | "created_at">): Promise<Note> {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const row: Note = { id, ...entry, created_at };

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[row.id, row.book_id, row.book_title, row.note, row.page ?? "", row.created_at]],
    },
  });

  return row;
}

export async function getNotesByBook(bookId: string): Promise<Note[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:F`,
  });

  return (res.data.values ?? [])
    .filter((r) => r[0] && r[1] === bookId)
    .map((row) => ({
      id: row[0],
      book_id: row[1],
      book_title: row[2],
      note: row[3],
      page: row[4] ? Number(row[4]) : null,
      created_at: row[5],
    }));
}
