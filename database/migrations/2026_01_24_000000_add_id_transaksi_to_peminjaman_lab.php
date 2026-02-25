<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            if (!Schema::hasColumn('peminjaman_lab', 'id_transaksi')) {
                $table->string('id_transaksi')->nullable()->after('id');
            }
        });
    }

    public function down()
    {
        Schema::table('peminjaman_lab', function (Blueprint $table) {
            if (Schema::hasColumn('peminjaman_lab', 'id_transaksi')) {
                $table->dropColumn('id_transaksi');
            }
        });
    }
};
