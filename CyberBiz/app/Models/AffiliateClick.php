<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateClick extends Model
{
    protected $fillable = [
        'link_id',
        'ip_address',
        'user_agent',
        'referer',
        'country',
        'clicked_at',
    ];

    protected $casts = [
        'clicked_at' => 'datetime',
    ];

    public function link(): BelongsTo
    {
        return $this->belongsTo(AffiliateLink::class, 'link_id');
    }
}
