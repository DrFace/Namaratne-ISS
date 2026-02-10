<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order #{{ $order->po_number }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company-info { font-size: 14px; }
        .po-title { font-size: 28px; font-weight: bold; margin: 0; }
        .po-info { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #777; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        th { text-align: left; background: #f9f9f9; padding: 12px; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #333; }
        td { padding: 12px; font-size: 14px; border-bottom: 1px solid #eee; }
        .total-section { margin-top: 30px; margin-left: auto; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
        @media print {
            .no-print { display: none; }
            body { margin: 20px; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="background: #f1f1f1; padding: 15px; text-align: center; margin-bottom: 30px; border-radius: 8px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Purchase Order</button>
    </div>

    <div class="header">
        <div class="company-info">
            <h1 style="margin: 0; color: #333;">Namaratne ISS</h1>
            <p>123 Business Road, Colombo, Sri Lanka</p>
            <p>Phone: +94 11 234 5678 | Email: sales@namaratne.lk</p>
        </div>
        <div style="text-align: right;">
            <p class="po-title">PURCHASE ORDER</p>
            <p style="font-size: 18px; margin: 5px 0;">#{{ $order->po_number }}</p>
            <p>Date: {{ $order->order_date->format('M d, Y') }}</p>
        </div>
    </div>

    <div class="po-info">
        <div>
            <p class="section-title">Supplier</p>
            <p><strong>{{ $order->supplier->supplierName }}</strong></p>
            <p>{{ $order->supplier->companyName }}</p>
            <p>{{ $order->supplier->supplierAddress }}</p>
            <p>Phone: {{ $order->supplier->supplierPhone }}</p>
        </div>
        <div>
            <p class="section-title">Ship To</p>
            <p><strong>Main Warehouse - Namaratne ISS</strong></p>
            <p>123 Business Road, Colombo</p>
            <p>Expected Delivery: {{ $order->expected_delivery_date ? $order->expected_delivery_date->format('M d, Y') : 'TBD' }}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>SKU</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Cost</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->productName }}</td>
                <td>{{ $item->product->productCode }}</td>
                <td style="text-align: center;">{{ $item->quantity }}</td>
                <td style="text-align: right;">Rs. {{ number_format($item->unit_cost, 2) }}</td>
                <td style="text-align: right;">Rs. {{ number_format($item->total_cost, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-row grand-total">
            <span>TOTAL DUE</span>
            <span>Rs. {{ number_format($order->total_amount, 2) }}</span>
        </div>
    </div>

    @if($order->notes)
    <div style="margin-top: 50px;">
        <p class="section-title">Instructions / Notes</p>
        <p style="font-size: 14px; line-height: 1.6;">{{ $order->notes }}</p>
    </div>
    @endif

    <div style="margin-top: 100px; display: flex; justify-content: space-between;">
        <div style="width: 200px; border-top: 1px solid #333; text-align: center; padding-top: 10px; font-size: 12px;">Authorized Signature</div>
        <div style="width: 200px; border-top: 1px solid #333; text-align: center; padding-top: 10px; font-size: 12px;">Date</div>
    </div>
</body>
</html>
