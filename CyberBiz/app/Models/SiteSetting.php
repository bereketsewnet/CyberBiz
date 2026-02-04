<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'address',
        'email',
        'phone',
        'facebook_url',
        'twitter_url',
        'linkedin_url',
        'instagram_url',
        'youtube_url',
        'faq_q1',
        'faq_a1',
        'faq_q2',
        'faq_a2',
        'faq_q3',
        'faq_a3',
        'privacy_policy',
    ];
}
