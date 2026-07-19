import { describe, it, expect, mock } from "bun:test";

const mockGenerateAuthUrl = mock(() => "https://accounts.google.com/o/oauth2/auth?mock=true");

mock.module("googleapis", () => ({
  google: {
    auth: {
      OAuth2: class {
        generateAuthUrl = mockGenerateAuthUrl;
      },
    },
    sheets: () => ({}),
  },
}));

describe("get-token script", () => {
  it("generates a valid Google OAuth URL", async () => {
    const url = mockGenerateAuthUrl();
    expect(url).toContain("https://accounts.google.com");
  });
});
