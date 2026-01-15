<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlogComment extends Model
{
    protected $fillable = [
        'blog_id',
        'user_id',
        'parent_id',
        'content',
        'depth',
    ];

    protected $casts = [
        'depth' => 'integer',
    ];

    // Maximum nesting depth (2-3 levels)
    public const MAX_DEPTH = 2;

    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(BlogComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(BlogComment::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    /**
     * Check if this comment can have replies (depth limit)
     */
    public function canHaveReplies(): bool
    {
        return $this->depth < self::MAX_DEPTH;
    }
}
