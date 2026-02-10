import { useEffect } from "react";

interface Payment {
  id: number;
  billNumber: string;
  customerName: string;
  customerId: string;
  totalAmount: number;
  cashAmount: number;
  cardAmount: number;
  creditAmount: number;
  paymentMethod: string;
  date: string;
}

export default function PaymentReport({
  payments,
  generatedAt,
  startDate,
  endDate,
}: {
  payments: Payment[];
  generatedAt: string;
  startDate?: string;
  endDate?: string;
}) {
  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    window.history.back();
  };

  const totalSales = payments.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const totalCash = payments.reduce((sum, p) => sum + Number(p.cashAmount || 0), 0);
  const totalCard = payments.reduce((sum, p) => sum + Number(p.cardAmount || 0), 0);
  const totalCredit = payments.reduce((sum, p) => sum + Number(p.creditAmount || 0), 0);

  return (
    <>
      <style>{`
                @media print {
                    body { margin: 0; }
                    .page-break { page-break-before: always; }
                    .no-print { display: none; }
                }
                @page { margin: 1cm; }
                body { font-family: Arial, sans-serif; }
            `}</style>

      <div className="no-print bg-white border-b sticky top-0 z-50 p-4 mb-6 shadow-sm flex justify-between items-center">
        <button 
          onClick={handleBack}
          className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Reports
        </button>
        <button 
          onClick={handlePrint}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          Print Report
        </button>
      </div>

      <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "3px solid #333", paddingBottom: "15px" }}>
          <h1 style={{ fontSize: "28px", margin: "0 0 8px 0", fontWeight: "bold" }}>
            Payment Report
          </h1>
          {startDate && endDate && (
            <p style={{ margin: "5px 0", fontSize: "16px", color: "#333", fontWeight: "500" }}>
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </p>
          )}
          <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
            Generated: {new Date(generatedAt).toLocaleString()}
          </p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}>Total Transactions</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{payments.length}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}>Cash Payments</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>Rs. {totalCash.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}>Card Payments</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>Rs. {totalCard.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}>Credit Payments</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>Rs. {totalCredit.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#e8f5e9", borderRadius: "6px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#2e7d32", marginBottom: "3px" }}>Total Sales</div>
          <div style={{ fontSize: "26px", fontWeight: "bold", color: "#1b5e20" }}>Rs. {totalSales.toLocaleString()}</div>
        </div>

        {/* Payment Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th style={{ padding: "10px 6px", textAlign: "left", borderBottom: "2px solid #333" }}>Bill #</th>
              <th style={{ padding: "10px 6px", textAlign: "left", borderBottom: "2px solid #333" }}>Customer</th>
              <th style={{ padding: "10px 6px", textAlign: "left", borderBottom: "2px solid #333" }}>Date</th>
              <th style={{ padding: "10px 6px", textAlign: "center", borderBottom: "2px solid #333" }}>Method</th>
              <th style={{ padding: "10px 6px", textAlign: "right", borderBottom: "2px solid #333" }}>Cash</th>
              <th style={{ padding: "10px 6px", textAlign: "right", borderBottom: "2px solid #333" }}>Card</th>
              <th style={{ padding: "10px 6px", textAlign: "right", borderBottom: "2px solid #333" }}>Credit</th>
              <th style={{ padding: "10px 6px", textAlign: "right", borderBottom: "2px solid #333" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd" }}>{payment.billNumber}</td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd" }}>
                  <div>{payment.customerName}</div>
                  <div style={{ fontSize: "9px", color: "#666" }}>{payment.customerId}</div>
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd" }}>{payment.date}</td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "center" }}>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    backgroundColor: payment.paymentMethod === 'Cash' ? '#e3f2fd' : payment.paymentMethod === 'Card' ? '#f3e5f5' : '#fff3e0',
                    color: payment.paymentMethod === 'Cash' ? '#1565c0' : payment.paymentMethod === 'Card' ? '#6a1b9a' : '#e65100'
                  }}>
                    {payment.paymentMethod}
                  </span>
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "right" }}>
                  {Number(payment.cashAmount) > 0 ? `Rs. ${Number(payment.cashAmount).toLocaleString()}` : '-'}
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "right" }}>
                  {Number(payment.cardAmount) > 0 ? `Rs. ${Number(payment.cardAmount).toLocaleString()}` : '-'}
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "right" }}>
                  {Number(payment.creditAmount) > 0 ? `Rs. ${Number(payment.creditAmount).toLocaleString()}` : '-'}
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
                  Rs. {Number(payment.totalAmount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: "30px", paddingTop: "15px", borderTop: "2px solid #ddd", textAlign: "center", fontSize: "11px", color: "#666" }}>
          <p style={{ margin: "5px 0" }}>End of Report</p>
        </div>
      </div>
    </>
  );
}
