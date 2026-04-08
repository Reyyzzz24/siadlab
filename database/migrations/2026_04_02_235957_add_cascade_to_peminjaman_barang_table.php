<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('peminjaman_barang', function (Blueprint $table) {
            // Kita gunakan cara manual drop karena nama constraint-nya 'peminjaman_barang_ibfk_1'
            // (biasanya hasil generate otomatis dari DB manual/import)
            $table->dropForeign('peminjaman_barang_ibfk_1');

            // Pasang kembali dengan Cascade
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('peminjaman_barang', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users');
        });
    }
};