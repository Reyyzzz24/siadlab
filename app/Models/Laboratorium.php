<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Laboratorium extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $table = 'laboratoriums';

    protected $fillable = [
        'id_lab',
        'nama_lab',
        'lokasi',
        'kapasitas',
        'keterangan',
        'status', // Tambahkan kolom baru di sini
    ];

    /**
     * Relasi: 1 Laboratorium punya banyak peminjaman
     */
    public function peminjamans()
    {
        return $this->hasMany(PeminjamanLab::class, 'laboratorium_id');
    }
    protected static function booted()
    {
        static::creating(function ($laboratorium) {
            if (!$laboratorium->id_lab) {
                // Ambil ID terakhir
                $lastLab = self::latest('id_lab')->first();

                if ($lastLab) {
                    // Ambil angka terakhir dan tambah 1
                    $number = (int) substr($lastLab->id_lab, 4);
                    $laboratorium->id_lab = 'LAB-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
                } else {
                    // Jika belum ada, mulai dari 001
                    $laboratorium->id_lab = 'LAB-001';
                }
            }
        });
    }
}
