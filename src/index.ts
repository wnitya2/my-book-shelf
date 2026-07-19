import { Elysia } from "elysia";
import { booksRoute } from "./routes/books";
import { authRoute } from "./routes/auth";

const app = new Elysia()
  .use(authRoute)
  .use(booksRoute)
  .get("/", () => ({ status: "ok" }))
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
