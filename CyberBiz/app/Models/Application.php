<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'job_id',
        'seeker_id',
        'cv_path',
        'cv_original_name',
        'cover_letter',
    ];

    // Relationships
    public function job()
    {
        return $this->belongsTo(JobPosting::class, 'job_id');
    }

    public function seeker()
    {
        return $this->belongsTo(User::class, 'seeker_id');
    }
}
