<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_pembayar',
        'jenis_pembayaran',
        'kategori',
        'nominal',
        'tanggal_tagihan',
        'status',
        'keterangan',
        'tanggal_bayar',
        'id_transaksi',
        'bukti_bayar',
        'admin_id',
        'petugas_id',
    ];


    protected $casts = [
        'tanggal_tagihan' => 'date',
        'tanggal_bayar' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    protected static function booted()
    {
        static::created(function ($pembayaran) {
            if (!$pembayaran->id_transaksi) {
                $pembayaran->id_transaksi = date('dmY') . $pembayaran->id;
                $pembayaran->save();
            }
        });
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }
}
