import { Elysia, t } from "elysia";
import { getAllBooks, appendBook, updateBook, deleteBook } from "../sheets/books";

export const booksRoute = new Elysia({ prefix: "/books" })
  .get("/", async () => {
    return await getAllBooks();
  })
  .post(
    "/",
    async ({ body }) => {
      const book = await appendBook(body);
      return { success: true, data: book };
    },
    {
      body: t.Object({
        title: t.String(),
        author: t.String(),
        current_page: t.Number({ default: 0 }),
        total_pages: t.Number(),
        status: t.Union([t.Literal("reading"), t.Literal("finished"), t.Literal("want_to_read"), t.Literal("on_hold")]),
      }),
    }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const book = await updateBook(params.id, body);
      if (!book) return { success: false, message: "Book not found" };
      return { success: true, data: book };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        author: t.Optional(t.String()),
        current_page: t.Optional(t.Number()),
        total_pages: t.Optional(t.Number()),
        status: t.Optional(t.Union([t.Literal("reading"), t.Literal("finished"), t.Literal("want_to_read"), t.Literal("on_hold")])),
        cover_url: t.Optional(t.String()),
        rating: t.Optional(t.Number()),
        date_finished: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async ({ params }) => {
    const ok = await deleteBook(params.id);
    if (!ok) return { success: false, message: "Book not found" };
    return { success: true };
  });
