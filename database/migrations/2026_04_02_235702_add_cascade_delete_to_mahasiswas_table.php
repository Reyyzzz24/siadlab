<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mahasiswas', function (Blueprint $blueprint) {
            // 1. Hapus foreign key yang lama (sesuaikan dengan nama constraint di error tadi)
            $blueprint->dropForeign(['user_id']);

            // 2. Pasang kembali dengan cascade delete
            $blueprint->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('mahasiswas', function (Blueprint $blueprint) {
            // Kembalikan ke semula jika di-rollback
            $blueprint->dropForeign(['user_id']);
            $blueprint->foreign('user_id')
                ->references('id')
                ->on('users');
        });
    }
};