<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPosting extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'employer_id',
        'title',
        'job_type',
        'location',
        'experience',
        'skills',
        'description_html',
        'status',
        'expires_at',
        'company_description',
        'ld_json',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'ld_json' => 'array',
            'skills' => 'array',
        ];
    }

    // Relationships
    public function employer()
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'job_id');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'PUBLISHED')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function ($q) use ($searchTerm) {
            $q->where('title', 'like', "%{$searchTerm}%")
                ->orWhere('description_html', 'like', "%{$searchTerm}%");
        });
    }
}
