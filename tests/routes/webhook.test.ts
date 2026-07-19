import { describe, it, expect, beforeAll } from "bun:test";
import { Elysia } from "elysia";
import { webhookRoute } from "../../src/routes/webhook";

const VERIFY_TOKEN = "test-verify-token";

beforeAll(() => {
  process.env.WHATSAPP_VERIFY_TOKEN = VERIFY_TOKEN;
});

const app = new Elysia().use(webhookRoute);

describe("GET /webhook", () => {
  it("returns challenge when verify token is correct", async () => {
    const res = await app.handle(
      new Request(
        `http://localhost/webhook?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=123456`
      )
    );
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe("123456");
  });

  it("returns 403 when verify token is wrong", async () => {
    const res = await app.handle(
      new Request(
        "http://localhost/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=123456"
      )
    );
    expect(res.status).toBe(403);
  });

  it("returns 403 when mode is not subscribe", async () => {
    const res = await app.handle(
      new Request(
        `http://localhost/webhook?hub.mode=unsubscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=123456`
      )
    );
    expect(res.status).toBe(403);
  });
});

describe("POST /webhook", () => {
  it("receives WhatsApp payload and returns ok", async () => {
    const payload = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: "628129469200",
              type: "text",
              text: { body: "buku Jejak Langkah sudah sampai halaman 200" },
            }],
          },
        }],
      }],
    };

    const res = await app.handle(
      new Request("http://localhost/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});
