<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnhancedReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Display inventory analytics
     */
    public function inventory()
    {
        $analytics = $this->reportService->getInventoryAnalytics();

        return Inertia::render('Reports/Inventory', [
            'analytics' => $analytics,
        ]);
    }

    /**
     * Display sales analytics
     */
    public function sales(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $analytics = $this->reportService->getSalesAnalytics($startDate, $endDate);
        $topProducts = $this->reportService->getTopSellingProducts(10, $startDate, $endDate);

        return Inertia::render('Reports/Sales', [
            'analytics' => $analytics,
            'topProducts' => $topProducts,
        ]);
    }

    /**
     * Display profit analytics
     */
    public function profit(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $analytics = $this->reportService->getProfitAnalytics($startDate, $endDate);

        return Inertia::render('Reports/Profit', [
            'analytics' => $analytics,
        ]);
    }

    /**
     * Display customer analytics
     */
    public function customers()
    {
        $analytics = $this->reportService->getCustomerAnalytics();

        return Inertia::render('Reports/Customers', [
            'analytics' => $analytics,
        ]);
    }

    /**
     * Get ABC analysis
     */
    public function abcAnalysis()
    {
        $analysis = $this->reportService->getABCAnalysis();

        return response()->json([
            'data' => $analysis,
        ]);
    }

    /**
     * Get dead stock report
     */
    public function deadStock(Request $request)
    {
        $days = $request->input('days', 90);
        $data = $this->reportService->getDeadStockReport((int) $days);

        return Inertia::render('Reports/DeadStock', [
            'data' => $data,
            'days' => $days
        ]);
    }

    /**
     * Get reorder report
     */
    public function reorderReport()
    {
        $data = $this->reportService->getReorderReport();

        return Inertia::render('Reports/Reorder', [
            'data' => $data
        ]);
    }

    /**
     * Export report to PDF/Excel (placeholder)
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'pdf'); // pdf or excel
        $reportType = $request->input('report', 'sales'); // inventory, sales, profit

        // TODO: Implement PDF/Excel export
        return response()->json([
            'message' => "Export functionality coming soon for {$reportType} report as {$type}",
        ]);
    }
}
