import { usePage, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import {
    Package,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Calendar,
    X,
} from "lucide-react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import ExpiredCreditCustomersWidget from "@/Components/Dashboard/ExpiredCreditCustomersWidget";
import Card from "@/Components/UI/Card";
import StatsCard from "@/Components/UI/StatsCard";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import EmptyState from "@/Components/UI/EmptyState";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
);

interface DashboardProps {
    kpis: {
        totalStockValue: number;
        totalProducts: number;
        lowStockCount: number;
        outOfStockCount: number;
        todaySalesValue: number;
        todaySalesCount: number;
        thisMonthSales: number;
        thisMonthProfit: number;
    };
    charts: {
        salesLast30Days: {
            labels: string[];
            data: number[];
        };
        stockByCategory: Array<{
            category: string;
            quantity: number;
        }>;
        topProducts: Array<{
            productName: string;
            productCode: string;
            totalSold: number;
        }>;
    };
    tables: {
        lowStockItems: Array<{
            id: number;
            productName: string;
            productCode: string;
            quantity: number;
            lowStock: number;
            batchNumber: string;
            buyingPrice: number;
            sellingPrice: number;
            series: string;
        }>;
        outOfStockItems: Array<{
            id: number;
            productName: string;
            productCode: string;
            batchNumber: string;
            buyingPrice: number;
            sellingPrice: number;
            updated_at: string;
            series: string;
        }>;
        recentTransactions: Array<{
            id: number;
            billNumber: string;
            customerName: string;
            amount: number;
            paymentMethod: string;
            status: string;
            date: string;
            createdBy: string;
        }>;
    };
    dateRange: {
        start: string;
        end: string;
    };
}

