<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductResource extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'product_id',
        'type',
        'title',
        'description',
        'file_path',
        'external_url',
        'file_name',
        'file_size',
        'mime_type',
        'order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('created_at');
    }

    public function scopeVideos($query)
    {
        return $query->where('type', 'VIDEO');
    }

    public function scopeDocuments($query)
    {
        return $query->where('type', 'DOCUMENT');
    }

    public function scopeFiles($query)
    {
        return $query->where('type', 'FILE');
    }
}
