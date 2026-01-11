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
    currency = 'LKR',
    exchangeRate
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
        const amount = typeof lkrAmount === 'string' ? parseFloat(lkrAmount) : lkrAmount;
        if (currency === 'USD' && exchangeRate) {
            return amount / exchangeRate;
        }
        return amount;
    };

    // Helper function to format currency
    const formatCurrency = (amount: number): string => {
        if (currency === 'USD') {
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

    return (
        <>
            {itemChunks.map((pageItems, pageIndex) => (
                <div key={pageIndex} className={pageIndex > 0 ? "page-break" : ""}>
                    <style>{`
                        @media print {
                            .page-break {
                                page-break-before: always;
                            }
                        }
                    `}</style>

                    <div className="bg-white font-sans text-[13px] text-gray-900 leading-tight p-6">
                        <div className="max-w-[800px] mx-auto border border-gray-300 shadow-sm my-6 p-6">

                            {/* HEADER */}

                            <div className="flex justify-between items-center">
                                <div className="flex flex-col justify-between h-48">
                                    <h1 className="text-6xl font-bold text-black tracking-wide flex items-center flex-1">TAX INVOICE</h1>
                                    <h6 className="text-sm font-bold text-black">Direct importers and island-wide distributors for ESP shock absorbers</h6>
                                </div>
                                <div className="flex">
                                    <img
                                        src="/images/eep_logo.jpeg"
                                        alt="EEP Logo"
                                        className="h-48 w-auto object-contain"
                                    />
                                    <img
                                        src="/images/nmd_logo.png"
                                        alt="NMD logo"
                                        className="h-48 w-auto object-contain"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-start border-b-2 border-pink-600 pb-2 mb-2">
                                <div className="mt-2 space-y-1 text-xs">
                                    <p><strong>Invoice Number:</strong> {invoice.billNumber || "_____________________"}</p>
                                    {totalPages > 1 && (
                                        <p><strong>Page:</strong> {pageIndex + 1} of {totalPages}</p>
                                    )}
                                </div>

                                <div className="mt-2 space-y-1 text-xs">
                                    <p><strong>Invoice Date:</strong> {invoice.created_at.split("T")[0] || "___________________________"}</p>
                                </div>
                            </div>

                            {/* INVOICE TO / FROM */}
                            <div className="border-2 border-gray-400 flex mb-3 text-xs">
                                <div className="w-1/2 p-3 border-r-2 border-gray-400">
                                    <p className="font-semibold mb-2">Invoice To:</p>
                                    <p>Client Name: {invoice.customer_name || "__________________________"}</p>
                                    <p>Company: {invoice.company || "_____________________________"}</p>
                                    <p>Phone No: {invoice.customer_contact || "____________________________"}</p>
                                    <p>Email: {invoice.customer_email || "_______________________________"}</p>
                                    <p>Address: {invoice.customer_address || "_____________________________"}</p>
                                    <p>VAT No: {invoice.customer_vat_number || "__________________________"}</p>
                                </div>
                                <div className="w-1/2 p-3">
                                    <p className="font-semibold mb-2">Invoice From:</p>
                                    <p>Namaratne Motor Distributors</p>
                                    <p>143/19B, Salawa Rd, Mirihana</p>
                                    <p>Tel: 0777756095</p>
                                    <p>Email: saleinfo.nmd@gmail.com</p>
                                    <p>VAT No: {vatNumber || "___________________"}</p>
                                </div>
                            </div>

                            {/* ITEMS TABLE */}
                            <table className="w-full border-collapse text-xs mb-4">
                                <thead>
                                    <tr className="bg-pink-100 border border-gray-400 text-[12px]">
                                        <th className="border border-gray-400 p-1 text-left w-[20%]">ITEM CODE</th>
                                        <th className="border border-gray-400 p-1 text-left w-[35%]">ITEM DESCRIPTION</th>
                                        <th className="border border-gray-400 p-1 text-right w-[15%]">UNIT PRICE</th>
                                        <th className="border border-gray-400 p-1 text-center w-[10%]">QTY</th>
                                        <th className="border border-gray-400 p-1 text-right w-[20%]">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const minRows = 5;
                                        const rows = [];

                                        // Add actual items for this page
                                        pageItems.forEach((item, i) => {
                                            const price = convertPrice(item.salePrice);
                                            const qty = item.quantity;
                                            const total = convertPrice(item.totalAmount);
                                            rows.push(
                                                <tr key={i}>
                                                    <td className="border border-gray-300 p-1">{item.productCode || "-"}</td>
                                                    <td className="border border-gray-300 p-1">{item.productName || "-"}</td>
                                                    <td className="border border-gray-300 p-1 text-right">{formatCurrency(price)}</td>
                                                    <td className="border border-gray-300 p-1 text-center">{qty}</td>
                                                    <td className="border border-gray-300 p-1 text-right">{formatCurrency(total)}</td>
                                                </tr>
                                            );
                                        });

                                        // Add empty rows to reach minimum 5 rows
                                        for (let i = pageItems.length; i < minRows; i++) {
                                            rows.push(
                                                <tr key={`empty-${i}`}>
                                                    <td className="border border-gray-300 p-1">&nbsp;</td>
                                                    <td className="border border-gray-300 p-1">&nbsp;</td>
                                                    <td className="border border-gray-300 p-1">&nbsp;</td>
                                                    <td className="border border-gray-300 p-1">&nbsp;</td>
                                                    <td className="border border-gray-300 p-1">&nbsp;</td>
                                                </tr>
                                            );
                                        }

                                        return rows;
                                    })()}

                                    {/* TOTALS ROWS - Only on last page */}
                                    {pageIndex === itemChunks.length - 1 && (
                                        <>
                                            <tr>
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="border border-gray-300 p-1 font-medium text-left" colSpan={2}>GOODS VALUE</td>
                                                <td className="border border-gray-300 p-1 text-right">{formatCurrency(convertPrice(invoice.totalAmount))}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="border border-gray-300 p-1 font-medium text-left" colSpan={2}>
                                                    DISCOUNT
                                                    {invoice.discount_category_name && (
                                                        <span className="font-normal text-xs"> ({invoice.discount_category_name})</span>
                                                    )}
                                                </td>
                                                <td className="border border-gray-300 p-1 text-right">- {formatCurrency(convertPrice(String(invoice.discount_value || 0)))}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="border border-gray-300 p-1 font-medium text-left" colSpan={2}>TOTAL</td>
                                                <td className="border border-gray-300 p-1 text-right">{formatCurrency(convertPrice((parseFloat(invoice.creditAmount) / 1.18).toFixed(2)))}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="border border-gray-300 p-1 font-medium text-left" colSpan={2}>VAT 18%</td>
                                                <td className="border border-gray-300 p-1 text-right">{formatCurrency(convertPrice(((parseFloat(invoice.creditAmount) / 1.18) * 0.18).toFixed(2)))}</td>
                                            </tr>
                                            <tr className="font-bold">
                                                <td className="p-1" colSpan={2}></td>
                                                <td className="border border-gray-300 bg-pink-100 p-1 text-left" colSpan={2}>GRAND TOTAL</td>
                                                <td className="border border-gray-300 bg-pink-100 p-1 text-right">{formatCurrency(convertPrice(invoice.creditAmount))}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>

                            {/* NOTE - Only on last page */}
                            {pageIndex === itemChunks.length - 1 && (
                                <div className="border-t border-gray-300 pt-2 mt-2">
                                    <p className="text-center text-xs italic">
                                        NOTE: All Cheques to be drawn in favour of <b>Namaratne Motor Distributors</b> and crossed 'Account Payee'
                                    </p>
                                </div>
                            )}

                            {/* SIGNATURES - Only on last page */}
                            {pageIndex === itemChunks.length - 1 && (
                                <div className="flex justify-between mt-10 text-xs">
                                    <div className="text-center">
                                        <div className="mb-2">...........................................................</div>
                                        <p>Customer Signature</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="mb-2">...........................................................</div>
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
