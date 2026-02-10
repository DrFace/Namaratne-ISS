import { useEffect } from "react";

interface InventoryItem {
  id: number;
  productCode: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  lowStock: number;
  status: string;
  stockStatus: string;
}

export default function InventoryReport({
  inventory,
  generatedAt,
}: {
  inventory: InventoryItem[];
  generatedAt: string;
}) {
  useEffect(() => {
    setTimeout(() => window.print(), 500);
  }, []);

  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const lowStockItems = inventory.filter(item => item.stockStatus === 'Low Stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.sellingPrice || 0)), 0);

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
              <div
                  style={{
                      textAlign: "center",
                      marginBottom: "30px",
                      borderBottom: "3px solid #333",
                      paddingBottom: "15px",
                  }}
              >
                  <h1
                      style={{
                          fontSize: "28px",
                          margin: "0 0 8px 0",
                          fontWeight: "bold",
                      }}
                  >
                      Inventory Report
                  </h1>
                  <p
                      style={{
                          margin: "5px 0",
                          fontSize: "14px",
                          color: "#666",
                      }}
                  >
                      Generated: {new Date(generatedAt).toLocaleString()}
                  </p>
              </div>

              {/* Summary Stats */}
              <div
                  style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "15px",
                      marginBottom: "25px",
                      padding: "15px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                  }}
              >
                  <div>
                      <div
                          style={{
                              fontSize: "11px",
                              color: "#666",
                              marginBottom: "5px",
                          }}
                      >
                          Total Products
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                          {totalItems}
                      </div>
                  </div>
                  <div>
                      <div
                          style={{
                              fontSize: "11px",
                              color: "#666",
                              marginBottom: "5px",
                          }}
                      >
                          Total Quantity
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                          {totalQuantity.toLocaleString()}
                      </div>
                  </div>
                  <div>
                      <div
                          style={{
                              fontSize: "11px",
                              color: "#666",
                              marginBottom: "5px",
                          }}
                      >
                          Low Stock Items
                      </div>
                      <div
                          style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: lowStockItems > 0 ? "#d32f2f" : "#2e7d32",
                          }}
                      >
                          {lowStockItems}
                      </div>
                  </div>
                  <div>
                      <div
                          style={{
                              fontSize: "11px",
                              color: "#666",
                              marginBottom: "5px",
                          }}
                      >
                          Total Value
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                          Rs. {totalValue.toLocaleString()}
                      </div>
                  </div>
              </div>

              {/* Inventory Table */}
              <table
                  style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "10px",
                  }}
              >
                  <thead>
                      <tr style={{ backgroundColor: "#333", color: "white" }}>
                          <th
                              style={{
                                  padding: "10px 6px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #333",
                              }}
                          >
                              Code
                          </th>
                          <th
                              style={{
                                  padding: "10px 6px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #333",
                              }}
                          >
                              Item Name
                          </th>
                          <th
                              style={{
                                  padding: "10px 6px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #333",
                              }}
                          >
                              Batch
                          </th>
                          <th
                              style={{
                                  padding: "10px 6px",
                                  textAlign: "right",
                                  borderBottom: "2px solid #333",
                              }}
                          >
                              Qty
                          </th>
                          <th
                              style={{
                                  padding: "10px 6px",
                                  textAlign: "right",
                                  borderBottom: "2px solid #333",
                              }}
                          >
                              Buying
                          </th>
                          <th
                              style={{
                                  padding: "10px 6px",
                                  textAlign: "right",
                                  borderBottom: "2px solid #333",
                              }}
                          >
                              Selling
                          </th>
                          <th
                              style={{
                                  padding: "10px 6px",
                                  textAlign: "center",
                                  borderBottom: "2px solid #333",
                              }}
                          >
                              Stock
                          </th>
                      </tr>
                  </thead>
                  <tbody>
                      {inventory.map((item, index) => (
                          <tr
                              key={item.id}
                              style={{
                                  backgroundColor:
                                      index % 2 === 0 ? "#fff" : "#f9f9f9",
                              }}
                          >
                              <td
                                  style={{
                                      padding: "8px 6px",
                                      borderBottom: "1px solid #ddd",
                                  }}
                              >
                                  {item.productCode}
                              </td>
                              <td
                                  style={{
                                      padding: "8px 6px",
                                      borderBottom: "1px solid #ddd",
                                  }}
                              >
                                  {item.productName}
                              </td>
                              <td
                                  style={{
                                      padding: "8px 6px",
                                      borderBottom: "1px solid #ddd",
                                  }}
                              >
                                  {item.batchNumber}
                              </td>
                              <td
                                  style={{
                                      padding: "8px 6px",
                                      borderBottom: "1px solid #ddd",
                                      textAlign: "right",
                                      fontWeight: "bold",
                                  }}
                              >
                                  {Number(item.quantity).toLocaleString()}
                              </td>
                              <td
                                  style={{
                                      padding: "8px 6px",
                                      borderBottom: "1px solid #ddd",
                                      textAlign: "right",
                                  }}
                              >
                                  Rs.{" "}
                                  {Number(item.buyingPrice).toLocaleString()}
                              </td>
                              <td
                                  style={{
                                      padding: "8px 6px",
                                      borderBottom: "1px solid #ddd",
                                      textAlign: "right",
                                  }}
                              >
                                  Rs.{" "}
                                  {Number(item.sellingPrice).toLocaleString()}
                              </td>
                              <td
                                  style={{
                                      padding: "8px 6px",
                                      borderBottom: "1px solid #ddd",
                                      textAlign: "center",
                                  }}
                              >
                                  <span
                                      style={{
                                          padding: "2px 8px",
                                          borderRadius: "4px",
                                          fontSize: "9px",
                                          backgroundColor:
                                              item.stockStatus === "Low Stock"
                                                  ? "#ffebee"
                                                  : "#e8f5e9",
                                          color:
                                              item.stockStatus === "Low Stock"
                                                  ? "#c62828"
                                                  : "#2e7d32",
                                      }}
                                  >
                                      {item.stockStatus}
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>

              {/* Footer */}
              <div
                  style={{
                      marginTop: "30px",
                      paddingTop: "15px",
                      borderTop: "2px solid #ddd",
                      textAlign: "center",
                      fontSize: "11px",
                      color: "#666",
                  }}
              >
                  <p style={{ margin: "5px 0" }}>End of Report</p>
              </div>
          </div>
      </>
  );
}
