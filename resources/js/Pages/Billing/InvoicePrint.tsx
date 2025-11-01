import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { useEffect } from "react";

interface InvoiceItem {
    product_code?: string;
    product_name?: string;
    unit_price?: number;
    quantity?: number;
}

interface InvoiceData {
    invoice_no?: string;
    date?: string;
    customer_name?: string;
    customer_contact?: string;
    company?: string;
    customer_email?: string;
    customer_address?: string;
    total_amount?: number;
    discount_value?: number;
    net_total?: number;
    items?: InvoiceItem[];
}

export default function InvoicePrint({ invoice }: { invoice: InvoiceData }) {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <Authenticated>
            <div className="bg-white font-sans text-[13px] text-gray-900 leading-tight p-6">
                <div className="max-w-[800px] mx-auto border border-gray-300 shadow-sm my-6 p-6">

                    {/* HEADER */}
                    <div className="flex justify-between items-start border-b-2 border-pink-600 pb-2 mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-pink-600 tracking-wide">TAX INVOICE</h1>
                            <div className="mt-2 space-y-1 text-xs">
                                <p><strong>Invoice Number:</strong> {invoice.invoice_no || "_____________________"}</p>
                                <p><strong>Invoice Date:</strong> {invoice.date || "___________________________"}</p>
                            </div>
                        </div>

                        <div className="text-right text-xs leading-snug">

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
                                <th className="border border-gray-400 p-1 text-left w-[35%]">ITEM DESCRIPTION</th>
                                <th className="border border-gray-400 p-1 text-left w-[20%]">ITEM CODE</th>
                                <th className="border border-gray-400 p-1 text-right w-[15%]">UNIT PRICE</th>
                                <th className="border border-gray-400 p-1 text-center w-[10%]">QTY</th>
                                <th className="border border-gray-400 p-1 text-right w-[20%]">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items && invoice.items.length > 0 ? invoice.items.map((item, i) => {
                                const price = item.unit_price ?? 0;
                                const qty = item.quantity ?? 0;
                                return (
                                    <tr key={i}>
                                        <td className="border border-gray-300 p-1">{item.product_name || "-"}</td>
                                        <td className="border border-gray-300 p-1">{item.product_code || "-"}</td>
                                        <td className="border border-gray-300 p-1 text-right">{price.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-1 text-center">{qty}</td>
                                        <td className="border border-gray-300 p-1 text-right">{(price * qty).toFixed(2)}</td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={5} className="border p-2 text-center">No items found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* TOTALS */}
                    <div className="flex justify-end mb-6">
                        <table className="border border-gray-400 w-[250px] text-[12px] text-right">
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium">GOODS VALUE</td>
                                    <td className="border border-gray-300 p-1">{(invoice.total_amount ?? 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium">DISCOUNT</td>
                                    <td className="border border-gray-300 p-1">- {(invoice.discount_value ?? 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium">TOTAL</td>
                                    <td className="border border-gray-300 p-1">{((invoice.net_total ?? 0)).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium">VAT 18%</td>
                                    <td className="border border-gray-300 p-1">{((invoice.net_total ?? 0) * 0.18).toFixed(2)}</td>
                                </tr>
                                <tr className="bg-pink-100 font-bold">
                                    <td className="border border-gray-300 p-1">GRAND TOTAL</td>
                                    <td className="border border-gray-300 p-1">{((invoice.net_total ?? 0) * 1.18).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* NOTE */}
                    <div className="border-t border-gray-300 pt-2 mt-2">
                        <p className="text-center text-xs italic">
                            NOTE: All Cheques to be drawn in favour of <b>Namaratne Motor Distributors</b> and crossed ‘Account Payee’
                        </p>
                    </div>

                    {/* SIGNATURES */}
                    <div className="flex justify-between mt-10 text-xs">
                        <div className="text-center">
                            <div className="mb-8">...........................................................</div>
                            <p>Customer Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-8">...........................................................</div>
                            <p>NMD Representative Signature</p>
                        </div>
                    </div>

                </div>
            </div>
        </Authenticated>
    );
}
