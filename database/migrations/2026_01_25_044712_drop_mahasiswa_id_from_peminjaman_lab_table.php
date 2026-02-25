<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            // Menghapus foreign key terlebih dahulu
            $table->dropForeign(['mahasiswa_id']);
            // Baru menghapus kolomnya
            $table->dropColumn('mahasiswa_id');
        });
    }

    public function down()
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            // Untuk mengembalikannya jika rollback
            $table->unsignedBigInteger('mahasiswa_id')->nullable();
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa');
        });
    }
};
