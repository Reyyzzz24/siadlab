<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pembayarans', function (Blueprint $blueprint) {
            // Kita mengubah tipe kolom kategori menjadi enum dengan nilai baru
            // Berdasarkan gambar_4e820e.png, tambahkan kkl dan kkn ke daftar yang ada
            $blueprint->enum('kategori', [
                'skripsi', 
                'praktikum', 
                'sempro', 
                'semhas', 
                'other', 
                'kkl', 
                'kkn'
            ])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembayarans', function (Blueprint $blueprint) {
            // Kembalikan ke daftar awal jika migrasi di-rollback
            $blueprint->enum('kategori', [
                'skripsi', 
                'praktikum', 
                'sempro', 
                'semhas', 
                'other'
            ])->change();
        });
    }
};