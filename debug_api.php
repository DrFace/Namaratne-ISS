<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\ProductController;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Request::create('/api/v1/products', 'GET')
);

// We want to simulate the Controller call directly to avoid Auth middleware blocking us in this CLI script
// OR we can login a user.
echo "Simulating Authenticated Request...\n";

try {
    $kernel->bootstrap();
    
    // Login a user manually
    $user = \App\Models\User::first();
    if (!$user) {
        die("No users found to authenticate with.\n");
    }
    auth()->login($user);
    
    // Resolve Controller
    $controller = app()->make(ProductController::class);
    
    // Create Request
    $request = Request::create('/api/v1/products', 'GET');
    
    // Call index
    $response = $controller->index($request);
    
    // Output
    echo "Response Status: " . (method_exists($response, 'status') ? $response->status() : 'N/A') . "\n";
    
    $content = json_encode($response);
    if (strlen($content) > 1000) {
        echo "Response Content (truncated): " . substr($content, 0, 1000) . "...\n";
    } else {
        echo "Response Content: " . $content . "\n";
    }
    
    $resourceCollection = $response; 
    // If it's a ResourceCollection, we can access ->response()->getData()
    if ($resourceCollection instanceof \Illuminate\Http\Resources\Json\AnonymousResourceCollection) {
         $data = $resourceCollection->response()->getData(true); // true for array
         echo "Product Count: " . count($data['data']) . "\n";
         if (count($data['data']) > 0) {
             echo "First Product: " . json_encode($data['data'][0]) . "\n";
         }
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
