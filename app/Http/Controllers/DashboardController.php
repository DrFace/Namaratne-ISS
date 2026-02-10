<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sales;
use App\Models\SalesDetails;
use App\Models\SeriasNumber;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

use App\Services\DashboardService;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index()
    {
        $user = auth()->user();

        // Date range for analytics
        $startDateParam = request()->query('start_date');
        $endDateParam = request()->query('end_date');

        try {
            $rangeStart = $startDateParam ? Carbon::parse($startDateParam)->startOfDay() : Carbon::now()->subDays(29)->startOfDay();
            $rangeEnd = $endDateParam ? Carbon::parse($endDateParam)->endOfDay() : Carbon::now()->endOfDay();
        } catch (\Exception $e) {
            $rangeStart = Carbon::now()->subDays(29)->startOfDay();
            $rangeEnd = Carbon::now()->endOfDay();
        }

        if ($rangeStart->gt($rangeEnd)) {
            $tmp = $rangeStart; $rangeStart = $rangeEnd->copy()->startOfDay(); $rangeEnd = $tmp->copy()->endOfDay();
        }

        // Get customers with expired credit periods
        $expiredCreditCustomers = Customer::where('canPurchase', false)
            ->whereNotNull('creditPeriodExpiresAt')
            ->where('creditPeriodExpiresAt', '<', now())
            ->get()
            ->map(function ($customer) {
                $customer->daysOverdue = now()->diffInDays($customer->creditPeriodExpiresAt);
                return $customer;
            });

        return Inertia::render('Dashboard', [
            'kpis' => $this->dashboardService->getDetailedKPIs(),
            'charts' => [
                'salesLast30Days' => $this->dashboardService->getSalesTrend($rangeStart, $rangeEnd),
                'stockByCategory' => $this->dashboardService->getStockByCategory(),
                'topProducts' => $this->dashboardService->getTopProducts($rangeStart, $rangeEnd),
            ],
            'tables' => [
                'lowStockItems' => $this->dashboardService->getLowStockItems(),
                'outOfStockItems' => $this->dashboardService->getOutOfStockItems(),
                'recentTransactions' => $this->dashboardService->getRecentTransactions(),
            ],
            'permissions' => $user->getPermissions(),
            'userRole' => $user->getRoleName(),
            'isAdmin' => $user->isAdmin(),
            'expiredCreditCustomers' => $expiredCreditCustomers,
            'dateRange' => [
                'start' => $rangeStart->toDateString(),
                'end' => $rangeEnd->toDateString(),
            ],
        ]);
    }
}