# SIADLAB: Sistem Informasi Tata Usaha dan Laboratorium

SIADLAB adalah sistem informasi berbasis web yang dirancang untuk mengintegrasikan proses administrasi Tata Usaha dan pengelolaan Laboratorium di Fakultas Ilmu Komputer (FILKOM) Universitas Djuanda. Sistem ini bertujuan untuk mendigitalisasi proses manual seperti pengarsipan surat, peminjaman inventaris, reservasi laboratorium, dan pembayaran administrasi guna meningkatkan efisiensi serta akurasi data.

---

## 🚀 Fitur Utama
* **Manajemen Administrasi**: Pengarsipan surat masuk dan surat keluar yang terstruktur dan mudah dicari.
* **Peminjaman Inventaris**: Pengelolaan stok barang dan peminjaman alat secara real-time dengan validasi petugas.
* **Reservasi Laboratorium**: Penjadwalan penggunaan ruang laboratorium untuk mencegah tumpang tindih jadwal.
* **Sistem Pembayaran**: Pencatatan dan validasi pembayaran administrasi mahasiswa yang transparan.
* **Role-Based Access Control**: Hak akses yang terpisah antara Administrator, Petugas, dan Mahasiswa untuk keamanan data.

---

## 🛠️ Teknologi yang Digunakan
* **Backend**: Laravel 12
* **Frontend**: React dengan TypeScript
* **Styling**: Tailwind CSS
* **Database**: MySQL
* **Design**: Figma

---

## 💻 Cara Instalasi

   ```bash
   git clone https://github.com/Reyyzzz24/siadlab/
   cd siadlab
   composer install
   npm install
   php artisan key:generate
   php artisan migrate
   composer dev

