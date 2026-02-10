import React, { useEffect } from "react";

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

export default function InvoicePrint({
    invoice,
    vatNumber,
    currency = "LKR",
    exchangeRate,
}: {
    invoice: InvoiceData;
    vatNumber?: string;
    currency?: string;
    exchangeRate?: number | null;
}) {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

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
    const totalPages = Math.ceil(allItems.length / itemsPerPage);

    // Split items into chunks of 5
    const itemChunks = [];
    for (let i = 0; i < allItems.length; i += itemsPerPage) {
        itemChunks.push(allItems.slice(i, i + itemsPerPage));
    }

    // ✅ VAT-INCLUSIVE totals (matches your layout)
    const goodsValue = Number.parseFloat(String(invoice.totalAmount || 0)) || 0; // GOODS VALUE
    const discountValue =
        Number.parseFloat(String(invoice.discount_value || 0)) || 0; // DISCOUNT amount

    // TOTAL after discount (this is what you show as "TOTAL")
    const totalAfterDiscount = Math.max(0, goodsValue - discountValue);

    // VAT portion using your formula:
    // VAT 18% = TOTAL - {(TOTAL*100)/118}
    const vatAmount = totalAfterDiscount - (totalAfterDiscount * 100) / 118;

    // ✅ FIX: GRAND TOTAL = TOTAL + VAT 18%
    const grandTotal = totalAfterDiscount + vatAmount;

    return (
        <>
            {itemChunks.map((pageItems, pageIndex) => (
                <div
                    key={pageIndex}
                    className={pageIndex > 0 ? "page-break" : ""}
                >
                    <style>{`
                        @media print {
                            .page-break {
                                page-break-before: always;
                            }
                        }
                    `}</style>

                    <div className="bg-white font-sans text-[13px] text-gray-900 leading-tight p-6 print:p-0 print:text-black">
                        <div className="max-w-[800px] mx-auto border border-gray-300 shadow-sm print:shadow-none print:border-black my-6 p-6 print:my-0 print:p-4">
                            {/* HEADER */}

                            {/* First Row: Logos and Company Info */}
                            <div className="flex items-center gap-4 mb-3 print:mb-2">
                                {/* Logos on the LEFT */}
                                <div className="flex gap-2 print:hidden">
                                    <img
                                        src="/images/eep_logo.jpeg"
                                        alt="EEP Logo"
                                        className="h-32 w-auto object-contain"
                                    />
                                    <img
                                        src="/images/nmd_logo.png"
                                        alt="NMD logo"
                                        className="h-32 w-auto object-contain"
                                    />
                                </div>

                                {/* Company Name and Details */}
                                <div className="flex flex-col">
                                    <h1 className="text-4xl print:text-5xl font-bold text-black tracking-wide leading-tight">
                                        NAMARATNA
                                    </h1>
                                    <h2 className="text-xl print:text-2xl font-semibold text-gray-800 print:text-black leading-tight">
                                        Motor Distributors
                                    </h2>
                                    <p className="text-xs text-gray-600 print:text-black mt-1">
                                        Direct importers and island-wide
                                        distributors for ESP shock absorbers
                                    </p>
                                </div>
                            </div>

                            {/* Second Row: Tax Invoice - Left Aligned */}
                            <div className="mb-2">
                                <p className="text-lg font-bold text-black uppercase tracking-widest">
                                    Tax Invoice
                                </p>
                            </div>
                            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-2 mb-2">
                                <div className="mt-1 space-y-1 text-xs">
                                    <p>
                                        <strong>Invoice Number:</strong>{" "}
                                        <span className="font-bold">{invoice.billNumber || "N/A"}</span>
                                    </p>
                                    {totalPages > 1 && (
                                        <p>
                                            <strong>Page:</strong>{" "}
                                            {pageIndex + 1} of {totalPages}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-1 space-y-1 text-xs">
                                    <p>
                                        <strong>Invoice Date:</strong>{" "}
                                        {invoice.created_at.split("T")[0]}
                                    </p>
                                </div>
                            </div>

                            {/* INVOICE TO / FROM */}
                            <div className="border border-black flex mb-3 text-xs">
                                <div className="w-1/2 p-3 border-r border-black">
                                    <p className="font-bold underline mb-2">
                                        Invoice To:
                                    </p>
                                    <p className="font-bold">
                                        {invoice.customer_name || "__________________________"}
                                    </p>
                                    <p>
                                        Company: {invoice.company || "N/A"}
                                    </p>
                                    <p>
                                        Phone No: {invoice.customer_contact || "N/A"}
                                    </p>
                                    <p>
                                        Address: {invoice.customer_address || "N/A"}
                                    </p>
                                    <p>
                                        VAT No: {invoice.customer_vat_number || "N/A"}
                                    </p>
                                </div>
                                <div className="w-1/2 p-3">
                                    <p className="font-bold underline mb-2">
                                        Invoice From:
                                    </p>
                                    <p className="font-bold">Namaratne Motor Distributors</p>
                                    <p>143/19B, Salawa Rd, Mirihana</p>
                                    <p>Tel: 0777756095</p>
                                    <p>Email: saleinfo.nmd@gmail.com</p>
                                    <p>
                                        VAT No: <span className="font-bold">{vatNumber || "N/A"}</span>
                                    </p>
                                </div>
                            </div>

                            {/* ITEMS TABLE */}
                            <table className="w-full border-collapse text-xs mb-4">
                                <thead>
                                    <tr className="bg-gray-100 print:bg-transparent border border-black text-[12px]">
                                        <th className="border border-black p-1 text-left w-[20%]">
                                            ITEM CODE
                                        </th>
                                        <th className="border border-black p-1 text-left w-[35%]">
                                            ITEM NAME
                                        </th>
                                        <th className="border border-black p-1 text-right w-[15%]">
                                            UNIT PRICE
                                        </th>
                                        <th className="border border-black p-1 text-center w-[10%]">
                                            QTY
                                        </th>
                                        <th className="border border-black p-1 text-right w-[20%]">
                                            TOTAL
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const minRows = 8;
                                        const rows = [];

                                        // Add actual items for this page
                                        pageItems.forEach((item, i) => {
                                            const price = convertPrice(
                                                item.salePrice,
                                            );
                                            const qty = item.quantity;
                                            const total = convertPrice(
                                                item.totalAmount,
                                            );
                                            rows.push(
                                                <tr key={i} className="border-b border-gray-200 print:border-black/20">
                                                    <td className="p-1">
                                                        {item.productCode || "-"}
                                                    </td>
                                                    <td className="p-1">
                                                        {item.productName || "-"}
                                                    </td>
                                                    <td className="p-1 text-right">
                                                        {formatCurrency(price)}
                                                    </td>
                                                    <td className="p-1 text-center font-bold">
                                                        {qty}
                                                    </td>
                                                    <td className="p-1 text-right">
                                                        {formatCurrency(total)}
                                                    </td>
                                                </tr>,
                                            );
                                        });

                                        // Add empty rows to reach minimum rows
                                        for (
                                            let i = pageItems.length;
                                            i < minRows;
                                            i++
                                        ) {
                                            rows.push(
                                                <tr key={`empty-${i}`} className="border-b border-gray-100 print:border-black/5">
                                                    <td className="p-1">&nbsp;</td>
                                                    <td className="p-1">&nbsp;</td>
                                                    <td className="p-1">&nbsp;</td>
                                                    <td className="p-1">&nbsp;</td>
                                                    <td className="p-1">&nbsp;</td>
                                                </tr>,
                                            );
                                        }

                                        return rows;
                                    })()}

                                    {/* TOTALS ROWS - Only on last page */}
                                    {pageIndex === itemChunks.length - 1 && (
                                        <>
                                            <tr className="border-t-2 border-black">
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="p-1 font-bold text-left" colSpan={2}>
                                                    GOODS VALUE
                                                </td>
                                                <td className="p-1 text-right font-bold">
                                                    {formatCurrency(convertPrice(goodsValue))}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="p-1 font-normal text-left" colSpan={2}>
                                                    DISCOUNT {invoice.discount_category_name && `(${invoice.discount_category_name})`}
                                                </td>
                                                <td className="p-1 text-right">
                                                    - {formatCurrency(convertPrice(discountValue))}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="p-1 font-bold text-left" colSpan={2}>
                                                    NET TOTAL
                                                </td>
                                                <td className="p-1 text-right font-bold">
                                                    {formatCurrency(convertPrice(totalAfterDiscount))}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="p-1 font-normal text-left" colSpan={2}>
                                                    VAT 18%
                                                </td>
                                                <td className="p-1 text-right">
                                                    {formatCurrency(convertPrice(vatAmount))}
                                                </td>
                                            </tr>

                                            <tr className="border-y-2 border-black">
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="p-1 text-left font-black text-sm" colSpan={2}>
                                                    GRAND TOTAL
                                                </td>
                                                <td className="p-1 text-right font-black text-sm underline decoration-double">
                                                    {formatCurrency(convertPrice(grandTotal))}
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>

                            {/* NOTE - Only on last page */}
                            {pageIndex === itemChunks.length - 1 && (
                                <div className="border-t border-gray-300 pt-2 mt-2">
                                    <p className="text-center text-xs italic">
                                        NOTE: All Cheques to be drawn in favour
                                        of <b>Namaratne Motor Distributors</b>{" "}
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
        </>
    );
}
