import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

interface ExpiredCreditCustomer {
  id: number;
  name: string;
  creditPeriodExpiresAt: string;
  currentCreditSpend: number;
  creditLimit: number;
  daysOverdue: number;
}

export default function ExpiredCreditCustomersWidget() {
  const { expiredCreditCustomers, permissions, isAdmin } = usePage().props as any;

  // Check if user has permission to view this widget
  const hasPermission = isAdmin || permissions?.includes('view_expired_credit_customers');

  if (!hasPermission || !expiredCreditCustomers || expiredCreditCustomers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Expired Credit Periods</h3>
          <p className="text-sm text-gray-500">
            {expiredCreditCustomers.length} customer{expiredCreditCustomers.length !== 1 ? 's' : ''} cannot purchase until credit is settled
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {expiredCreditCustomers.slice(0, 5).map((customer: ExpiredCreditCustomer) => (
          <Link
            key={customer.id}
            href={`/customer`}
            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">
                  Outstanding: Rs. {Number(customer.currentCreditSpend || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {customer.daysOverdue} days overdue
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {expiredCreditCustomers.length > 5 && (
        <Link
          href="/customer"
          className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View all {expiredCreditCustomers.length} customers →
        </Link>
      )}
    </div>
  );
}
