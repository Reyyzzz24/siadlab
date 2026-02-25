<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Barang extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'barangs';
    protected $primaryKey = 'idbarang';
    public $incrementing = false; // karena bukan auto increment
    protected $keyType = 'string'; // karena string

    protected $fillable = [
        'idbarang',     // kode barang
        'namabarang',
        'kategori',
        'tanggal_masuk',
        'status',
        'hargabarang',
        'stok',
    ];

    // Status constants
    public const STATUS_AVAILABLE = 'available';
    public const STATUS_UNAVAILABLE = 'unavailable';
    public const STATUS_RUSAK = 'rusak';
}
