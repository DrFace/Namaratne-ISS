<?php

namespace App\Http\Controllers;

use App\Models\CurrencyRate;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Display the settings page
     */
    public function index()
    {
        $vatNumber = \App\Models\Setting::getSetting('company_vat_number', '');
        
        // Get current currency rate
        $currencyRate = CurrencyRate::with('updatedByUser')->firstOrCreate(
            ['from_currency' => 'USD', 'to_currency' => 'LKR'],
            ['rate' => 320.00]
        );
        
        return inertia('Settings/Index', [
            'vatNumber' => $vatNumber,
            'currencyRate' => $currencyRate,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $request->validate([
            'vat_number' => 'nullable|string|max:50',
            'exchange_rate' => 'nullable|numeric|min:0.0001',
        ]);

        // Update VAT number
        if ($request->has('vat_number')) {
            \App\Models\Setting::setSetting(
                'company_vat_number',
                $request->vat_number,
                'Company VAT registration number'
            );
        }

        // Update exchange rate
        if ($request->has('exchange_rate')) {
            CurrencyRate::updateOrCreate(
                ['from_currency' => 'USD', 'to_currency' => 'LKR'],
                [
                    'rate' => $request->exchange_rate,
                    'updated_by' => auth()->id(),
                ]
            );
        }

        return back()->with('success', 'Settings updated successfully!');
    }
}
