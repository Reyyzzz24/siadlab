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
        Schema::table('navbars', function (Blueprint $table) {
            $table->string('icon')->nullable()->after('title'); // Menambahkan kolom icon
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('navbars', function (Blueprint $table) {
            //
        });
    }
};
