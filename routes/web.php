<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/inventory', [InventoryController::class, 'index'])->name('products.index');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('products.store');
    Route::post('/stock', [InventoryController::class, 'addStock'])->name('stock.add');
    Route::get('/inventory/batches/{productId}', [InventoryController::class, 'getBatches'])->name('inventory.batches');
    Route::get('/inventory/{id}/edit', [InventoryController::class, 'show'])->name('products.edit');
    Route::put('/inventory/{id}', [InventoryController::class, 'update'])->name('products.update');
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy'])->name('products.destroy');
    Route::post('/serias', [InventoryController::class, 'seriasStore'])->name('serias.store');

    Route::get('/customer', [CustomerController::class, 'index'])->name('customer.index');
    Route::post('/customer', [CustomerController::class, 'store'])->name('customer.store');
    Route::get('/customer/{customer}/edit', [CustomerController::class, 'edit'])->name('customer.edit');
    Route::post('/customer/{customer}', [CustomerController::class, 'update'])->name('customer.update');
    Route::delete('/customer/{customer}', [CustomerController::class, 'destroy'])->name('customer.destroy');
    Route::post('/customer/{customer}/settle-credit', [CustomerController::class, 'settleCredit'])->name('customer.settle-credit');

    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('/billing', [BillingController::class, 'store'])->name('billing.store');
    Route::get('/customers/search', [BillingController::class, 'search']);
    Route::get('/billing/print/{id}', [BillingController::class, 'invoice']);
    // Route::get('/billing/{billing}/edit', [BillingController::class, 'edit'])->name('billing.edit');
    // Route::post('/billing/{billing}', [BillingController::class, 'update'])->name('billing.update');
    // Route::delete('/billing/{billing}', [BillingController::class, 'destroy'])->name('billing.destroy');

});

require __DIR__ . '/auth.php';
