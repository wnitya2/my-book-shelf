# my-book-shelf

Personal book tracking API built with Bun, ElysiaJS, and Google Sheets.

## Setup

1. Copy `.env.example` ke `.env` dan isi credentials Google Service Account
2. Install dependencies:

```bash
bun install
```

3. Jalankan server:

```bash
bun run dev
```

Server berjalan di `http://localhost:3000`.

## API Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | /books | List semua buku |
| POST | /books | Tambah buku baru |
| PATCH | /books/:id | Update progress/data buku |
| DELETE | /books/:id | Hapus buku |
