import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";

interface InvoiceItem {
    id: number;
    salesId: number;
    productId: number;
    productName?: string;
    productCode?: string;
    quantity: number;
    salePrice: string;
    descount: string;
    totalAmount: string;
    returnQuantity: number;
    created_at: string;
    updated_at: string;
}

interface Payment {
    id: number;
    amount: string;
    payment_method: string;
    payment_date: string;
    reference_number?: string;
}

interface InvoiceData {
    id: number;
    customerId: number | null;
    productId: number[];
    returnProductId: any;
    totalQuantity: number;
    totalAmount: string;
    paidAmount: string;
    dueAmount: string;
    creditAmount: string;
    cardAmount: string;
    cashAmount: string;
    paymentMethod: string;
    createdBy: number;
    status: string;
    billNumber: string;
    created_at: string;
    updated_at: string;
    discount_value: number;
    items: InvoiceItem[];
    payments?: Payment[];
    customer_name?: string;
    customer_contact?: string;
    company?: string;
    customer_email?: string;
    customer_address?: string;
    customer_vat_number?: string;
    discount_category_name?: string;
    discount_category_type?: string;
    discount_category_value?: number;
}

type Props = {
    invoice: InvoiceData;
    vatNumber?: string;
    currency?: string;
    exchangeRate?: number | null;
};

