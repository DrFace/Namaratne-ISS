import { useEffect } from "react";

interface Customer {
  id: number;
  customerId: string;
  name: string;
  contactNumber: string;
  creditLimit: number;
  totalSales: number;
}

export default function CustomerReport({
  customers,
  generatedAt,
}: {
  customers: Customer[];
  generatedAt: string;
}) {
  useEffect(() => {
    setTimeout(() => window.print(), 500);
  }, []);

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
            Customer Report
          </h1>
          <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
            Generated: {new Date(generatedAt).toLocaleString()}
          </p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "25px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Total Customers</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{customers.length}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Total Sales</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              Rs. {customers.reduce((sum, c) => sum + Number(c.totalSales || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #333" }}>ID</th>
              <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #333" }}>Name</th>
              <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #333" }}>Contact</th>
              <th style={{ padding: "12px 8px", textAlign: "right", borderBottom: "2px solid #333" }}>Credit Limit</th>
              <th style={{ padding: "12px 8px", textAlign: "right", borderBottom: "2px solid #333" }}>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #ddd" }}>{customer.customerId}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #ddd" }}>{customer.name}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #ddd" }}>{customer.contactNumber}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #ddd", textAlign: "right" }}>
                  Rs. {Number(customer.creditLimit || 0).toLocaleString()}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
                  Rs. {Number(customer.totalSales || 0).toLocaleString()}
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
