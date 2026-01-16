<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class AffiliateLink extends Model
{
    protected $fillable = [
        'program_id',
        'affiliate_id',
        'code',
        'url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($link) {
            if (empty($link->code)) {
                $link->code = Str::random(10);
            }
            if (empty($link->url)) {
                $link->url = $link->generateUrl();
            }
        });
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(AffiliateProgram::class, 'program_id');
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'affiliate_id');
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(AffiliateClick::class, 'link_id');
    }

    public function conversions(): HasMany
    {
        return $this->hasMany(AffiliateConversion::class, 'link_id');
    }

    /**
     * Generate affiliate URL
     */
    public function generateUrl(): string
    {
        $baseUrl = env('FRONTEND_URL', 'http://localhost:8080');
        return $baseUrl . '/affiliate/' . $this->code;
    }

    /**
     * Get total clicks count
     */
    public function getTotalClicksAttribute(): int
    {
        return $this->clicks()->count();
    }

    /**
     * Get total conversions count
     */
    public function getTotalConversionsAttribute(): int
    {
        return $this->conversions()->where('status', '!=', 'rejected')->count();
    }

    /**
     * Get total commission
     */
    public function getTotalCommissionAttribute(): float
    {
        return $this->conversions()
            ->where('status', '!=', 'rejected')
            ->sum('commission');
    }
}
