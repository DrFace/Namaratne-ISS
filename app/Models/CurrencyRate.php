<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurrencyRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_currency',
        'to_currency',
        'rate',
        'updated_by',
    ];

    protected $casts = [
        'rate' => 'decimal:4',
    ];

    /**
     * Relationship: User who last updated the rate
     */
    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get current exchange rate between two currencies
     */
    public static function getCurrentRate(string $from, string $to): ?float
    {
        $rate = self::where('from_currency', $from)
            ->where('to_currency', $to)
            ->first();

        return $rate ? (float) $rate->rate : null;
    }

    /**
     * Convert amount to LKR
     */
    public static function convertToLKR(float $amount, string $fromCurrency): float
    {
        if ($fromCurrency === 'LKR') {
            return $amount;
        }

        $rate = self::getCurrentRate($fromCurrency, 'LKR');
        
        if (!$rate) {
            throw new \Exception("Exchange rate not found for {$fromCurrency} to LKR");
        }

        return $amount * $rate;
    }

    /**
     * Convert amount from LKR to specified currency
     */
    public static function convertFromLKR(float $amount, string $toCurrency): float
    {
        if ($toCurrency === 'LKR') {
            return $amount;
        }

        $rate = self::getCurrentRate($toCurrency, 'LKR');
        
        if (!$rate) {
            throw new \Exception("Exchange rate not found for {$toCurrency} to LKR");
        }

        return $amount / $rate;
    }

    /**
     * Get or create default USD to LKR rate
     */
    public static function getOrCreateDefaultRate(): self
    {
        return self::firstOrCreate(
            ['from_currency' => 'USD', 'to_currency' => 'LKR'],
            ['rate' => 320.00] // Default rate
        );
    }
}
