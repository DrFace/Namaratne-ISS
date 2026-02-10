<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplierName',
        'supplierAddress',
        'supplierPhone',
        'supplierEmail',
        'categories',
        'companyName',
        'availibility',
        'status',

    ];

    protected $casts = [
        'categories' => 'array',
    ];
}
