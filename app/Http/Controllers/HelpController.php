<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HelpController extends Controller
{
    /**
     * Display the Help/User Manual page.
     */
    public function index()
    {
        return Inertia::render('Help/Index');
    }
}
