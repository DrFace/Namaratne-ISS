<?php

namespace App\Http\Controllers;

use Spatie\Activitylog\Models\Activity;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $activities = Activity::with('causer')
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Audit/Index', [
            'activities' => $activities
        ]);
    }
}
