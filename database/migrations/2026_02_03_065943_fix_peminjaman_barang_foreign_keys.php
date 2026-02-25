<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::table('peminjaman_barang', function (Blueprint $table) {

            // DROP FK LAMA (PAKAI NAMA ASLI)
            $table->dropForeign('peminjaman_barang_ibfk_2');
            $table->dropForeign('peminjaman_barang_ibfk_3');

            // BUAT FK BARU KE USERS
            $table->foreign('admin_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign('petugas_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('peminjaman_barang', function (Blueprint $table) {

            $table->dropForeign(['admin_id']);
            $table->dropForeign(['petugas_id']);

            // Kembalikan ke FK lama (asumsi sebelumnya)
            $table->foreign('admin_id')
                ->references('id')
                ->on('administrators')
                ->nullOnDelete();

            $table->foreign('petugas_id')
                ->references('id')
                ->on('petugas')
                ->nullOnDelete();
        });
    }
};
