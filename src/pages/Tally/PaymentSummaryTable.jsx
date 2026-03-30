import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/utils/formatters";
import PropTypes from "prop-types";

const PaymentSummaryTable = ({ data }) => {
  if (!Array.isArray(data) || data.length < 2) {
    return (
      <div className="rounded-lg border p-8">
        <p className="text-center text-sm text-muted-foreground">
          Insufficient data available
        </p>
      </div>
    );
  }

  const [incomeExpense, tally] = data;

  // Handle missing or undefined values
  const overallPaymentReceived = tally?.overall_payment_received ?? "N/A";
  const totalSales = tally?.total_sales ?? "N/A";
  const balanceDifference = tally?.overall_payment_tally ?? "N/A";
  const totalCredit = tally?.credit ?? "N/A";

  // Determine balance status

  let balanceStatusColor = "text-success-600";
  let balanceStatusLabel = "Ledger Balanced";

  if (balanceDifference > 0) {
    balanceStatusColor = "text-warning-600";
    balanceStatusLabel = `Extra Tracked: ${formatINR(balanceDifference)}`;
  } else if (balanceDifference < 0) {
    balanceStatusColor = "text-danger-600";
    balanceStatusLabel = `Untracked: ${formatINR(Math.abs(balanceDifference))}`;
  }

  if (
    overallPaymentReceived === "N/A" &&
    totalSales === "N/A" &&
    balance === "N/A" &&
    totalCredit === "N/A"
  ) {
    return (
      <div className="rounded-lg border p-8">
        <p className="text-center text-sm text-muted-foreground">
          No records available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-6 py-4">
      <h3 className="text-sm font-semibold tracking-tight text-[var(--neutral-gray800)] payment-summary-report-title">
        Payment Summary
      </h3>
      <div className="rounded-lg border border-[var(--neutral-gray200)] shadow-sm payment-summary-table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--neutral-gray50)]">
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Overall Payment Received (₹)
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Total Credit (₹)
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Total Sales (₹)
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Tally Balance (₹)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-4 px-6 text-sm font-medium text-right">
                {formatINR(overallPaymentReceived)}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm font-medium text-right">
                {formatINR(totalCredit)}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm font-medium text-right">
                {formatINR(totalSales)}
              </TableCell>
              <TableCell
                className={`py-4 px-6 text-sm font-medium text-right ${balanceStatusColor}`}
              >
                {balanceStatusLabel}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

PaymentSummaryTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      overall_payment_received: PropTypes.number,
      total_sales: PropTypes.number,
      overall_payment_tally: PropTypes.number,
      total_income: PropTypes.number,
      total_expense: PropTypes.number,
    })
  ).isRequired,
};

export default PaymentSummaryTable;