export default function Dashboard() {
    const { auth, kpis, charts, tables, permissions, isAdmin, dateRange } =
        usePage().props as any;
    const user = auth.user;
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const lowStockRef = useRef<HTMLDivElement>(null);
    const outOfStockRef = useRef<HTMLDivElement>(null);

    const [startDate, setStartDate] = useState<string>(dateRange?.start || "");
    const [endDate, setEndDate] = useState<string>(dateRange?.end || "");

    // Helper function to check if user has permission
    const hasPermission = (permission: string) => {
        if (isAdmin) return true; // Admins have all permissions
        return permissions && permissions.includes(permission);
    };

    const showAnalyticsFilter =
        hasPermission("view_sales_trend") ||
        hasPermission("view_top_selling_products") ||
        hasPermission("view_recent_transactions");

    const applyDateRange = () => {
        router.get(
            route("dashboard"),
            { start_date: startDate, end_date: endDate },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearDateRange = () => {
        router.get(
            route("dashboard"),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Handle product click
    const handleProductClick = (product: any) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    // Scroll to section with offset for fixed header
    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            const yOffset = -120; // Offset for fixed header/navbar
            const y =
                ref.current.getBoundingClientRect().top +
                window.pageYOffset +
                yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Sales Trend Chart Data
    const salesChartData = {
        labels:
            charts?.salesLast30Days?.labels?.map((date: string) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
            }) || [],
        datasets: [
            {
                label: "Sales",
                data: charts?.salesLast30Days?.data || [],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // Stock by Category Chart Data
    const categoryChartData = {
        labels:
            charts?.stockByCategory?.map((item: any) => item.category) || [],
        datasets: [
            {
                data:
                    charts?.stockByCategory?.map(
                        (item: any) => item.quantity,
                    ) || [],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(251, 146, 60, 0.8)",
                    "rgba(168, 85, 247, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(14, 165, 233, 0.8)",
                ],
                borderWidth: 0,
            },
        ],
    };

    // Top Products Chart Data
    const topProductsChartData = {
        labels:
            charts?.topProducts?.map(
                (item: any) => `${item.productName} (${item.productCode})`,
            ) || [],
        datasets: [
            {
                label: "Units Sold",
                data:
                    charts?.topProducts?.map((item: any) => item.totalSold) ||
                    [],
                backgroundColor: "rgba(34, 197, 94, 0.8)",
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top" as const,
            },
        },
    };

    return (
        <Authenticated bRoutes={undefined}>
            <div className="p-4 md:p-8 space-y-6 animate-premium-in">
                <Breadcrumbs items={[]} />
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{user.first_name}</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Here's what's happening with your inventory today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" icon={<Calendar className="w-4 h-4" />}>
                            {new Date().toLocaleDateString('en-LK', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {hasPermission("view_total_stock_value") && (
                        <StatsCard
                            title="Total Stock Value"
                            value={formatCurrency(kpis?.totalStockValue || 0)}
                            icon={DollarSign}
                            color="blue"
                        />
                    )}
                    {hasPermission("view_total_products") && (
                        <StatsCard
                            title="Total Products"
                            value={kpis?.totalProducts || 0}
                            icon={Package}
                            color="emerald"
                        />
                    )}
                    {hasPermission("view_low_stock_count") && (
                        <StatsCard
                            title="Low Stock"
                            value={kpis?.lowStockCount || 0}
                            icon={TrendingDown}
                            color="amber"
                            onClick={() => scrollToSection(lowStockRef)}
                        />
                    )}
                    {hasPermission("view_out_of_stock_count") && (
                        <StatsCard
                            title="Out of Stock"
                            value={kpis?.outOfStockCount || 0}
                            icon={AlertTriangle}
                            color="rose"
                            onClick={() => scrollToSection(outOfStockRef)}
                        />
                    )}
                </div>

                {/* Sales KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {hasPermission("view_today_sales") && (
                        <StatsCard
                            title="Today's Sales"
                            value={formatCurrency(kpis?.todaySalesValue || 0)}
                            description={`${kpis?.todaySalesCount || 0} invoices today`}
                            icon={ShoppingCart}
                            color="indigo"
                        />
                    )}
                    {hasPermission("view_month_sales") && (
                        <StatsCard
                            title="Monthly Sales"
                            value={formatCurrency(kpis?.thisMonthSales || 0)}
                            icon={Calendar}
                            color="indigo"
                        />
                    )}
                    {hasPermission("view_month_profit") && (
                        <StatsCard
                            title="Monthly Profit"
                            value={formatCurrency(kpis?.thisMonthProfit || 0)}
                            description="Estimated gross profit"
                            icon={TrendingUp}
                            color="emerald"
                        />
                    )}
                </div>

                {/* Expired Credit Customers Widget */}
                <ExpiredCreditCustomersWidget />

                {/* Date Range Filter */}
                {showAnalyticsFilter && (
                    <Card className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="max-w-md">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Analytics Date Range
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Apply filters to Sales Trend, Top Products, and Transactions.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-end gap-3 flex-1 lg:justify-end">
                                <div className="w-full sm:w-48">
                                    <Input
                                        label="From"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>

                                <div className="w-full sm:w-48">
                                    <Input
                                        label="To"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button 
                                        onClick={applyDateRange}
                                        disabled={!startDate || !endDate}
                                        className="flex-1 sm:flex-none"
                                    >
                                        Apply
                                    </Button>
                                    <Button 
                                        variant="secondary"
                                        onClick={clearDateRange}
                                        className="flex-1 sm:flex-none"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Sales Trend */}
                    {hasPermission("view_sales_trend") && (
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                                    Sales Revenue Trend
                                </h2>
                                <Badge variant="primary">Last 30 Days</Badge>
                            </div>
                            <div className="h-72">
                                <Line
                                    data={salesChartData}
                                    options={{
                                        ...chartOptions,
                                        scales: {
                                            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                                            x: { grid: { display: false } }
                                        }
                                    }}
                                />
                            </div>
                        </Card>
                    )}

                    {/* Stock by Category */}
                    {hasPermission("view_stock_by_category") && (
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-emerald-500" />
                                Inventory Distribution
                            </h2>
                            <div className="h-72 flex items-center justify-center">
                                {charts?.stockByCategory?.length > 0 ? (
                                    <Doughnut
                                        data={categoryChartData}
                                        options={{
                                            ...chartOptions,
                                            cutout: '70%',
                                        }}
                                    />
                                ) : (
                                    <p className="text-gray-500 italic">No category data available</p>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Top Products Chart */}
                {hasPermission("view_top_selling_products") && (
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-violet-500" />
                            Top Perfoming Products
                        </h2>
                        <div className="h-72">
                            {charts?.topProducts?.length > 0 ? (
                                <Bar
                                    data={topProductsChartData}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: "y" as const,
                                        scales: {
                                            x: { grid: { color: 'rgba(0,0,0,0.05)' } },
                                            y: { grid: { display: false } }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500 italic">No sales data available</p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Tables Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Low Stock Table */}
                    {hasPermission("view_low_stock_alerts") && (
                        <Card className="p-6" ref={lowStockRef}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5 text-orange-500" />
                                    Low Stock Alerts
                                </h2>
                                <Badge variant="warning">{tables?.lowStockItems?.length || 0} Items</Badge>
                            </div>
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                            <th className="pb-3 font-semibold">Product</th>
                                            <th className="pb-3 font-semibold text-center">In Stock</th>
                                            <th className="pb-3 font-semibold text-center">Threshold</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                                        {tables?.lowStockItems?.length > 0 ? (
                                            tables.lowStockItems.map((item: any) => (
                                                <tr
                                                    key={item.id}
                                                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                                                    onClick={() => handleProductClick(item)}
                                                >
                                                    <td className="py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white">{item.productName}</div>
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{item.productCode}</div>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <Badge variant="error" className="tabular-nums font-bold">
                                                            {item.quantity}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 text-center text-gray-400 tabular-nums">
                                                        {item.lowStock}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-8">
                                                    <EmptyState 
                                                        title="No Low Stock Items" 
                                                        description="Your inventory levels are healthy across all products."
                                                        icon={Package}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* Out of Stock Table */}
                    {hasPermission("view_out_of_stock_alerts") && (
                        <Card className="p-6" ref={outOfStockRef}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    Critically Out of Stock
                                </h2>
                                <Badge variant="error">{tables?.outOfStockItems?.length || 0} SKUs</Badge>
                            </div>
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                            <th className="pb-3 font-semibold">Product</th>
                                            <th className="pb-3 font-semibold">Vehicle</th>
                                            <th className="pb-3 font-semibold">Batch</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                                        {tables?.outOfStockItems?.length > 0 ? (
                                            tables.outOfStockItems.map((item: any) => (
                                                <tr
                                                    key={item.id}
                                                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                                                    onClick={() => handleProductClick(item)}
                                                >
                                                    <td className="py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white">{item.productName}</div>
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{item.productCode}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="text-gray-600 dark:text-gray-300">{item.series || "_"}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <Badge variant="neutral" className="font-mono">{item.batchNumber || "N/A"}</Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-8">
                                                    <EmptyState 
                                                        title="Inventory is Healthy" 
                                                        description="All products are currently in stock."
                                                        icon={Package}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Recent Transactions */}
                {hasPermission("view_recent_transactions") && (
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShoppingCart className="w-6 h-6 text-indigo-500" />
                                Recent Transactions
                            </h2>
                            <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                                View All
                            </Button>
                        </div>
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                        <th className="pb-4 font-semibold px-2">Invoice #</th>
                                        <th className="pb-4 font-semibold px-2">Date</th>
                                        <th className="pb-4 font-semibold px-2">Customer</th>
                                        <th className="pb-4 font-semibold px-2 text-right">Amount</th>
                                        <th className="pb-4 font-semibold px-2 text-center">Payment</th>
                                        <th className="pb-4 font-semibold px-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                                    {tables?.recentTransactions?.length > 0 ? (
                                        tables.recentTransactions.map((transaction: any) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="py-5 px-2 font-black text-xs text-gray-900 dark:text-white">
                                                    #{transaction.billNumber}
                                                </td>
                                                <td className="py-5 px-2 text-gray-500 dark:text-gray-400">
                                                    {transaction.date}
                                                </td>
                                                <td className="py-5 px-2 font-bold text-gray-900 dark:text-white">
                                                    {transaction.customerName}
                                                </td>
                                                <td className="py-5 px-2 text-right font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                                    {formatCurrency(transaction.amount)}
                                                </td>
                                                <td className="py-5 px-2 text-center">
                                                    <Badge variant="neutral" className="uppercase">{transaction.paymentMethod}</Badge>
                                                </td>
                                                <td className="py-5 px-2 text-center">
                                                    <Badge 
                                                        variant={transaction.status === "approved" ? "success" : "warning"}
                                                        className="capitalize"
                                                    >
                                                        {transaction.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12">
                                                <EmptyState 
                                                    title="No Transactions Found" 
                                                    description="We couldn't find any recent sales records for this period."
                                                    icon={ShoppingCart}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* Product Details Modal */}
            {showProductModal && selectedProduct && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowProductModal(false)}
                >
                    <Card
                        className="max-w-md w-full p-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowProductModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Product Details
                            </h3>
                            <Badge variant="neutral" className="mt-2">
                                {selectedProduct.productCode}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Item Name</span>
                                <span className="text-gray-900 dark:text-white font-bold">{selectedProduct.productName}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Vehicle Type</span>
                                <span className="text-gray-900 dark:text-white">{selectedProduct.series || "_"}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Batch Number</span>
                                <Badge variant="info">{selectedProduct.batchNumber || "UNBATCHED"}</Badge>
                            </div>
                            {selectedProduct.quantity !== undefined && (
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Current Stock</span>
                                    <span className={`text-lg font-extrabold ${selectedProduct.quantity <= (selectedProduct.lowStock || 0) ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {selectedProduct.quantity}
                                    </span>
                                </div>
                            )}
                            {selectedProduct.sellingPrice && (
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Retail Price</span>
                                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                        {formatCurrency(selectedProduct.sellingPrice)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={() => setShowProductModal(false)}
                            className="mt-8 w-full"
                        >
                            Close Detail
                        </Button>
                    </Card>
                </div>
            )}
        </Authenticated>
    );
}

// KPICard removed as it's replaced by StatsCard component
