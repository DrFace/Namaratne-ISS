<?php

namespace App\Http\Controllers;

use App\Models\CurrencyRate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyRateController extends Controller
{
    /**
     * Display currency settings page
     */
    public function index()
    {
        $rate = CurrencyRate::with('updatedByUser')->firstOrCreate(
            ['from_currency' => 'USD', 'to_currency' => 'LKR'],
            ['rate' => 320.00]
        );
        
        return Inertia::render('Settings/Currency', [
            'currentRate' => $rate,
        ]);
    }

    /**
     * Update the exchange rate
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'rate' => 'required|numeric|min:0.0001',
        ]);

        $rate = CurrencyRate::updateOrCreate(
            ['from_currency' => 'USD', 'to_currency' => 'LKR'],
            [
                'rate' => $validated['rate'],
                'updated_by' => auth()->id(),
            ]
        );

        return redirect()->back()->with('success', 'Exchange rate updated successfully');
    }

    /**
     * API endpoint to get current rate
     */
    public function getCurrentRate()
    {
        $rate = CurrencyRate::getCurrentRate('USD', 'LKR');
        
        return response()->json([
            'from' => 'USD',
            'to' => 'LKR',
            'rate' => $rate ?? 320.00,
        ]);
    }

    /**
     * API endpoint to convert amount
     */
    public function convert(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'from' => 'required|in:LKR,USD',
            'to' => 'required|in:LKR,USD',
        ]);

        try {
            if ($validated['to'] === 'LKR') {
                $converted = CurrencyRate::convertToLKR(
                    $validated['amount'],
                    $validated['from']
                );
            } else {
                $converted = CurrencyRate::convertFromLKR(
                    $validated['amount'],
                    $validated['to']
                );
            }

            return response()->json([
                'original_amount' => $validated['amount'],
                'from_currency' => $validated['from'],
                'converted_amount' => round($converted, 2),
                'to_currency' => $validated['to'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
