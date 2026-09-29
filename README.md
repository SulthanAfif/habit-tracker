# Belajar Frontend Development

# Habit Tracker Pro

Aplikasi pelacak kebiasaan harian yang lengkap dan modern.  
Dibuat sepenuhnya dengan **Vanilla HTML, CSS, dan JavaScript** (tanpa framework).

Project ini cocok untuk portfolio karena sudah mencakup banyak fitur advanced.

---

## Fitur Lengkap

### Manajemen Habit

- Tambah, edit, dan hapus habit
- Pilih **warna** habit
- Pilih **kategori** (Kesehatan, Produktivitas, Belajar, Keuangan, Lainnya)
- Tentukan **target mingguan** (1–7x per minggu)
- **Mode Tantangan 30 Hari**

### Tracking

- Tandai selesai per hari (kalender 7 hari)
- **Streak** saat ini & **Best Streak**
- Progress bar mingguan
- Catatan harian (opsional saat menandai selesai)

### Tampilan

- **Daftar Habit** (view utama)
- **Kalender Bulanan Penuh** (lihat progress sebulan)
- **Grafik Progress** 30 hari terakhir (Chart.js)
- Filter: Semua / Belum Selesai / Selesai Hari Ini / Tantangan

### Data & Lainnya

- Export & Import data (JSON)
- Reset semua data
- **Notifikasi browser** (pengingat harian)
- Quote motivasi harian
- Dark Mode
- Fully Responsive

---

## Tech Stack

- HTML5
- CSS3 (CSS Variables + Dark Mode + Responsive)
- JavaScript (Vanilla)
- Chart.js (untuk grafik)
- localStorage
- Notification API

---

## Cara Menjalankan

1. Clone repository:
   ```bash
   git clone https://github.com/USERNAME_KAMU/habit-tracker.git
   ```

# Cara Menggunakan

1. Isi nama habit, pilih kategori, warna, dan target mingguan
2. Centang Mode Tantangan 30 Hari jika ingin challenge
3. Klik + Tambah Habit
4. Klik kotak hari untuk menandai selesai (bisa isi catatan)
5. Gunakan tab Kalender Bulanan dan Grafik Progress
6. Aktifkan notifikasi dengan tombol 🔔
7. Export/Import data lewat tombol 📥 📤

## Struktur File

```
habit-tracker/
├── index.html      # Struktur halaman
├── style.css       # Tampilan, dark mode & responsive
├── script.js       # Logika aplikasi
└── README.md       # Dokumentasi
```

# Pengembangan Selanjutnya (Ide)

- Reminder berbasis waktu tertentu
- Multiple device sync (butuh backend)
- Statistik lebih detail per kategori
- Mode gelap otomatis mengikuti sistem
