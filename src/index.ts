import { Elysia } from "elysia";
import { booksRoute } from "./routes/books";
import { authRoute } from "./routes/auth";
import { webhookRoute } from "./routes/webhook";

const app = new Elysia()
  .use(authRoute)
  .use(booksRoute)
  .use(webhookRoute)
  .get("/", () => ({ status: "ok" }))
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
