<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Navbar extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title',
        'url',
        'parent_id',
        'order_priority',
        'is_active',
        'target',
        'icon',
    ];

    /**
     * Mengambil semua sub-menu (anak) dari menu ini.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Navbar::class, 'parent_id')->orderBy('order_priority');
    }

    /**
     * Mengambil induk dari menu ini (jika ada).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Navbar::class, 'parent_id');
    }

    /**
     * Scope untuk mempermudah mengambil menu utama saja (Top Level).
     */
    public function scopeIsRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope untuk mengambil menu yang aktif saja.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}