<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pembayarans', function (Blueprint $table) {

            // DROP FK lama
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['petugas_id']);

            // Pastikan tipe sesuai users.id
            $table->unsignedBigInteger('admin_id')->nullable()->change();
            $table->unsignedBigInteger('petugas_id')->nullable()->change();

            // FK baru ke users
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
        Schema::table('pembayarans', function (Blueprint $table) {

            // rollback users
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['petugas_id']);

            // balikin ke tabel lama
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

