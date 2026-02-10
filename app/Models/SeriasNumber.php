<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeriasNumber extends Model
{
    use HasFactory;

    protected $fillable = [
        'seriasNo',
        'status',
    ];

}
