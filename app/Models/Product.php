<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

   protected $fillable = [
        'productName',
        'productCode',
        'productDescription',
        'productImage',
        'buyingPrice',
        'tax',
        'discount',
        'quantity',
        'unit',
        'brand',
        'sellingPrice',
        'seriasId',
        'supplierId',
        'createdBy',
        'lowStock',
        'profitMargin',
        'batchNumber',
        'status',
        'availability',
        'expiryDate',
        'purchaseDate',
    ];

     protected $casts = [
        'expiryDate'   => 'date',
        'purchaseDate' => 'date',
        'profitMargin' => 'decimal:2'
    ];

    // public function scopeFilter($query, array $filters)
    // {
    //     $query->when($filters['search'] ?? false, function ($query, $search) {
    //         $query->where(function ($query) use ($search) {
    //             $query->where('name', 'like', '%' . $search . '%')
    //                 ->orWhere('description', 'like', '%' . $search . '%');
    //         });
    //     });
    // }


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function serias()
    {
        return $this->belongsTo(SeriasNumber::class);
    }

}
