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
            // Mengubah kolom menjadi nullable
            $table->text('keperluan')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            $table->text('keperluan')->nullable(false)->change();
        });
    }
};
