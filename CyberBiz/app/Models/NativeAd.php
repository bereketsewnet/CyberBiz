<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NativeAd extends Model
{
    protected $fillable = [
        'title',
        'description',
        'image_url',
        'link_url',
        'position',
        'type',
        'advertiser_name',
        'is_active',
        'impressions',
        'clicks',
        'start_date',
        'end_date',
        'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'impressions' => 'integer',
        'clicks' => 'integer',
        'priority' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    /**
     * Check if ad is currently active based on dates
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        
        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        return true;
    }

    /**
     * Increment impressions count
     */
    public function incrementImpressions(): void
    {
        $this->increment('impressions');
    }

    /**
     * Increment clicks count
     */
    public function incrementClicks(): void
    {
        $this->increment('clicks');
    }

    /**
     * Get click-through rate
     */
    public function getClickThroughRate(): float
    {
        if ($this->impressions === 0) {
            return 0.0;
        }

        return round(($this->clicks / $this->impressions) * 100, 2);
    }
}
