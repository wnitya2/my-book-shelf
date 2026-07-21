import { Elysia } from "elysia";
import { booksRoute } from "./routes/books";
import { authRoute } from "./routes/auth";
import { webhookRoute } from "./routes/webhook";

const app = new Elysia()
  .use(authRoute)
  .use(booksRoute)
  .use(webhookRoute);

const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  // Dev: let Bun bundle the HTML entry on the fly, with HMR.
  const index = (await import("../frontend/index.html")).default;
  Bun.serve({
    hostname: "0.0.0.0",
    port: 3000,
    routes: { "/": index },
    fetch(req) {
      return app.handle(req);
    },
    development: { hmr: true, console: true },
  });
} else {
  // Prod: serve the pre-built static bundle from ./dist (see `bun run build`).
  const DIST = "./dist";
  Bun.serve({
    hostname: "0.0.0.0",
    port: 3000,
    async fetch(req) {
      const { pathname } = new URL(req.url);
      if (pathname === "/") {
        return new Response(Bun.file(`${DIST}/index.html`), {
          headers: { "Content-Type": "text/html" },
        });
      }
      const asset = Bun.file(`${DIST}${pathname}`);
      if (await asset.exists()) {
        return new Response(asset);
      }
      // Not a static asset → hand off to API routes (/books, /webhook, /auth).
      return app.handle(req);
    },
  });
}

console.log("Server running on http://0.0.0.0:3000");
