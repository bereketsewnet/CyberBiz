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
        'impression_rate',
        'impression_unit',
        'click_rate',
        'click_unit',
        'target_url',
        'is_active',
        'cookie_duration',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'impression_rate' => 'decimal:2',
        'click_rate' => 'decimal:2',
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

    /**
     * Calculate commission based on impressions (e.g. 10 birr per 1000 impressions)
     */
    public function calculateImpressionCommission(int $impressions): float
    {
        if (!$this->impression_rate || !$this->impression_unit || $this->impression_unit <= 0) {
            return 0.0;
        }

        $blocks = intdiv($impressions, $this->impression_unit);

        return (float) ($blocks * (float) $this->impression_rate);
    }

    /**
     * Calculate commission based on clicks (e.g. 10 birr per 300 clicks)
     */
    public function calculateClickCommission(int $clicks): float
    {
        if (!$this->click_rate || !$this->click_unit || $this->click_unit <= 0) {
            return 0.0;
        }

        $blocks = intdiv($clicks, $this->click_unit);

        return (float) ($blocks * (float) $this->click_rate);
    }
}
