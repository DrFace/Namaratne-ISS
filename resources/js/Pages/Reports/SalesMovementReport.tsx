import { useEffect } from "react";

interface SalesMovement {
  id: number;
  billNumber: string;
  productCode: string;
  productName: string;
  customerName: string;
  customerId: string;
  quantity: number;
  salePrice: number;
  discount: number;
  totalAmount: number;
  date: string;
}

export default function SalesMovementReport({
  salesMovements,
  generatedAt,
  startDate,
  endDate,
}: {
  salesMovements: SalesMovement[];
  generatedAt: string;
  startDate?: string;
  endDate?: string;
}) {
  useEffect(() => {
    setTimeout(() => window.print(), 500);
  }, []);

  const totalQuantity = salesMovements.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalDiscount = salesMovements.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const totalSales = salesMovements.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

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

      <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "3px solid #333", paddingBottom: "15px" }}>
          <h1 style={{ fontSize: "28px", margin: "0 0 8px 0", fontWeight: "bold" }}>
            Sales Movement Report
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}>Total Transactions</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{salesMovements.length}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}>Total Quantity Sold</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{totalQuantity.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "5px" }}>Total Discounts</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>Rs. {totalDiscount.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#e8f5e9", borderRadius: "6px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#2e7d32", marginBottom: "3px" }}>Total Sales Revenue</div>
          <div style={{ fontSize: "26px", fontWeight: "bold", color: "#1b5e20" }}>Rs. {totalSales.toLocaleString()}</div>
        </div>

        {/* Sales Movement Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th style={{ padding: "10px 6px", textAlign: "left", borderBottom: "2px solid #333" }}>Bill #</th>
              <th style={{ padding: "10px 6px", textAlign: "left", borderBottom: "2px solid #333" }}>Product</th>
              <th style={{ padding: "10px 6px", textAlign: "left", borderBottom: "2px solid #333" }}>Customer</th>
              <th style={{ padding: "10px 6px", textAlign: "left", borderBottom: "2px solid #333" }}>Date</th>
              <th style={{ padding: "10px 6px", textAlign: "right", borderBottom: "2px solid #333" }}>Qty</th>
              <th style={{ padding: "10px 6px", textAlign: "right", borderBottom: "2px solid #333" }}>Price</th>
              <th style={{ padding: "10px 6px", textAlign: "right", borderBottom: "2px solid #333" }}>Disc.</th>
              <th style={{ padding: "10px 6px", textAlign: "right", borderBottom: "2px solid #333" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {salesMovements.map((item, index) => (
              <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd" }}>{item.billNumber}</td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd" }}>
                  <div style={{ fontWeight: "bold" }}>{item.productName}</div>
                  <div style={{ fontSize: "9px", color: "#666" }}>{item.productCode}</div>
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd" }}>
                  <div>{item.customerName}</div>
                  <div style={{ fontSize: "9px", color: "#666" }}>{item.customerId}</div>
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd" }}>{item.date}</td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
                  {Number(item.quantity).toLocaleString()}
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "right" }}>
                  Rs. {Number(item.salePrice).toLocaleString()}
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "right", color: Number(item.discount) > 0 ? "#d32f2f" : "#666" }}>
                  {Number(item.discount) > 0 ? `Rs. ${Number(item.discount).toLocaleString()}` : '-'}
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
                  Rs. {Number(item.totalAmount).toLocaleString()}
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
