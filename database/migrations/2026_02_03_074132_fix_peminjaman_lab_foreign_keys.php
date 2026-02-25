<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {

            // DROP FK LAMA (AUTO NAME MYSQL)
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['petugas_id']);

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
        Schema::table('peminjaman_lab', function (Blueprint $table) {

            $table->dropForeign(['admin_id']);
            $table->dropForeign(['petugas_id']);

            // rollback ke tabel lama jika perlu
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
