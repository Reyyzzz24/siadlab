<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PeminjamanBarang extends Model
{
    use HasFactory;

    protected $table = 'peminjaman_barang';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'barang_id',
        'namabarang',
        'nama_peminjam',
        'jumlah',
        'tanggal_pinjam',
        'durasi_hari',
        'tanggal_kembali',
        'tanggal_kembali_sebenarnya',
        'status',
        'alasan',
        'id_transaksi',
        'petugas_id',
        'admin_id',
    ];


    protected static function booted()
    {
        static::saving(function ($peminjaman) {
            // Hitung durasi otomatis jika ada tanggal pinjam & kembali
            if ($peminjaman->tanggal_pinjam && $peminjaman->tanggal_kembali) {
                $peminjaman->durasi_hari = Carbon::parse($peminjaman->tanggal_pinjam)
                    ->diffInDays(Carbon::parse($peminjaman->tanggal_kembali)) + 1;
            }

            // Jangan ubah status jika sudah termasuk status final atau proses
            $statusFinal = ['booked', 'dipinjam', 'proses_kembali', 'dikembalikan', 'ditolak', 'invalid', 'terlambat'];
            if (in_array($peminjaman->status, $statusFinal)) {
                return;
            }

            // Validasi tanggal kembali < tanggal pinjam
            if ($peminjaman->tanggal_kembali && Carbon::parse($peminjaman->tanggal_kembali)->lt(Carbon::parse($peminjaman->tanggal_pinjam))) {
                $peminjaman->status = 'invalid';
            }
            // Barang sudah dikembalikan
            elseif ($peminjaman->tanggal_kembali_sebenarnya) {
                $peminjaman->status = Carbon::parse($peminjaman->tanggal_kembali_sebenarnya)->gt(Carbon::parse($peminjaman->tanggal_kembali))
                    ? 'terlambat'
                    : 'dikembalikan';
            }
            // Default untuk peminjaman aktif
            else {
                $peminjaman->status = 'dipinjam';
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'barang_id', 'idbarang');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    // Accessor opsional agar selalu tampil status dinamis
    public function getStatusAttribute($value)
    {
        // Prioritas status workflow
        if (in_array($value, ['booked', 'proses_kembali', 'dikembalikan', 'ditolak'])) {
            return $value;
        }

        if ($this->tanggal_kembali_sebenarnya) {
            return Carbon::parse($this->tanggal_kembali_sebenarnya)->gt(Carbon::parse($this->tanggal_kembali))
                ? 'terlambat'
                : 'dikembalikan';
        }

        return Carbon::now()->gt(Carbon::parse($this->tanggal_kembali)->endOfDay())
            ? 'terlambat'
            : $value;
    }

    // Accessor durasi otomatis jika ingin selalu dihitung
    public function getDurasiHariAttribute()
    {
        $start = Carbon::parse($this->tanggal_pinjam);
        $end = Carbon::parse($this->tanggal_kembali);

        if ($end->lt($start)) {
            return 1; // minimal 1 hari
        }

        return $start->diffInDays($end) + 1;
    }
}
