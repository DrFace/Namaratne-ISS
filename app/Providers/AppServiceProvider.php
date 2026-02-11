<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Repositories\ProductRepository::class);
        $this->app->singleton(\App\Repositories\CustomerRepository::class);
        $this->app->singleton(\App\Repositories\SalesRepository::class);

        $this->app->bind(
            \App\Repositories\ProductRepositoryInterface::class,
            \App\Repositories\ProductRepository::class
        );
        $this->app->bind(
            \App\Repositories\CustomerRepositoryInterface::class,
            \App\Repositories\CustomerRepository::class
        );
        $this->app->bind(
            \App\Repositories\SalesRepositoryInterface::class,
            \App\Repositories\SalesRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production') || env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);
        
        // Force Inertia to reload assets on every deploy
        Inertia::version(function () {
            return md5_file(public_path('build/manifest.json'));
        });

        // Dynamic Permissions via Gates
        Gate::before(function ($user, $ability) {
            if ($user->isAdmin()) {
                return true;
            }
        });

        $permissions = [
            'add_products', 'edit_products', 'delete_products', 
            'restock_products', 'add_series', 'add_customers', 'edit_customers',
            'delete_customers', 'process_sale', 'view_reports'
        ];

        foreach ($permissions as $permission) {
            Gate::define($permission, function ($user) use ($permission) {
                return $user->hasPermission($permission);
            });
        }
    }
}
