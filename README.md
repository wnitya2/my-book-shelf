# My Book Shelf

A personal book tracking app where you send natural language WhatsApp messages to log reading progress, and view everything on a clean web dashboard.

Built with Bun, ElysiaJS, Google Sheets, Claude Haiku, and React.

---

## How It Works

1. Send a WhatsApp message like *"Jejak Langkah sudah sampai halaman 200"*
2. Claude Haiku parses the intent
3. Google Sheets is updated automatically
4. View your library at `http://localhost:3000`

---

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Bun |
| Backend | ElysiaJS |
| Database | Google Sheets API v4 |
| AI Parser | Claude Haiku (`claude-haiku-4-5-20251001`) |
| Messaging | Meta WhatsApp Cloud API |
| Frontend | React 19 + Tailwind v4 via Bun HTML imports |

---

## Book Statuses

| Status | Description |
|---|---|
| `reading` | Currently reading |
| `on_hold` | Started but paused — will come back |
| `finished` | Completed |
| `dropped` | Started but won't continue |
| `want_to_read` | To-read list |

New books added via WhatsApp default to `want_to_read`. Sending a progress update on a `want_to_read` book automatically promotes it to `reading`.

---

## WhatsApp Commands

Messages can be in Indonesian, English, or mixed.

| Intent | Example |
|---|---|
| Update progress | `"Jejak Langkah sudah sampai halaman 200"` |
| Mark finished | `"Laskar Pelangi sudah selesai dibaca"` |
| Put on hold | `"taruh on hold Thinking in Systems"` |
| Drop a book | `"drop Negeri 5 Menara"` |
| Add a book | `"tambah buku Pulang karya Tere Liye, 400 halaman"` |
| Set rating | `"kasih bintang 4 untuk Bumi Manusia"` |
| Add a note | `"Bumi Manusia: quote bagus di halaman 203"` |
| Check progress | `"sampai mana aku baca Jejak Langkah?"` |
| List books | `"buku apa yang sedang aku baca?"` |
| Reading stats | `"berapa halaman yang aku baca minggu ini?"` |
| Delete | `"hapus buku Negeri 5 Menara"` |

---

## Google Sheets Schema

### Sheet: `books`
`id | title | author | current_page | total_pages | status | date_started | date_last_read | date_finished | cover_url | rating`

### Sheet: `reading_log`
`id | book_id | book_title | pages_read | current_page | logged_at`

### Sheet: `notes`
`id | book_id | book_title | note | page | created_at`

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/books` | List all books |
| POST | `/books` | Add a new book |
| PATCH | `/books/:id` | Update book fields |
| DELETE | `/books/:id` | Delete a book |
| GET | `/webhook` | WhatsApp webhook verification |
| POST | `/webhook` | Incoming WhatsApp message handler |
| GET | `/auth/google` | Google OAuth flow |

---

## Setup

### 1. Clone and install dependencies

```bash
bun install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```env
# Google Sheets
GOOGLE_SPREADSHEET_ID=
GOOGLE_SHEET_NAME=books
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

# WhatsApp Cloud API
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=

# Anthropic
ANTHROPIC_API_KEY=
```

### 3. Run development server

```bash
bun run dev
```

This generates Tailwind CSS first, then starts the server with HMR at `http://localhost:3000`.

---

## Project Structure

```
src/
  index.ts              # Bun.serve() entry point
  routes/
    books.ts            # REST API for books
    webhook.ts          # WhatsApp webhook
  sheets/
    client.ts           # Google Sheets client
    books.ts            # CRUD for books
    reading-log.ts      # Append reading log entries
    notes.ts            # Append/read notes
  whatsapp/
    client.ts           # sendMessage() via WhatsApp API
    parser.ts           # Claude Haiku intent parser
    matcher.ts          # Fuzzy book title matching
    handler.ts          # Main message handler
frontend/
  index.html            # Entry point (Bun HTML import)
  App.tsx               # Root React component
  styles.css            # Tailwind v4 config
  components/
    Sidebar.tsx         # MY LIBRARY stats + BY STATUS bars
    BookSection.tsx     # Section with pagination (max 6/page)
    BookCard.tsx        # Compact horizontal book row
scripts/
  dev.ts                # Generates CSS then starts server + watcher
```

---

## Running Tests

```bash
bun test
```

---

## Frontend

The dashboard shows:
- **Sidebar** — total books, pages read, avg rating, and per-status progress bars
- **Currently Reading** — 2-column grid, sorted by last read date
- **On Hold** — paused books with last read date
- **Finished** — sorted by finished date, with star ratings (supports half stars)
- **Dropped** — books that didn't make it
- **Want to Read** — the ever-growing TBR list

Each section shows max 6 books with prev/next pagination.
