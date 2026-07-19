import { Elysia, t } from "elysia";

export const webhookRoute = new Elysia({ prefix: "/webhook" })
  .get("/", ({ query }) => {
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
  })
  .post("/", ({ body }) => {
    console.log("Incoming webhook:", JSON.stringify(body, null, 2));
    return { status: "ok" };
  });
