<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'password',
        'role',
        'subscription_tier',
        'credits',
        'company_name',
        'website_url',
        'email_verified_at',
        'phone_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'credits' => 'integer',
        ];
    }

    // Relationships
    public function jobPostings()
    {
        return $this->hasMany(JobPosting::class, 'employer_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'seeker_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function library()
    {
        return $this->hasMany(UserLibrary::class);
    }

    // Helper methods
    public function isAdmin(): bool
    {
        return $this->role === 'ADMIN';
    }

    public function isEmployer(): bool
    {
        return $this->role === 'EMPLOYER';
    }

    public function isSeeker(): bool
    {
        return $this->role === 'SEEKER';
    }
}
