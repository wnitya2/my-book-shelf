import { describe, it, expect, mock } from "bun:test";

const mockGetToken = mock(() =>
  Promise.resolve({ tokens: { refresh_token: "mock-refresh-token" } })
);

mock.module("googleapis", () => ({
  google: {
    auth: {
      OAuth2: class {
        generateAuthUrl() {
          return "https://accounts.google.com/o/oauth2/auth?mock=true";
        }
        getToken = mockGetToken;
      },
    },
    sheets: () => ({}),
  },
}));

const { authRoute } = await import("../../src/routes/auth");
const { Elysia } = await import("elysia");
const app = new Elysia().use(authRoute);

describe("GET /auth/callback", () => {
  it("returns error when no code is provided", async () => {
    const res = await app.handle(new Request("http://localhost/auth/callback"));
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("exchanges code for refresh token", async () => {
    const res = await app.handle(
      new Request("http://localhost/auth/callback?code=valid-auth-code")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.refresh_token).toBe("mock-refresh-token");
  });
});
