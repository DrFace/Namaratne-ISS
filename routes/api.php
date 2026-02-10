<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API v1 Routes
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    
    // Dashboard API
    Route::get('/dashboard', [App\Http\Controllers\Api\V1\DashboardController::class, 'index']);
    
    // Global Search API
    Route::get('/search', [App\Http\Controllers\Api\GlobalSearchController::class, 'search']);
    
    // Products API
    Route::prefix('products')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\V1\ProductController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\V1\ProductController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Api\V1\ProductController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Api\V1\ProductController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Api\V1\ProductController::class, 'destroy']);
        Route::get('/low-stock/{threshold?}', [App\Http\Controllers\Api\V1\ProductController::class, 'lowStock']);
        Route::get('/expiring/{days?}', [App\Http\Controllers\Api\V1\ProductController::class, 'expiring']);
        Route::post('/bulk-delete', [App\Http\Controllers\Api\V1\ProductController::class, 'bulkDelete']);
        Route::post('/bulk-update', [App\Http\Controllers\Api\V1\ProductController::class, 'bulkUpdate']);
        Route::post('/bulk-export', [App\Http\Controllers\Api\V1\ProductController::class, 'bulkExport']);
        Route::get('/export', [App\Http\Controllers\Api\V1\ProductController::class, 'export']);
    });

    // Customers API
    Route::prefix('customers')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\V1\CustomerController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\V1\CustomerController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Api\V1\CustomerController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Api\V1\CustomerController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Api\V1\CustomerController::class, 'destroy']);
        Route::post('/{id}/settle-credit', [App\Http\Controllers\Api\V1\CustomerController::class, 'settleCredit']);
        Route::get('/{id}/transactions', [App\Http\Controllers\Api\V1\CustomerController::class, 'transactions']);
    });

    // Sales API
    Route::prefix('sales')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\V1\SalesController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\V1\SalesController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Api\V1\SalesController::class, 'show']);
        Route::get('/daily-summary/{date?}', [App\Http\Controllers\Api\V1\SalesController::class, 'dailySummary']);
    });

    // Reports API
    Route::prefix('reports')->group(function () {
        Route::get('/inventory', [App\Http\Controllers\Api\V1\ReportController::class, 'inventory']);
        Route::get('/sales', [App\Http\Controllers\Api\V1\ReportController::class, 'sales']);
        Route::get('/profit', [App\Http\Controllers\Api\V1\ReportController::class, 'profit']);
        Route::get('/dead-stock', [App\Http\Controllers\EnhancedReportController::class, 'deadStock']);
        Route::get('/reorder-list', [App\Http\Controllers\EnhancedReportController::class, 'reorderReport']);
    });

    // Unit Management API
    Route::apiResource('units', App\Http\Controllers\UnitController::class);

    // Quotations API
    Route::prefix('quotations')->group(function () {
        Route::get('/', [App\Http\Controllers\QuotationController::class, 'index']); // Note: Controller currently returns Inertia for index, might need API version later
        Route::post('/', [App\Http\Controllers\QuotationController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\QuotationController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\QuotationController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\QuotationController::class, 'destroy']);
        Route::post('/{id}/convert', [App\Http\Controllers\QuotationController::class, 'convertToInvoice']);
    });

    // Payments API (directly on payments for history or via sale)
    Route::prefix('payments')->group(function () {
        Route::get('/history', [App\Http\Controllers\PaymentController::class, 'history']);
        Route::delete('/{payment}', [App\Http\Controllers\PaymentController::class, 'destroy']);
    });

    // Returns API
    Route::prefix('returns')->group(function () {
        Route::get('/', [App\Http\Controllers\ReturnController::class, 'index']);
        Route::post('/', [App\Http\Controllers\ReturnController::class, 'apiStore']);
        Route::get('/{id}', [App\Http\Controllers\ReturnController::class, 'show']);
    });

    // Warehouse API
    Route::apiResource('warehouses', App\Http\Controllers\WarehouseController::class);
    Route::get('/products/{product}/warehouse-stock', [App\Http\Controllers\WarehouseController::class, 'productStock']);

    // Transfers API
    Route::post('/transfers/{transfer}/complete', [App\Http\Controllers\WarehouseTransferController::class, 'complete']);
    Route::apiResource('transfers', App\Http\Controllers\WarehouseTransferController::class)->only(['index', 'store', 'show']);
});
