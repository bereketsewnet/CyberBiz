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
        'price_etb',
        'access_url',
    ];

    protected function casts(): array
    {
        return [
            'price_etb' => 'decimal:2',
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
}
