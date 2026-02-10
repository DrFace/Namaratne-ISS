<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Http\Resources\V1\ReportResource;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Get high-level dashboard metrics
     */
    public function index()
    {
        return new ReportResource([
            'kpis' => $this->dashboardService->getDetailedKPIs(),
            'trends' => $this->dashboardService->getSalesTrend(now()->subDays(30), now()),
            'recent_transactions' => $this->dashboardService->getRecentTransactions(5),
            'low_stock' => $this->dashboardService->getLowStockItems(5),
        ]);
    }
}
