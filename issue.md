# Project Setup: Book Tracker API

## Stack
- **Runtime:** Bun
- **Framework:** ElysiaJS
- **Database:** Google Sheets (via Google Sheets API)

## Architecture
```
WhatsApp → ElysiaJS API → Google Sheets API → Google Sheet
```
Google Sheet berfungsi sebagai satu-satunya database. Data dibaca dan ditulis langsung ke Sheet.

## Tasks

### 1. Initialize Project
- Init project baru dengan `bun init`
- Install dependencies: `elysia`, `googleapis`

### 2. Project Structure
Buat struktur folder seperti berikut:
```
src/
  index.ts        # entry point, setup Elysia app
  sheets/
    client.ts     # inisialisasi Google Sheets API client
    books.ts      # fungsi baca/tulis data buku ke Sheet
  routes/
    books.ts      # route untuk CRUD buku
```

### 3. Google Sheet Structure
Gunakan spreadsheet yang sudah ada. Buat sheet bernama `books` dengan kolom:
- `id`, `title`, `author`, `current_page`, `total_pages`, `status`, `created_at`, `updated_at`

Data diakses berdasarkan baris (row), bukan SQL query.

### 4. Google Sheets Authentication
- Gunakan Google Service Account untuk autentikasi
- Simpan credentials di `.env` (jangan di-commit)
- Buat file `.env.example` sebagai template dengan variabel:
  - `GOOGLE_SPREADSHEET_ID`
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`

### 5. API Routes
Buat endpoint dasar untuk resource `books`:
- `GET /books` — list semua buku (baca semua baris dari Sheet)
- `POST /books` — tambah buku baru (append baris baru)
- `PATCH /books/:id` — update progress/data buku (update baris berdasarkan id)
- `DELETE /books/:id` — hapus buku (hapus baris berdasarkan id)

### 6. Run
- App bisa dijalankan dengan `bun run dev`
- Tidak ada migrasi database; struktur kolom disetup manual di Google Sheet
