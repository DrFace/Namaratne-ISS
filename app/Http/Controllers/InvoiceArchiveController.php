<?php

namespace App\Http\Controllers;

use App\Models\Sales;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceArchiveController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        // Base query for both tabs
        $base = Sales::query()
            ->with(['customer:id,name']) // customer relationship already exists in Sales model
            ->select([
                'id',
                'customerId',
                'totalAmount',
                'paidAmount',
                'dueAmount',
                'paymentMethod',
                'status',
                'billNumber',
                'created_at',
            ])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    // bill number search
                    $sub->where('billNumber', 'like', "%{$q}%")
                        // customer name search
                        ->orWhereHas('customer', function ($c) use ($q) {
                            $c->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->orderByDesc('created_at');

        // Printed invoices = approved sales
        $printed = (clone $base)
            ->where('status', 'approved')
            ->paginate(10, ['*'], 'printedPage')
            ->withQueryString();

        // Draft invoices = draft sales
        $drafts = (clone $base)
            ->where('status', 'draft')
            ->paginate(10, ['*'], 'draftPage')
            ->withQueryString();

        // Add a flat customer_name for frontend convenience
        $printed->getCollection()->transform(function ($sale) {
            $sale->customer_name = $sale->customer?->name;
            return $sale;
        });

        $drafts->getCollection()->transform(function ($sale) {
            $sale->customer_name = $sale->customer?->name;
            return $sale;
        });

        return Inertia::render('Invoices/Archive', [
            'filters' => [
                'q' => $q,
            ],
            'printed' => $printed,
            'drafts' => $drafts,
        ]);
    }
}
