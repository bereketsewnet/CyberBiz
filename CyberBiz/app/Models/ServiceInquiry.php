<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceInquiry extends Model
{
    protected $fillable = [
        'service_id',
        'name',
        'email',
        'phone',
        'company',
        'message',
        'status',
        'admin_notes',
        'assigned_to',
    ];

    protected $casts = [
        'service_id' => 'integer',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
