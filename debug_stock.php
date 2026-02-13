<?php

use Illuminate\Http\Request;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

// Login a user
$user = \App\Models\User::first();
if (!$user) {
    die("No users found.\n");
}
auth()->login($user);

echo "Testing Stock Addition API...\n\n";

// Test data for new batch
$testData = [
    'mode' => 'new',
    'productId' => 6, // Adjust this to an existing product ID
    'quantity' => 10,
    'buyingPrice' => 100.00,
    'tax' => 5.00,
    'profitMargin' => 20.00,
    'sellingPrice' => 125.00,
    'batchNumber' => 'TEST-BATCH-' . time(),
    'purchaseDate' => date('Y-m-d'),
];

echo "Request Data:\n";
print_r($testData);
echo "\n";

try {
    $request = Request::create('/stock', 'POST', $testData);
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
    
    $controller = app()->make(\App\Http\Controllers\InventoryController::class);
    $response = $controller->addStock($request);
    
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Content:\n";
    echo $response->getContent() . "\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
