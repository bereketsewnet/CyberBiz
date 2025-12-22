<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'type',
        'title',
        'description',
        'description_html',
        'price_etb',
        'thumbnail_url',
        'access_url',
        'is_downloadable',
        'is_free',
    ];

    protected function casts(): array
    {
        return [
            'price_etb' => 'decimal:2',
            'is_downloadable' => 'boolean',
            'is_free' => 'boolean',
        ];
    }

    // Relationships
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function libraryEntries()
    {
        return $this->hasMany(UserLibrary::class);
    }

    public function resources()
    {
        return $this->hasMany(ProductResource::class)->ordered();
    }
}
