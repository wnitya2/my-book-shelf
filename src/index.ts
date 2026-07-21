import { Elysia } from "elysia";
import { booksRoute } from "./routes/books";
import { authRoute } from "./routes/auth";
import { webhookRoute } from "./routes/webhook";
import index from "../frontend/index.html";

const app = new Elysia()
  .use(authRoute)
  .use(booksRoute)
  .use(webhookRoute);

const isDev = process.env.NODE_ENV !== "production";

Bun.serve({
  hostname: "0.0.0.0",
  routes: {
    "/": index,
  },
  fetch(req) {
    return app.handle(req);
  },
  port: 3000,
  ...(isDev && {
    development: {
      hmr: true,
      console: true,
    },
  }),
});

console.log("Server running on http://0.0.0.0:3000");
