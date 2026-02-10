<?php

namespace App\Exports;

use App\Models\Sales;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SalesExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Sales::with(['customer', 'createdByUser'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Bill Number',
            'Customer',
            'Total Amount',
            'Paid Amount',
            'Due Amount',
            'Payment Method',
            'Status',
            'Created By',
            'Date',
        ];
    }

    public function map($sale): array
    {
        return [
            $sale->id,
            $sale->billNumber,
            $sale->customer->name ?? 'Walk-in',
            $sale->totalAmount,
            $sale->paidAmount,
            $sale->dueAmount,
            $sale->paymentMethod,
            $sale->status,
            $sale->createdByUser->name ?? 'N/A',
            $sale->created_at->format('Y-m-d H:i'),
        ];
    }
}
