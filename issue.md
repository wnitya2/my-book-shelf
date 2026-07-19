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
    client.ts     # inisialisasi Google Sheets API client (OAuth2)
    books.ts      # fungsi baca/tulis data buku ke Sheet
  routes/
    books.ts      # route untuk CRUD buku
    auth.ts       # route untuk OAuth2 callback
scripts/
  get-token.ts    # one-time script untuk mendapatkan refresh token
```

### 3. Google Sheet Structure
Gunakan spreadsheet yang sudah ada. Buat sheet bernama `books` dengan kolom:
- `id`, `title`, `author`, `current_page`, `total_pages`, `status`, `created_at`, `updated_at`

Data diakses berdasarkan baris (row), bukan SQL query.

### 4. Google Sheets Authentication
Gunakan OAuth 2.0 (Web application) — autentikasi sebagai pemilik spreadsheet.

Flow satu kali (one-time setup):
1. Jalankan `bun run scripts/get-token.ts`
2. Buka URL yang muncul di browser, login dengan akun Google pemilik spreadsheet
3. Google redirect ke `/auth/callback`, app simpan refresh token ke console
4. Copy refresh token ke `.env`

Setelah itu app bisa jalan tanpa perlu login lagi.

Buat file `.env.example` dengan variabel:
- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (contoh: `http://localhost:3000/auth/callback`)
- `GOOGLE_REFRESH_TOKEN` (diisi setelah one-time setup)

### 5. API Routes
Buat endpoint dasar untuk resource `books`:
- `GET /books` — list semua buku (baca semua baris dari Sheet)
- `POST /books` — tambah buku baru (append baris baru)
- `PATCH /books/:id` — update progress/data buku (update baris berdasarkan id)
- `DELETE /books/:id` — hapus buku (hapus baris berdasarkan id)

Tambah route untuk OAuth callback:
- `GET /auth/callback` — terima code dari Google, tukar dengan refresh token

### 6. Run
- App bisa dijalankan dengan `bun run dev`
- One-time setup token: `bun run scripts/get-token.ts`
- Tidak ada migrasi database; struktur kolom disetup manual di Google Sheet