export default function InvoiceView() {
    const {
        invoice,
        vatNumber,
        currency = "LKR",
        exchangeRate,
    } = usePage().props as unknown as Props;

    const [downloading, setDownloading] = useState(false);
    const pdfRootRef = useRef<HTMLDivElement | null>(null);

    // Helper function to convert LKR to USD
    const convertPrice = (lkrAmount: string | number): number => {
        const amount =
            typeof lkrAmount === "string" ? parseFloat(lkrAmount) : lkrAmount;
        if (currency === "USD" && exchangeRate) {
            return amount / exchangeRate;
        }
        return amount;
    };

    // Helper function to format currency
    const formatCurrency = (amount: number): string => {
        if (currency === "USD") {
            return `$${amount.toFixed(2)}`;
        }
        return `Rs. ${amount.toFixed(2)}`;
    };

    const allItems = invoice.items || [];
    const itemsPerPage = 5;

    // Split items into chunks of 5
    const itemChunks = useMemo(() => {
        const chunks: InvoiceItem[][] = [];
        for (let i = 0; i < allItems.length; i += itemsPerPage) {
            chunks.push(allItems.slice(i, i + itemsPerPage));
        }
        return chunks.length ? chunks : [[]];
    }, [allItems]);

    const totalPages = itemChunks.length;

    // ✅ VAT-INCLUSIVE totals (matches your layout)
    const goodsValue = Number.parseFloat(String(invoice.totalAmount || 0)) || 0; // GOODS VALUE
    const discountValue =
        Number.parseFloat(String(invoice.discount_value || 0)) || 0; // DISCOUNT amount

    // TOTAL after discount (this is what you show as "TOTAL")
    const totalAfterDiscount = Math.max(0, goodsValue - discountValue);

    // VAT portion using your formula:
    // VAT 18% = TOTAL - {(TOTAL*100)/118}
    const vatAmount = totalAfterDiscount - (totalAfterDiscount * 100) / 118;

    // GRAND TOTAL = TOTAL + VAT 18%
    const grandTotal = totalAfterDiscount + vatAmount;

    const filename = useMemo(() => {
        const safeBill = (invoice.billNumber || `#${invoice.id}`)
            .replace(/[^\w\-]+/g, "_")
            .slice(0, 80);
        return `invoice_${safeBill}.pdf`;
    }, [invoice.billNumber, invoice.id]);

    const downloadPdf = async () => {
        if (!pdfRootRef.current) return;

        setDownloading(true);
        try {
            // Lazy-load so the page still works even before first download
            const mod: any = await import("html2pdf.js");
            const html2pdf = mod?.default || mod;

            const element = pdfRootRef.current;

            await html2pdf()
                .set({
                    margin: 8,
                    filename,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: {
                        unit: "mm",
                        format: "a4",
                        orientation: "portrait",
                    },
                    pagebreak: { mode: ["css", "legacy"] },
                })
                .from(element)
                .save();
        } finally {
            setDownloading(false);
        }
    };

    // Optional: /billing/view/{id}?download=1 will auto-download
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("download") === "1") {
            // Let DOM settle
            setTimeout(() => {
                downloadPdf();
            }, 300);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Head title={`Invoice ${invoice.billNumber || invoice.id}`} />

            {/* Toolbar (hidden during print) */}
            <div className="no-print sticky top-0 z-50 bg-white border-b">
                <div className="max-w-[980px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link
                            href={route("invoices.archive")}
                            className="px-3 py-1.5 rounded border text-sm"
                        >
                            Back
                        </Link>
                        <div className="text-sm font-medium">
                            {invoice.billNumber || `#${invoice.id}`}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="px-3 py-1.5 rounded border text-sm"
                            onClick={() => window.print()}
                        >
                            Print
                        </button>

                        <button
                            type="button"
                            className="px-3 py-1.5 rounded border text-sm"
                            onClick={downloadPdf}
                            disabled={downloading}
                        >
                            {downloading ? "Downloading..." : "Download PDF"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Styles for print + pdf page breaks */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .page-break { page-break-before: always; }
                }
                .page-break { break-before: page; }
            `}</style>

            {/* PDF capture root */}
            <div ref={pdfRootRef}>
                {itemChunks.map((pageItems, pageIndex) => (
                    <div
                        key={pageIndex}
                        className={pageIndex > 0 ? "page-break" : ""}
                    >
                        <div className="bg-white font-sans text-[13px] text-gray-900 leading-tight p-6">
                            <div className="max-w-[800px] mx-auto border border-gray-300 shadow-sm my-6 p-6">
                                {/* HEADER */}

                                {/* First Row: Logos and Company Info */}
                                <div className="flex items-center gap-4 mb-3">
                                    {/* Logos on the LEFT */}
                                    <div className="flex gap-2">
                                        <img
                                            src="/images/eep_logo.jpeg"
                                            alt="EEP Logo"
                                            className="h-36 w-auto object-contain"
                                        />
                                        <img
                                            src="/images/nmd_logo.png"
                                            alt="NMD logo"
                                            className="h-36 w-auto object-contain"
                                        />
                                    </div>

                                    {/* Company Name and Details */}
                                    <div className="flex flex-col">
                                        <h1 className="text-4xl font-bold text-black tracking-wide leading-tight">
                                            NAMARATNA
                                        </h1>
                                        <h2 className="text-xl font-semibold text-gray-800 leading-tight">
                                            Motor Distributors
                                        </h2>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Direct importers and island-wide
                                            distributors for ESP shock absorbers
                                        </p>
                                    </div>
                                </div>

                                {/* Second Row: Tax Invoice - Left Aligned */}
                                <div className="mb-2">
                                    <p className="text-lg font-semibold text-gray-900">
                                        Tax Invoice
                                    </p>
                                </div>
                                <div className="flex justify-between items-start border-b-2 border-pink-600 pb-2 mb-2">
                                    <div className="mt-2 space-y-1 text-xs">
                                        <p>
                                            <strong>Invoice Number:</strong>{" "}
                                            {invoice.billNumber ||
                                                "_____________________"}
                                        </p>
                                        {totalPages > 1 && (
                                            <p>
                                                <strong>Page:</strong>{" "}
                                                {pageIndex + 1} of {totalPages}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-2 space-y-1 text-xs">
                                        <p>
                                            <strong>Invoice Date:</strong>{" "}
                                            {invoice.created_at.split("T")[0] ||
                                                "___________________________"}
                                        </p>
                                    </div>
                                </div>

                                {/* INVOICE TO / FROM */}
                                <div className="border-2 border-gray-400 flex mb-3 text-xs">
                                    <div className="w-1/2 p-3 border-r-2 border-gray-400">
                                        <p className="font-semibold mb-2">
                                            Invoice To:
                                        </p>
                                        <p>
                                            Client Name:{" "}
                                            {invoice.customer_name ||
                                                "__________________________"}
                                        </p>
                                        <p>
                                            Company:{" "}
                                            {invoice.company ||
                                                "_____________________________"}
                                        </p>
                                        <p>
                                            Phone No:{" "}
                                            {invoice.customer_contact ||
                                                "____________________________"}
                                        </p>
                                        <p>
                                            Email:{" "}
                                            {invoice.customer_email ||
                                                "_______________________________"}
                                        </p>
                                        <p>
                                            Address:{" "}
                                            {invoice.customer_address ||
                                                "_____________________________"}
                                        </p>
                                        <p>
                                            VAT No:{" "}
                                            {invoice.customer_vat_number ||
                                                "__________________________"}
                                        </p>
                                    </div>
                                    <div className="w-1/2 p-3">
                                        <p className="font-semibold mb-2">
                                            Invoice From:
                                        </p>
                                        <p>Namaratne Motor Distributors</p>
                                        <p>143/19B, Salawa Rd, Mirihana</p>
                                        <p>Tel: 0777756095</p>
                                        <p>Email: saleinfo.nmd@gmail.com</p>
                                        <p>
                                            VAT No:{" "}
                                            {vatNumber || "___________________"}
                                        </p>
                                    </div>
                                </div>

                                {/* ITEMS TABLE */}
                                <table className="w-full border-collapse text-xs mb-4">
                                    <thead>
                                        <tr className="bg-pink-100 border border-gray-400 text-[12px]">
                                            <th className="border border-gray-400 p-1 text-left w-[20%]">
                                                ITEM CODE
                                            </th>
                                            <th className="border border-gray-400 p-1 text-left w-[35%]">
                                                ITEM NAME
                                            </th>
                                            <th className="border border-gray-400 p-1 text-right w-[15%]">
                                                UNIT PRICE
                                            </th>
                                            <th className="border border-gray-400 p-1 text-center w-[10%]">
                                                QTY
                                            </th>
                                            <th className="border border-gray-400 p-1 text-right w-[20%]">
                                                TOTAL
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const minRows = 5;
                                            const rows: React.ReactNode[] = [];

                                            pageItems.forEach((item, i) => {
                                                const price = convertPrice(
                                                    item.salePrice,
                                                );
                                                const qty = item.quantity;
                                                const total = convertPrice(
                                                    item.totalAmount,
                                                );
                                                rows.push(
                                                    <tr key={i}>
                                                        <td className="border border-gray-300 p-1">
                                                            {item.productCode ||
                                                                "-"}
                                                        </td>
                                                        <td className="border border-gray-300 p-1">
                                                            {item.productName ||
                                                                "-"}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 text-right">
                                                            {formatCurrency(
                                                                price,
                                                            )}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 text-center">
                                                            {qty}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 text-right">
                                                            {formatCurrency(
                                                                total,
                                                            )}
                                                        </td>
                                                    </tr>,
                                                );
                                            });

                                            for (
                                                let i = pageItems.length;
                                                i < minRows;
                                                i++
                                            ) {
                                                rows.push(
                                                    <tr key={`empty-${i}`}>
                                                        <td className="border border-gray-300 p-1">
                                                            &nbsp;
                                                        </td>
                                                        <td className="border border-gray-300 p-1">
                                                            &nbsp;
                                                        </td>
                                                        <td className="border border-gray-300 p-1">
                                                            &nbsp;
                                                        </td>
                                                        <td className="border border-gray-300 p-1">
                                                            &nbsp;
                                                        </td>
                                                        <td className="border border-gray-300 p-1">
                                                            &nbsp;
                                                        </td>
                                                    </tr>,
                                                );
                                            }

                                            return rows;
                                        })()}

                                        {/* TOTALS ROWS - Only on last page */}
                                        {pageIndex ===
                                            itemChunks.length - 1 && (
                                            <>
                                                <tr>
                                                    <td
                                                        className="p-1"
                                                        colSpan={2}
                                                    ></td>
                                                    <td
                                                        className="border border-gray-300 p-1 font-medium text-left"
                                                        colSpan={2}
                                                    >
                                                        GOODS VALUE
                                                    </td>
                                                    <td className="border border-gray-300 p-1 text-right">
                                                        {formatCurrency(
                                                            convertPrice(
                                                                goodsValue,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td
                                                        className="p-1"
                                                        colSpan={2}
                                                    ></td>
                                                    <td
                                                        className="border border-gray-300 p-1 font-medium text-left"
                                                        colSpan={2}
                                                    >
                                                        DISCOUNT
                                                        {invoice.discount_category_name && (
                                                            <span className="font-normal text-xs">
                                                                {" "}
                                                                (
                                                                {
                                                                    invoice.discount_category_name
                                                                }
                                                                )
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="border border-gray-300 p-1 text-right">
                                                        -{" "}
                                                        {formatCurrency(
                                                            convertPrice(
                                                                discountValue,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td
                                                        className="p-1"
                                                        colSpan={2}
                                                    ></td>
                                                    <td
                                                        className="border border-gray-300 p-1 font-medium text-left"
                                                        colSpan={2}
                                                    >
                                                        TOTAL
                                                    </td>
                                                    <td className="border border-gray-300 p-1 text-right">
                                                        {formatCurrency(
                                                            convertPrice(
                                                                totalAfterDiscount,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td
                                                        className="p-1"
                                                        colSpan={2}
                                                    ></td>
                                                    <td
                                                        className="border border-gray-300 p-1 font-medium text-left"
                                                        colSpan={2}
                                                    >
                                                        VAT 18%
                                                    </td>
                                                    <td className="border border-gray-300 p-1 text-right">
                                                        {formatCurrency(
                                                            convertPrice(
                                                                vatAmount,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>

                                                <tr className="font-bold">
                                                    <td
                                                        className="p-1"
                                                        colSpan={2}
                                                    ></td>
                                                    <td
                                                        className="border border-gray-300 bg-pink-100 p-1 text-left"
                                                        colSpan={2}
                                                    >
                                                        GRAND TOTAL
                                                    </td>
                                                    <td className="border border-gray-300 bg-pink-100 p-1 text-right">
                                                        {formatCurrency(
                                                            convertPrice(
                                                                grandTotal,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>

                                {/* PAYMENT HISTORY */}
                                {invoice.payments && invoice.payments.length > 0 && (
                                    <div className="mb-6">
                                        <p className="font-bold text-xs uppercase mb-2 border-b pb-1">Payment History</p>
                                        <table className="w-full text-[11px] border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-y border-gray-300">
                                                    <th className="p-1 text-left">Date</th>
                                                    <th className="p-1 text-left">Method</th>
                                                    <th className="p-1 text-left">Reference</th>
                                                    <th className="p-1 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.payments.map((payment) => (
                                                    <tr key={payment.id} className="border-b border-gray-100">
                                                        <td className="p-1">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                        <td className="p-1 capitalize">{payment.payment_method}</td>
                                                        <td className="p-1">{payment.reference_number || '-'}</td>
                                                        <td className="p-1 text-right">{formatCurrency(convertPrice(payment.amount))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* NOTE - Only on last page */}
                                {pageIndex === itemChunks.length - 1 && (
                                    <div className="border-t border-gray-300 pt-2 mt-2">
                                        <p className="text-center text-xs italic">
                                            NOTE: All Cheques to be drawn in
                                            favour of{" "}
                                            <b>Namaratne Motor Distributors</b>{" "}
                                            and crossed 'Account Payee'
                                        </p>
                                    </div>
                                )}

                                {/* SIGNATURES - Only on last page */}
                                {pageIndex === itemChunks.length - 1 && (
                                    <div className="flex justify-between mt-10 text-xs">
                                        <div className="text-center">
                                            <div className="mb-2">
                                                ...........................................................
                                            </div>
                                            <p>Customer Signature</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="mb-2">
                                                ...........................................................
                                            </div>
                                            <p>NMD Representative Signature</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
