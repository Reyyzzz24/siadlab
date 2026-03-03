<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Cara paling aman untuk mengubah ENUM di MySQL adalah menggunakan DB::statement
        // Kita tambahkan 'dibatalkan' ke dalam daftar enum
        DB::statement("ALTER TABLE pembayarans MODIFY COLUMN status ENUM('lunas', 'belum_bayar', 'menunggu_konfirmasi', 'ditolak', 'dibatalkan') DEFAULT 'belum_bayar'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan ke struktur awal (tanpa 'dibatalkan')
        // Catatan: Pastikan tidak ada data dengan status 'dibatalkan' sebelum rollback, 
        // atau datanya akan menjadi kosong/error di MySQL strict mode.
        DB::statement("ALTER TABLE pembayarans MODIFY COLUMN status ENUM('lunas', 'belum_bayar', 'menunggu_konfirmasi', 'ditolak') DEFAULT 'belum_bayar'");
    }
};