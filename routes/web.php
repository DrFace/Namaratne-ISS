<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\CurrencyRateController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
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

    // Currency routes
    Route::get('/settings/currency', [CurrencyRateController::class, 'index'])->name('currency.index');
    Route::post('/settings/currency', [CurrencyRateController::class, 'update'])->name('currency.update');
    Route::get('/api/currency/rate', [CurrencyRateController::class, 'getCurrentRate']);
    Route::post('/api/currency/convert', [CurrencyRateController::class, 'convert']);
    // Route::get('/billing/{billing}/edit', [BillingController::class, 'edit'])->name('billing.edit');
    // Route::post('/billing/{billing}', [BillingController::class, 'update'])->name('billing.update');
    // Route::delete('/billing/{billing}', [BillingController::class, 'destroy'])->name('billing.destroy');

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/permissions', [PermissionController::class, 'index'])->name('permissions.index');
        Route::post('/admin/permissions', [PermissionController::class, 'update'])->name('permissions.update');
        Route::get('/admin/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('/admin/users/{id}/role', [UserManagementController::class, 'updateRole'])->name('users.updateRole');
        
        // Settings routes
        Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
        Route::post('/settings', [\App\Http\Controllers\SettingsController::class, 'update'])->name('settings.update');
        
        // Discount Categories routes
        Route::get('/discount-categories', [\App\Http\Controllers\DiscountCategoryController::class, 'index'])->name('discount-categories.index');
        Route::post('/discount-categories', [\App\Http\Controllers\DiscountCategoryController::class, 'store'])->name('discount-categories.store');
        Route::put('/discount-categories/{id}', [\App\Http\Controllers\DiscountCategoryController::class, 'update'])->name('discount-categories.update');
        Route::delete('/discount-categories/{id}', [\App\Http\Controllers\DiscountCategoryController::class, 'destroy'])->name('discount-categories.destroy');
        Route::post('/discount-categories/{id}/customers', [\App\Http\Controllers\DiscountCategoryController::class, 'assignCustomer'])->name('discount-categories.assign-customer');
        Route::delete('/discount-categories/{id}/customers/{customerId}', [\App\Http\Controllers\DiscountCategoryController::class, 'removeCustomer'])->name('discount-categories.remove-customer');
    });

    // API route for getting user permissions
    Route::get('/api/user/permissions', [PermissionController::class, 'getUserPermissions']);
});

require __DIR__ . '/auth.php';
