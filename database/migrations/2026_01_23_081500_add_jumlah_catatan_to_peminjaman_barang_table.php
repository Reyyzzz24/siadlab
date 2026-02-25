<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('peminjaman_barang', function (Blueprint $table) {
            if (!Schema::hasColumn('peminjaman_barang', 'jumlah')) {
                $table->integer('jumlah')->default(1)->after('barang_id');
            }

            if (!Schema::hasColumn('peminjaman_barang', 'catatan')) {
                $table->text('catatan')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('peminjaman_barang', function (Blueprint $table) {
            if (Schema::hasColumn('peminjaman_barang', 'jumlah')) {
                $table->dropColumn('jumlah');
            }

            if (Schema::hasColumn('peminjaman_barang', 'catatan')) {
                $table->dropColumn('catatan');
            }
        });
    }
};
