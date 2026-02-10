<?php

namespace App\Services;

use App\Models\Sales;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceService
{
    /**
     * Generate PDF invoice for a sale
     */
    public function generateInvoicePdf(int $saleId)
    {
        $sale = Sales::with(['customer', 'items.product', 'createdByUser'])->findOrFail($saleId);

        $pdf = Pdf::loadView('invoices.standard', compact('sale'));

        return $pdf;
    }

    /**
     * Send invoice via email
     */
    public function sendInvoiceEmail(int $saleId, string $email)
    {
        // Will implement with Mailables in Phase 2/Mobile
        return true;
    }
}
