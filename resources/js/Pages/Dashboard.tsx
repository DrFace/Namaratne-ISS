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
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 font-Inter">
                        Hi, {user.first_name}
                    </h1>
                    <p className="text-sm text-gray-600">
                        Here's your inventory overview and analytics
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {hasPermission("view_total_stock_value") && (
                        <KPICard
                            title="Total Stock Value"
                            value={formatCurrency(kpis?.totalStockValue || 0)}
                            icon={<DollarSign className="w-6 h-6" />}
                            color="blue"
                        />
                    )}
                    {hasPermission("view_total_products") && (
                        <KPICard
                            title="Total Products / SKUs"
                            value={kpis?.totalProducts || 0}
                            icon={<Package className="w-6 h-6" />}
                            color="green"
                        />
                    )}
                    {hasPermission("view_low_stock_count") && (
                        <div
                            onClick={() => scrollToSection(lowStockRef)}
                            className="cursor-pointer"
                        >
                            <KPICard
                                title="Low Stock Items"
                                value={kpis?.lowStockCount || 0}
                                icon={<TrendingDown className="w-6 h-6" />}
                                color="orange"
                            />
                        </div>
                    )}
                    {hasPermission("view_out_of_stock_count") && (
                        <div
                            onClick={() => scrollToSection(outOfStockRef)}
                            className="cursor-pointer"
                        >
                            <KPICard
                                title="Out of Stock Items"
                                value={kpis?.outOfStockCount || 0}
                                icon={<AlertTriangle className="w-6 h-6" />}
                                color="red"
                            />
                        </div>
                    )}
                </div>

                {/* Sales KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {hasPermission("view_today_sales") && (
                        <KPICard
                            title="Today's Sales"
                            value={formatCurrency(kpis?.todaySalesValue || 0)}
                            subtitle={`${kpis?.todaySalesCount || 0} invoices`}
                            icon={<ShoppingCart className="w-6 h-6" />}
                            color="purple"
                        />
                    )}
                    {hasPermission("view_month_sales") && (
                        <KPICard
                            title="This Month's Sales"
                            value={formatCurrency(kpis?.thisMonthSales || 0)}
                            icon={<Calendar className="w-6 h-6" />}
                            color="indigo"
                        />
                    )}
                    {hasPermission("view_month_profit") && (
                        <KPICard
                            title="This Month's Profit"
                            value={formatCurrency(kpis?.thisMonthProfit || 0)}
                            subtitle="Estimated gross profit"
                            icon={<TrendingUp className="w-6 h-6" />}
                            color="emerald"
                        />
                    )}
                </div>

                {/* Expired Credit Customers Widget */}
                <ExpiredCreditCustomersWidget />

                {/* Date Range Filter (ONLY for Sales Trend, Top 5, Recent Transactions) */}
                {showAnalyticsFilter && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                            <div className="flex-1">
                                <div className="text-lg font-semibold text-gray-800 mb-2">
                                    Analytics Date Range
                                </div>
                                <div className="text-sm text-gray-600">
                                    Applies only to Sales Trend, Top 5 Selling
                                    Products, and Recent Transactions.
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-600 mb-1">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-600 mb-1">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="flex gap-2 sm:self-end">
                                    <button
                                        onClick={applyDateRange}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                                        disabled={!startDate || !endDate}
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={clearDateRange}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Sales Trend */}
                    {hasPermission("view_sales_trend") && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Sales Trend
                            </h2>
                            <div className="h-64">
                                <Line
                                    data={salesChartData}
                                    options={chartOptions}
                                />
                            </div>
                        </div>
                    )}

                    {/* Stock by Category */}
                    {hasPermission("view_stock_by_category") && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Stock by Category
                            </h2>
                            <div className="h-64 flex items-center justify-center">
                                {charts?.stockByCategory?.length > 0 ? (
                                    <Doughnut
                                        data={categoryChartData}
                                        options={chartOptions}
                                    />
                                ) : (
                                    <p className="text-gray-500">
                                        No category data available
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Products Chart */}
                {hasPermission("view_top_selling_products") && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Top 5 Selling Products
                        </h2>
                        <div className="h-64">
                            {charts?.topProducts?.length > 0 ? (
                                <Bar
                                    data={topProductsChartData}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: "y" as const,
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">
                                        No sales data available
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tables Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Low Stock Table */}
                    {hasPermission("view_low_stock_alerts") && (
                        <div
                            className="bg-white rounded-2xl shadow-sm p-6"
                            ref={lowStockRef}
                        >
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-orange-500" />
                                Low Stock Alert
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">
                                                Product
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">
                                                Code
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">
                                                Series
                                            </th>
                                            <th className="text-center py-2 px-2 font-medium text-gray-600">
                                                Current
                                            </th>
                                            <th className="text-center py-2 px-2 font-medium text-gray-600">
                                                Threshold
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tables?.lowStockItems?.length > 0 ? (
                                            tables.lowStockItems.map(
                                                (item: any) => (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b hover:bg-blue-50 cursor-pointer transition"
                                                        onClick={() =>
                                                            handleProductClick(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        <td className="py-2 px-2">
                                                            {item.productName ||
                                                                "_"}
                                                        </td>
                                                        <td className="py-2 px-2 text-gray-600">
                                                            {item.productCode ||
                                                                "_"}
                                                        </td>
                                                        <td className="py-2 px-2 text-gray-600">
                                                            {item.series || "_"}
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <span className="text-orange-600 font-semibold">
                                                                {item.quantity ??
                                                                    "_"}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-2 text-center text-gray-600">
                                                            {item.lowStock ??
                                                                "_"}
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="text-center py-4 text-gray-500"
                                                >
                                                    No low stock items
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Out of Stock Table */}
                    {hasPermission("view_out_of_stock_alerts") && (
                        <div
                            className="bg-white rounded-2xl shadow-sm p-6"
                            ref={outOfStockRef}
                        >
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Out of Stock
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">
                                                Product
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">
                                                Code
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">
                                                Series
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">
                                                Batch
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tables?.outOfStockItems?.length > 0 ? (
                                            tables.outOfStockItems.map(
                                                (item: any) => (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b hover:bg-blue-50 cursor-pointer transition"
                                                        onClick={() =>
                                                            handleProductClick(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        <td className="py-2 px-2">
                                                            {item.productName ||
                                                                "_"}
                                                        </td>
                                                        <td className="py-2 px-2 text-gray-600">
                                                            {item.productCode ||
                                                                "_"}
                                                        </td>
                                                        <td className="py-2 px-2 text-gray-600">
                                                            {item.series || "_"}
                                                        </td>
                                                        <td className="py-2 px-2 text-gray-600">
                                                            {item.batchNumber ||
                                                                "_"}
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="text-center py-4 text-gray-500"
                                                >
                                                    No out of stock items
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                {hasPermission("view_recent_transactions") && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Recent Transactions
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-2 font-medium text-gray-600">
                                            Bill #
                                        </th>
                                        <th className="text-left py-2 px-2 font-medium text-gray-600">
                                            Date
                                        </th>
                                        <th className="text-left py-2 px-2 font-medium text-gray-600">
                                            Customer
                                        </th>
                                        <th className="text-right py-2 px-2 font-medium text-gray-600">
                                            Amount
                                        </th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-600">
                                            Payment
                                        </th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-600">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tables?.recentTransactions?.length > 0 ? (
                                        tables.recentTransactions.map(
                                            (transaction: any) => (
                                                <tr
                                                    key={transaction.id}
                                                    className="border-b hover:bg-gray-50"
                                                >
                                                    <td className="py-2 px-2 font-mono text-xs">
                                                        {transaction.billNumber}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-600">
                                                        {transaction.date}
                                                    </td>
                                                    <td className="py-2 px-2">
                                                        {
                                                            transaction.customerName
                                                        }
                                                    </td>
                                                    <td className="py-2 px-2 text-right font-semibold">
                                                        {formatCurrency(
                                                            transaction.amount,
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-2 text-center">
                                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 capitalize">
                                                            {
                                                                transaction.paymentMethod
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-2 text-center">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs capitalize ${
                                                                transaction.status ===
                                                                "approved"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : transaction.status ===
                                                                        "pending"
                                                                      ? "bg-yellow-100 text-yellow-700"
                                                                      : "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            {transaction.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                No recent transactions
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Details Modal */}
            {showProductModal && selectedProduct && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowProductModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                Product Details
                            </h3>
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600 font-medium">
                                    Product Name:
                                </span>
                                <span className="text-gray-800 font-semibold">
                                    {selectedProduct.productName}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600 font-medium">
                                    Product Code:
                                </span>
                                <span className="text-gray-800 font-mono text-sm">
                                    {selectedProduct.productCode}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600 font-medium">
                                    Batch Number:
                                </span>
                                <span className="text-gray-800">
                                    {selectedProduct.batchNumber || "_"}
                                </span>
                            </div>
                            {selectedProduct.quantity !== undefined && (
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600 font-medium">
                                        Current Stock:
                                    </span>
                                    <span className="text-gray-800 font-bold">
                                        {selectedProduct.quantity}
                                    </span>
                                </div>
                            )}
                            {selectedProduct.lowStock && (
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600 font-medium">
                                        Low Stock Threshold:
                                    </span>
                                    <span className="text-gray-800">
                                        {selectedProduct.lowStock}
                                    </span>
                                </div>
                            )}
                            {selectedProduct.buyingPrice && (
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600 font-medium">
                                        Buying Price:
                                    </span>
                                    <span className="text-gray-800">
                                        {formatCurrency(
                                            selectedProduct.buyingPrice,
                                        )}
                                    </span>
                                </div>
                            )}
                            {selectedProduct.sellingPrice && (
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600 font-medium">
                                        Selling Price:
                                    </span>
                                    <span className="text-gray-800 font-semibold">
                                        {formatCurrency(
                                            selectedProduct.sellingPrice,
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowProductModal(false)}
                            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </Authenticated>
    );
}

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color:
        | "blue"
        | "green"
        | "orange"
        | "red"
        | "purple"
        | "indigo"
        | "emerald";
}

function KPICard({ title, value, subtitle, icon, color }: KPICardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="text-sm text-gray-600 font-medium">{title}</div>
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                {subtitle && (
                    <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
                )}
            </div>
        </div>
    );
}
