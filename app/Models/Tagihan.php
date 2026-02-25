<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasFactory;

    protected $fillable = [
        'mahasiswa_id',
        'jenis_tagihan',
        'nominal',
        'status',
        'tahun_masuk',
        'tanggal_jatuh_tempo',
        'tanggal_bayar',
    ];

    protected $casts = [
        'jenis_tagihan' => 'array', // otomatis convert JSON <-> array
        'tanggal_jatuh_tempo' => 'date',
        'tanggal_bayar' => 'date',
    ];

    // Relasi ke mahasiswa
    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }
}
