import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import type { PageProps as InertiaPageProps } from "@inertiajs/core";
import { format, parseISO } from "date-fns";

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type SaleRow = {
    id: number;
    billNumber?: string | null;
    customer_name?: string | null;
    totalAmount?: number | string | null;
    paidAmount?: number | string | null;
    dueAmount?: number | string | null;
    paymentMethod?: string | null;
    status?: "pending" | "approved" | "draft" | string | null;
    created_at?: string | null;
};

type InvoiceArchiveProps = InertiaPageProps & {
    auth: any;
    ziggy: any;
    filters: { q: string };
    printed: Paginator<SaleRow>;
    drafts: Paginator<SaleRow>;
};

function Pagination({ links }: { links: Paginator<any>["links"] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {links.map((l, idx) => {
                if (!l.url) {
                    return (
                        <span
                            key={idx}
                            className="px-3 py-1 rounded border text-sm opacity-50 cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    );
                }
                return (
                    <Link
                        key={idx}
                        href={l.url}
                        className={
                            "px-3 py-1 rounded border text-sm " +
                            (l.active ? "font-semibold" : "")
                        }
                        dangerouslySetInnerHTML={{ __html: l.label }}
                    />
                );
            })}
        </div>
    );
}

function formatCreatedAt(iso?: string | null) {
    if (!iso) return "-";
    try {
        return format(parseISO(iso), "dd MMM yyyy, hh:mm a");
    } catch {
        return iso;
    }
}

function SalesTable({
    rows,
    emptyText,
}: {
    rows: SaleRow[];
    emptyText: string;
}) {
    return (
        <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left border-b">
                        <th className="p-3">Bill #</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Paid</th>
                        <th className="p-3">Due</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Created</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td className="p-3" colSpan={9}>
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        rows.map((s) => (
                            <tr key={s.id} className="border-b last:border-b-0">
                                <td className="p-3">
                                    {s.billNumber ?? `#${s.id}`}
                                </td>
                                <td className="p-3">
                                    {s.customer_name ?? "-"}
                                </td>
                                <td className="p-3">{s.totalAmount ?? "-"}</td>
                                <td className="p-3">{s.paidAmount ?? "-"}</td>
                                <td className="p-3">{s.dueAmount ?? "-"}</td>
                                <td className="p-3">
                                    {s.paymentMethod ?? "-"}
                                </td>
                                <td className="p-3">{s.status ?? "-"}</td>
                                <td className="p-3">
                                    {formatCreatedAt(s.created_at)}
                                </td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        {/* ✅ NEW: View invoice */}
                                        <div className="flex justify-end gap-2">
                                            <a
                                                className="px-3 py-1 rounded border"
                                                href={`/billing/view/${s.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View
                                            </a>

                                            <a
                                                className="px-3 py-1 rounded border"
                                                href={`/billing/view/${s.id}?download=1`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                PDF
                                            </a>

                                            <a
                                                className="px-3 py-1 rounded border"
                                                href={`/billing/print/${s.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Print
                                            </a>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default function Archive() {
    const { props } = usePage<InvoiceArchiveProps>();

    const [tab, setTab] = useState<"printed" | "drafts">("printed");

    const q = props.filters?.q ?? "";
    const [search, setSearch] = useState(q);

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            route("invoices.archive"),
            { q: search },
            { preserveState: true, replace: true },
        );
    }

    return (
        <Authenticated bRoutes={undefined}>
            <Head title="Invoice Archive" />

            <div className="flex-1 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-semibold">
                            Invoice Archive
                        </h1>
                        <p className="text-sm opacity-70">
                            Approved (printed) and Draft bills.
                        </p>
                    </div>

                    <form onSubmit={submitSearch} className="flex gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search bill number / customer..."
                            className="border rounded px-3 py-2 text-sm w-64"
                        />
                        <button
                            className="border rounded px-3 py-2 text-sm"
                            type="submit"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setTab("printed")}
                        className={
                            "px-3 py-2 rounded border text-sm " +
                            (tab === "printed" ? "font-semibold" : "")
                        }
                    >
                        Printed / Approved ({props.printed.total})
                    </button>

                    <button
                        onClick={() => setTab("drafts")}
                        className={
                            "px-3 py-2 rounded border text-sm " +
                            (tab === "drafts" ? "font-semibold" : "")
                        }
                    >
                        Drafts ({props.drafts.total})
                    </button>
                </div>

                {tab === "printed" ? (
                    <>
                        <SalesTable
                            rows={props.printed.data}
                            emptyText="No approved invoices found."
                        />
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="text-sm opacity-70">
                                Page {props.printed.current_page} of{" "}
                                {props.printed.last_page} •{" "}
                                {props.printed.total} total
                            </div>
                            <Pagination links={props.printed.links} />
                        </div>
                    </>
                ) : (
                    <>
                        <SalesTable
                            rows={props.drafts.data}
                            emptyText="No draft invoices found."
                        />
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="text-sm opacity-70">
                                Page {props.drafts.current_page} of{" "}
                                {props.drafts.last_page} • {props.drafts.total}{" "}
                                total
                            </div>
                            <Pagination links={props.drafts.links} />
                        </div>
                    </>
                )}
            </div>
        </Authenticated>
    );
}
