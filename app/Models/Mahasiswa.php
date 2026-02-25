<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    use HasFactory;

    protected $table = 'mahasiswas';

    protected $fillable = [
        'user_id',
        'nim',
        'nama',
        'program_studi',
        'kelas',
        'tahun_masuk',
        'no_telepon',
        'email',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function tagihans()
    {
        return $this->hasMany(Tagihan::class);
    }
    protected static function boot()
    {
        parent::boot();

        // Event ini berjalan otomatis tepat sebelum data mahasiswa disimpan ke DB
        static::creating(function ($mahasiswa) {
            if (!$mahasiswa->user_id && $mahasiswa->email) {
                // Cari ID user berdasarkan email
                $user = \App\Models\User::where('email', $mahasiswa->email)->first();
                if ($user) {
                    $mahasiswa->user_id = $user->id;
                }
            }
        });
    }
}
