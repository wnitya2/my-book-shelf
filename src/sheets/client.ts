import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export const sheets = google.sheets({ version: "v4", auth: oauth2Client });
export const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
export const SHEET_NAME = "books";
