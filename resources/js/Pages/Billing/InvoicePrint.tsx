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
}

export default function InvoicePrint({ invoice }: { invoice: InvoiceData }) {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
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
                    </div>

                    <div className="mt-2 space-y-1 text-xs">
                        <p><strong>Invoice Date:</strong> {invoice.created_at.split("T")[0] || "___________________________"}</p>
                    </div>
                </div>

                {/* INVOICE TO / FROM */}
                <div className="flex justify-between border-b border-gray-300 pb-3 mb-3 text-xs">
                    <div className="w-1/2">
                        <p className="font-semibold mb-1">Invoice To:</p>
                        <div className="space-y-0.5">
                            <p>Client Name: {invoice.customer_name || "__________________________"}</p>
                            <p>Company: {invoice.company || "_____________________________"}</p>
                            <p>Phone No: {invoice.customer_contact || "____________________________"}</p>
                            <p>Email: {invoice.customer_email || "_______________________________"}</p>
                            <p>Address: {invoice.customer_address || "_____________________________"}</p>
                            <p>VAT No: __________________________</p>
                        </div>
                    </div>
                    <div className="w-1/2 text-right">
                        <p className="font-semibold mb-1">Invoice From:</p>
                        <p>Namaratne Motor Distributors</p>
                        <p>Direct Importers & Islandwide Distributors for ESP Shock Absorbers</p>
                        <p>143/19B, Salawa Rd, Mirihana</p>
                        <p>Tel: 0777756095</p>
                        <p>Email: saleinfo.nmd@gmail.com</p>
                        <p>VAT No: ___________________</p>
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
                        {invoice.items && invoice.items.length > 0 ? invoice.items.map((item, i) => {
                            const price = parseFloat(item.salePrice);
                            const qty = item.quantity;
                            const total = parseFloat(item.totalAmount);
                            return (
                                <tr key={i}>
                                    <td className="border border-gray-300 p-1">{item.productCode || "-"}</td>
                                    <td className="border border-gray-300 p-1">{item.productName || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-right">{price.toFixed(2)}</td>
                                    <td className="border border-gray-300 p-1 text-center">{qty}</td>
                                    <td className="border border-gray-300 p-1 text-right">{total.toFixed(2)}</td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={5} className="border p-2 text-center">No items found</td>
                            </tr>
                        )}
                        {/* TOTALS ROWS */}
                        <tr>
                            <td className="p-1" colSpan={2}></td>
                            <td className="border border-gray-300 p-1 font-medium text-left" colSpan={2}>GOODS VALUE</td>
                            <td className="border border-gray-300 p-1 text-right">{parseFloat(invoice.totalAmount).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="p-1" colSpan={2}></td>
                            <td className="border border-gray-300 p-1 font-medium text-left" colSpan={2}>DISCOUNT</td>
                            <td className="border border-gray-300 p-1 text-right">- {(invoice.discount_value ?? 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="p-1" colSpan={2}></td>
                            <td className="border border-gray-300 p-1 font-medium text-left" colSpan={2}>TOTAL</td>
                            <td className="border border-gray-300 p-1 text-right">{parseFloat(invoice.creditAmount).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="p-1" colSpan={2}></td>
                            <td className="border border-gray-300 p-1 font-medium text-left" colSpan={2}>VAT 18%</td>
                            <td className="border border-gray-300 p-1 text-right">{(parseFloat(invoice.totalAmount) * 0.18).toFixed(2)}</td>
                        </tr>
                        <tr className="font-bold">
                            <td className="p-1" colSpan={2}></td>
                            <td className="border border-gray-300 bg-pink-100 p-1 text-left" colSpan={2}>GRAND TOTAL</td>
                            <td className="border border-gray-300 bg-pink-100 p-1 text-right">{(parseFloat(invoice.totalAmount) * 1.18).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* NOTE */}
                <div className="border-t border-gray-300 pt-2 mt-2">
                    <p className="text-center text-xs italic">
                        NOTE: All Cheques to be drawn in favour of <b>Namaratne Motor Distributors</b> and crossed ‘Account Payee’
                    </p>
                </div>

                {/* SIGNATURES */}
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

            </div>
        </div>
    );
}
