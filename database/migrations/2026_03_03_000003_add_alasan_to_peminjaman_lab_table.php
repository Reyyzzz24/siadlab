<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            if (!Schema::hasColumn('peminjaman_lab', 'alasan')) {
                $table->text('alasan')->nullable()->after('status');
            }
        });
    }

    public function down()
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            if (Schema::hasColumn('peminjaman_lab', 'alasan')) {
                $table->dropColumn('alasan');
            }
        });
    }
};
