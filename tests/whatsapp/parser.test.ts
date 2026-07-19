import { describe, it, expect, mock } from "bun:test";
import { parseMessage } from "../../src/whatsapp/parser";

function makeMockClient(responseText: string) {
  return {
    messages: {
      create: mock(() =>
        Promise.resolve({ content: [{ type: "text", text: responseText }] })
      ),
    },
  } as any;
}

describe("parseMessage", () => {
  it("returns parsed intent from Claude response", async () => {
    const client = makeMockClient(JSON.stringify({
      action: "update_progress",
      book_title: "Jejak Langkah",
      fields: { current_page: 200 },
    }));

    const result = await parseMessage("Jejak Langkah sudah sampai halaman 200", client);
    expect(result.action).toBe("update_progress");
    expect(result.book_title).toBe("Jejak Langkah");
    expect(result.fields?.current_page).toBe(200);
  });

  it("returns unknown action when Claude returns invalid JSON", async () => {
    const client = makeMockClient("not valid json");
    const result = await parseMessage("gibberish", client);
    expect(result.action).toBe("unknown");
  });

  it("returns unknown action when response is not text type", async () => {
    const client = {
      messages: {
        create: mock(() => Promise.resolve({ content: [{ type: "image" }] })),
      },
    } as any;
    const result = await parseMessage("some message", client);
    expect(result.action).toBe("unknown");
  });
});
