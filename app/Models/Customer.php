<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customerId',
        'name',
        'contactNumber',
        'email',
        'address',
        'creditLimit',
        'netBalance',
        'cashBalance',
        'creditBalance',
        'cardBalance',
        'totalBalance',
        'discountValue',
        'discountType',
        'status',
        'availability',
    ];

    protected $casts = [
        'availability'  => 'boolean',
        'creditLimit'   => 'decimal:2',
        'netBalance'    => 'decimal:2',
        'cashBalance'   => 'decimal:2',
        'creditBalance' => 'decimal:2',
        'cardBalance'   => 'decimal:2',
        'totalBalance'  => 'decimal:2',
        'discountValue' => 'decimal:2',
    ];
    /**
     * Accessor for formatted discount display
     */
    public function getFormattedDiscountAttribute()
    {
        if (is_null($this->discountValue)) {
            return '-';
        }

        return $this->discountType === 'percentage'
            ? "{$this->discountValue}%"
            : 'Rs. ' . number_format($this->discountValue, 2);
    }

    /**
     * Check if the customer is active and available
     */
    public function getIsActiveAttribute()
    {
        return $this->status === 'active' && $this->availability === true;
    }

    protected static function booted()
    {
        static::creating(function ($customer) {
            if (empty($customer->customerId)) {
                $lastId               = self::latest('id')->value('id') ?? 0;
                $customer->customerId = 'CUST' . str_pad($lastId + 1, 6, '0', STR_PAD_LEFT);
            }

            $customer->creditBalance = $customer->creditBalance ?? 0;
            $customer->netBalance    = $customer->creditBalance;

        });
    }

    public function reduceCreditBalance(float $amount)
    {
        $this->creditBalance -= $amount;
        $this->netBalance = $this->creditBalance;
        $this->save();
    }

    /**
     * Increase creditBalance (e.g., adding credit)
     */
    public function addCreditBalance(float $amount)
    {
        $this->creditBalance += $amount;
        $this->netBalance = $this->creditBalance;
        $this->save();
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
