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
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            $table->unsignedBigInteger('petugas_id')->nullable()->after('user_id');
            $table->foreign('petugas_id')->references('id')->on('users')->onDelete('set null');

            $table->unsignedBigInteger('admin_id')->nullable()->after('petugas_id');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            $table->dropForeign(['petugas_id']);
            $table->dropColumn('petugas_id');
            $table->dropForeign(['admin_id']);
            $table->dropColumn('admin_id');
        });
    }
};
