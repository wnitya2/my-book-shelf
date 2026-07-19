import { Elysia } from "elysia";
import { booksRoute } from "./routes/books";
import { authRoute } from "./routes/auth";
import { webhookRoute } from "./routes/webhook";
import index from "../frontend/index.html";

const app = new Elysia()
  .use(authRoute)
  .use(booksRoute)
  .use(webhookRoute);

Bun.serve({
  routes: {
    "/": index,
  },
  fetch(req) {
    return app.handle(req);
  },
  port: 3000,
  development: {
    hmr: true,
    console: true,
  },
});

console.log("Server running at http://localhost:3000");
