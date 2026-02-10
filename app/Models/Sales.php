<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Sales extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['totalAmount', 'status', 'paymentMethod', 'billNumber'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'customerId',
        'productId',
        'returnProductId',
        'totalQuantity',
        'totalAmount',
        'paidAmount',
        'dueAmount',
        'creditAmount',
        'cardAmount',
        'cashAmount',
        'discount_value',
        'paymentMethod',
        'createdBy',
        'status',
        'billNumber',
    ];
      protected $casts = [
        'productId' => 'array',
        'returnProductId' => 'array',
        'totalAmount' => 'decimal:2',
        'paidAmount' => 'decimal:2',
        'dueAmount' => 'decimal:2',
        'creditAmount' => 'decimal:2',
        'cardAmount' => 'decimal:2',
        'cashAmount' => 'decimal:2',
        'discount_value' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerId');
    }

    public function salesDetails()
    {
        return $this->hasMany(SalesDetails::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }
    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy', 'id');
    }
    public function items()
    {
        return $this->hasMany(SalesDetails::class, 'salesId');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'sale_id');
    }
}
