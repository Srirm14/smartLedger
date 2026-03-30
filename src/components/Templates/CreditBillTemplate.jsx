import { formatINR } from "@/lib/utils/formatters";
import { format } from "date-fns";

export function CreditBillTemplate({ billData, customerName }) {
  if (!billData) return null;

  const { preview, total_amount, interest, base_amount, bill_id } = billData;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">CREDIT BILL</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">Bill No: {bill_id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Generated Date: {format(new Date(), "PPP")}</p>
            <p className="text-xs text-gray-500 mt-1">Smart Ledger™ - Professional Billing System</p>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Details</h2>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-600">Customer Name</p>
            <p className="text-base font-medium">{customerName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Bill Period</p>
            <p className="text-base">
              {format(new Date(preview[0]?.date), "PPP")} to{" "}
              {format(new Date(preview[preview.length - 1]?.date), "PPP")}
            </p>
          </div>
        </div>
      </div>

      {/* Bill Items */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-2 text-left text-sm font-semibold text-gray-600 border-b">Date</th>
              <th className="py-3 px-2 text-left text-sm font-semibold text-gray-600 border-b">Vehicle No</th>
              <th className="py-3 px-2 text-left text-sm font-semibold text-gray-600 border-b">Portfolio</th>
              <th className="py-3 px-2 text-left text-sm font-semibold text-gray-600 border-b">Products</th>
              <th className="py-3 px-2 text-right text-sm font-semibold text-gray-600 border-b">Quantity</th>
              <th className="py-3 px-2 text-right text-sm font-semibold text-gray-600 border-b">Price</th>
              <th className="py-3 px-2 text-right text-sm font-semibold text-gray-600 border-b">Amount</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-3 px-2 text-sm border-b">{format(new Date(item.date), "dd/MM/yyyy")}</td>
                <td className="py-3 px-2 text-sm border-b">{item.vehicle_no}</td>
                <td className="py-3 px-2 text-sm border-b">{item.portfolio_name}</td>
                <td className="py-3 px-2 text-sm border-b">
                  {item.product_name.map((product, i) => (
                    <div key={i}>{product}</div>
                  ))}
                </td>
                <td className="py-3 px-2 text-sm text-right border-b">
                  {item.quantity.map((qty, i) => (
                    <div key={i}>{qty.toFixed(2)}</div>
                  ))}
                </td>
                <td className="py-3 px-2 text-sm text-right border-b">
                  {item.price.map((price, i) => (
                    <div key={i}>{formatINR(price)}</div>
                  ))}
                </td>
                <td className="py-3 px-2 text-sm text-right border-b">
                  {item.amount.map((amt, i) => (
                    <div key={i}>{formatINR(amt)}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="border-t pt-4">
        <div className="flex flex-col items-end space-y-2">
          <div className="flex justify-between w-64  p-2 rounded">
            <span className="text-sm font-medium text-gray-600">Base Amount:</span>
            <span className="text-sm font-medium">{formatINR(base_amount)}</span>
          </div>
          <div className="flex justify-between w-64  p-2 rounded">
            <span className="text-sm font-medium text-gray-600">Interest:</span>
            <span className="text-sm font-medium">{formatINR(interest)}</span>
          </div>
          <div className="flex justify-between w-64  p-3 rounded-lg border-t">
            <span className="text-base font-semibold text-gray-900">Total Amount:</span>
            <span className="text-base font-bold text-gray-900">{formatINR(total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">This is a computer-generated document.</p>
            <p className="text-xs text-gray-500">No signature is required.</p>
          </div>
        </div>
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-xs text-gray-400">Powered by Smart Ledger™ - Your Trusted Billing Partner</p>
        </div>
      </div>
    </div>
  );
} 