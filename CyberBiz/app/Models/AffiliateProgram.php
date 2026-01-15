<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AffiliateProgram extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'commission_rate',
        'target_url',
        'is_active',
        'cookie_duration',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'cookie_duration' => 'integer',
    ];

    public function links(): HasMany
    {
        return $this->hasMany(AffiliateLink::class, 'program_id');
    }

    /**
     * Calculate commission based on amount
     */
    public function calculateCommission(float $amount): float
    {
        if ($this->type === 'percentage') {
            return round(($amount * $this->commission_rate) / 100, 2);
        }
        return $this->commission_rate;
    }
}
