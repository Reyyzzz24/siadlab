<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratKeluar extends Model
{
    use HasFactory;

    protected $table = 'surat_keluar';

    protected $fillable = [
        'no_agenda',
        'no_surat',
        'tanggal_surat',
        'tujuan_surat',
        'perihal',
        'file_surat',
        'pengirim_id',
    ];

    protected $casts = [
        'tanggal_surat' => 'date',
    ];

    // Relasi ke user (pengirim)
    public function pengirim()
    {
        return $this->belongsTo(User::class, 'pengirim_id');
    }
}