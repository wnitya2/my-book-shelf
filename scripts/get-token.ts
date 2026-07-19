import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/spreadsheets"],
  prompt: "consent",
});

console.log("1. Open this URL in your browser:");
console.log(authUrl);
console.log("\n2. Sign in with the Google account that owns the spreadsheet");
console.log("3. After redirect, copy the refresh_token from the /auth/callback response");
console.log("4. Paste it into .env as GOOGLE_REFRESH_TOKEN");
