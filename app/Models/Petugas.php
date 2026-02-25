<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Petugas extends Model
{
    use HasFactory;

    protected $table = 'petugas';

    protected $fillable = [
        'no_induk',
        'nama',
        'jabatan',
        'bagian',
        'no_telepon',
        'email',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
