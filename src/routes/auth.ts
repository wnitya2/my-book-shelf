import { Elysia } from "elysia";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const authRoute = new Elysia({ prefix: "/auth" })
  .get("/callback", async ({ query }) => {
    const { code } = query as { code: string };
    if (!code) return { error: "No code provided" };

    const { tokens } = await oauth2Client.getToken(code);

    return {
      message: "Copy the refresh_token to your .env as GOOGLE_REFRESH_TOKEN",
      refresh_token: tokens.refresh_token,
    };
  });
