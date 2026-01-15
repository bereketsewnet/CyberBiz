<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateConversion extends Model
{
    protected $fillable = [
        'link_id',
        'click_id',
        'transaction_id',
        'amount',
        'commission',
        'status',
        'notes',
        'converted_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'commission' => 'decimal:2',
        'converted_at' => 'datetime',
    ];

    public function link(): BelongsTo
    {
        return $this->belongsTo(AffiliateLink::class, 'link_id');
    }

    public function click(): BelongsTo
    {
        return $this->belongsTo(AffiliateClick::class, 'click_id');
    }
}
