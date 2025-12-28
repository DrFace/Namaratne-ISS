<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Display the settings page
     */
    public function index()
    {
        $vatNumber = \App\Models\Setting::getSetting('company_vat_number', '');
        
        return inertia('Settings/Index', [
            'vatNumber' => $vatNumber,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $request->validate([
            'vat_number' => 'nullable|string|max:50',
        ]);

        \App\Models\Setting::setSetting(
            'company_vat_number',
            $request->vat_number,
            'Company VAT registration number'
        );

        return back()->with('success', 'Settings updated successfully!');
    }
}
