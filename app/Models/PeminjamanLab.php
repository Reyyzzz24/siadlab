<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class PeminjamanLab extends Model
{
    use HasFactory;

    protected $table = 'peminjaman_lab';

    protected $fillable = [
        'user_id',
        'petugas_id',
        'id_transaksi',
        'nama_peminjam',
        'laboratorium_id',
        'tanggal_pinjam',
        'waktu_mulai',
        'waktu_selesai',
        'keperluan',
        'status',
        'admin_id',   
        'petugas_id',
    ];

    /**
     * Relasi ke user (umum)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke laboratorium
     */
    public function laboratorium()
    {
        return $this->belongsTo(Laboratorium::class);
    }

    /**
     * Relasi ke petugas (user yang mengapprove)
     */
    public function petugas()
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
