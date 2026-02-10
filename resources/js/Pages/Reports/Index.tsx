import Authenticated from "@/Layouts/AuthenticatedLayout";
import { DocumentTextIcon, UserGroupIcon, ArchiveBoxIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { router } from "@inertiajs/react";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import Card from "@/Components/UI/Card";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";

export default function ReportsIndex() {
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ name: string; href: string } | null>(null);

  // Calculate default dates (1 month ago to today)
  const getDefaultDates = () => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDates());

  const reportTypes = [
    {
      name: "Customer Report",
      description: "Complete list of all customers with contact details and total sales",
      href: route("reports.customers"),
      icon: UserGroupIcon,
      color: "blue",
      requiresDateRange: false,
    },
    {
      name: "Payment Report",
      description: "Detailed payment history with cash, card, and credit transactions",
      href: route("reports.payments"),
      icon: DocumentTextIcon,
      color: "green",
      requiresDateRange: true,
    },
    {
      name: "Inventory Report",
      description: "Current inventory levels, stock status, and product values",
      href: route("reports.inventory"),
      icon: ArchiveBoxIcon,
      color: "purple",
      requiresDateRange: false,
    },
    {
      name: "Sales Movement Report",
      description: "Product-wise sales transactions and movement history",
      href: route("reports.sales-movement"),
      icon: ArrowTrendingUpIcon,
      color: "orange",
      requiresDateRange: true,
    },
    // Future reports can be added here
  ];

  const handleReportClick = (report: any) => {
    if (report.requiresDateRange) {
      setSelectedReport(report);
      setDateRange(getDefaultDates());
      setShowDateModal(true);
    } else {
      router.visit(report.href);
    }
  };

  const handleGenerateReport = () => {
    if (selectedReport) {
      const url = `${selectedReport.href}?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`;
      router.visit(url);
      setShowDateModal(false);
    }
  };

  return (
    <Authenticated>
      <div className="flex-1 p-6 space-y-6 animate-premium-in min-h-screen bg-gray-50/50">
        <Breadcrumbs items={[{ label: 'Reports', href: route('reports.index') }]} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Reports Center</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Generate and export system data for business analysis.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reportTypes.map((report) => (
            <Card
              key={report.name}
              onClick={() => handleReportClick(report)}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-none bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl bg-${report.color}-50 dark:bg-${report.color}-900/20 text-${report.color}-600 dark:text-${report.color}-400 group-hover:scale-110 transition-transform`}>
                    <report.icon className="w-8 h-8" />
                  </div>
                  {report.requiresDateRange && (
                    <Badge variant="info" className="text-[10px] uppercase">Needs Date</Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{report.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{report.description}</p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="w-4 h-4" />
                    View Report
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowTrendingUpIcon className="w-4 h-4 rotate-45" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Date Range Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedReport?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Choose the period for data extraction.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Starting From</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ending At</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <Button
                  variant="secondary"
                  onClick={() => setShowDateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  className="flex-1"
                >
                  View Report
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Authenticated>
  );
}
