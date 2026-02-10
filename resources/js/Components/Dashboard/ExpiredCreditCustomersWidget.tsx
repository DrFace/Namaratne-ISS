// resources/js/Components/Dashboard/ExpiredCreditCustomersWidget.tsx

import React from "react";
import { usePage } from "@inertiajs/react";
import { AlertTriangle } from "lucide-react";

export default function ExpiredCreditCustomersWidget() {
    const pageProps = usePage().props as any;

    /**
     * Keep the widget resilient to different backend prop names without changing anything else in Dashboard.
     * You can map your controller output to any of these keys; widget will pick the first match.
     */
    const customers: any[] =
        pageProps?.expiredCreditCustomers ||
        pageProps?.expired_credit_customers ||
        pageProps?.tables?.expiredCreditCustomers ||
        pageProps?.tables?.expired_credit_customers ||
        [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            minimumFractionDigits: 2,
        }).format(Number.isFinite(amount) ? amount : 0);
    };

    // ✅ FIX: correct "days overdue" calculation (no negatives, no decimals)
    const startOfDay = (d: Date) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    };

    const getDaysOverdue = (expiresAt?: string | null) => {
        if (!expiresAt) return 0;

        const exp = new Date(expiresAt);
        if (Number.isNaN(exp.getTime())) return 0;

        const nowDay = startOfDay(new Date());
        const expDay = startOfDay(exp);

        const msPerDay = 1000 * 60 * 60 * 24;

        // ✅ positive when overdue
        const diffMs = nowDay.getTime() - expDay.getTime();
        const diffDays = Math.floor(diffMs / msPerDay);

        return Math.max(0, diffDays);
    };

    // Optional: show expire date nicely (keeps UI stable even if missing)
    const formatDate = (iso?: string | null) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString();
    };

    const expiredCustomers = customers.filter((c) => {
        // If backend already filters, this is harmless.
        // If not, enforce expired only.
        const overdue = getDaysOverdue(
            c?.creditPeriodExpiresAt || c?.credit_period_expires_at,
        );
        const canPurchase =
            c?.canPurchase ??
            c?.can_purchase ??
            c?.can_purchase_flag ??
            undefined;

        // if canPurchase is explicitly false/0 => treat as expired entry
        if (canPurchase === false || canPurchase === 0) return true;

        // otherwise rely on date overdue
        return overdue > 0;
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-800">
                        Expired Credit Periods
                    </div>
                    <div className="text-sm text-gray-600">
                        {expiredCustomers.length} customer
                        {expiredCustomers.length === 1 ? "" : "s"} cannot
                        purchase until credit is settled
                    </div>
                </div>
            </div>

            {expiredCustomers.length === 0 ? (
                <div className="text-sm text-gray-500">
                    No expired customers
                </div>
            ) : (
                <div className="space-y-3">
                    {expiredCustomers.map((c) => {
                        const expiresAt =
                            c?.creditPeriodExpiresAt ||
                            c?.credit_period_expires_at ||
                            null;

                        const overdueDays = getDaysOverdue(expiresAt);

                        // Try common field names for display
                        const name =
                            c?.name ||
                            c?.customerName ||
                            c?.customer_name ||
                            "Customer";

                        const outstanding =
                            c?.outstanding ??
                            c?.outstandingAmount ??
                            c?.outstanding_amount ??
                            c?.creditBalance ??
                            c?.credit_balance ??
                            0;

                        return (
                            <div
                                key={c?.id ?? `${name}-${String(expiresAt)}`}
                                className="border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-semibold text-gray-800">
                                        {name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Outstanding:{" "}
                                        {formatCurrency(Number(outstanding))}
                                    </div>
                                </div>

                                {/* ✅ FIXED badge: never negative and never fractional */}
                                <div className="text-right">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                                        {overdueDays} days overdue
                                    </span>
                                    {expiresAt && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Expired on {formatDate(expiresAt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
