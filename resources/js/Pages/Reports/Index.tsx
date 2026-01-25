import Authenticated from "@/Layouts/AuthenticatedLayout";
import { DocumentTextIcon, UserGroupIcon, ArchiveBoxIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

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
      window.open(report.href, '_blank');
    }
  };

  const handleGenerateReport = () => {
    if (selectedReport) {
      const url = `${selectedReport.href}?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`;
      window.open(url, '_blank');
      setShowDateModal(false);
    }
  };

  return (
    <Authenticated>
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <button
              key={report.name}
              onClick={() => handleReportClick(report)}
              className="block p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left w-full"
            >    <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-lg bg-${report.color}-100`}>
                  <report.icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold">{report.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{report.description}</p>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                Generate PDF
              </div>
            </button>
          ))}
        </div>

        {/* Date Range Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">{selectedReport?.name}</h3>
              <p className="text-sm text-gray-600 mb-4">Select date range for the report</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Authenticated>
  );
}
