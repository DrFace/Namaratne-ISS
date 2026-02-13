<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "APP_ENV: " . env('APP_ENV') . "\n";

$routes = Illuminate\Support\Facades\Route::getRoutes();
$found = false;
foreach ($routes as $route) {
    if (str_contains($route->getName(), 'warehouses')) {
        echo "Match: " . $route->getName() . " | " . $route->uri() . " | " . $route->getActionName() . "\n";
        $found = true;
    }
}
if (!$found) {
    echo "No routes matching 'warehouses' found.\n";
}
