# Habit Tracker Pro

Aplikasi pelacak kebiasaan harian yang lengkap dan modern. Dibuat sepenuhnya dengan **Vanilla HTML, CSS, dan JavaScript** (tanpa framework).

Project ini cocok untuk portfolio karena sudah mencakup banyak fitur advanced seperti streak, progress mingguan, catatan harian, export/import data, dan dark mode.

---

## Fitur Lengkap

### Manajemen Habit
- Tambah, **edit**, dan hapus habit
- Pilih **warna** habit
- Tentukan **target mingguan** (1–7 kali per minggu)
- Tandai selesai per hari (kalender 7 hari terakhir)

### Tracking & Statistik
- **Streak** saat ini
- **Best Streak** (rekor terbaik)
- Progress bar mingguan
- Statistik: Total Habit, Selesai Hari Ini, Best Streak
- Filter: Semua / Belum Selesai / Selesai Hari Ini

### Catatan Harian
- Saat menandai hari selesai, bisa menambahkan **catatan** (opsional)
- Catatan tersimpan dan bisa dilihat kembali

### Data Management
- **Export** data ke file JSON
- **Import** data dari file JSON
- **Reset** semua data
- Data tersimpan otomatis di `localStorage`

### Lainnya
- Quote motivasi harian (berubah setiap refresh)
- Dark Mode
- Fully Responsive (HP, Tablet, Desktop)
- Animasi halus

---

## Tech Stack

- HTML5
- CSS3 (CSS Variables + Dark Mode + Media Queries)
- JavaScript (Vanilla)
- localStorage

---

## Cara Menjalankan

1. Clone repository ini:
   ```bash
   git clone https://github.com/SulthanAfif/habit-tracker.git

# Cara Menggunakan

1. Isi nama habit, pilih warna, dan tentukan target mingguan
2. Klik + Tambah Habit
3. Klik kotak hari untuk menandai selesai (bisa diisi catatan)
4. Lihat streak dan progress bar secara real-time
5. Gunakan filter untuk melihat habit yang sudah/belum selesai
6. Klik ikon 📥 untuk export data, 📤 untuk import
7. Klik ikon bulan/matahari untuk Dark Mode

## Struktur File
```
habit-tracker/
├── index.html      # Struktur halaman
├── style.css       # Tampilan, dark mode & responsive
├── script.js       # Logika aplikasi
└── README.md       # Dokumentasi
```

