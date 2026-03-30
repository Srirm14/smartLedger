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

const FuelTable = ({ fuelData = [] }) => {
  // Function to format numbers with 2 decimal places
  const formatNumber = (number) => {
    return Number(number).toFixed(2);
  };

  return (
    <div className="space-y-3 px-6 py-6">
      <h3 className="text-sm font-semibold tracking-tight text-[var(--neutral-gray800)] fuel-report-title">Fuel Report</h3>
      <div className="rounded-lg border border-[var(--neutral-gray200)] shadow-sm fuel-table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--neutral-gray50)]">
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-left">
                Sales Unit
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-left">
                Product Name
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Opening Reading
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Closing Reading
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Quantity (Ltr)
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Price (₹)
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Total Sale (₹)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fuelData.length > 0 ? (
              fuelData.map((fuel, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-[var(--neutral-gray50)] transition-colors"
                >
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-left">
                    {fuel.sales_unit_name}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-left">
                    {fuel.product_name}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatNumber(fuel.opening_reading)}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatNumber(fuel.closing_reading)}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatNumber(fuel.meter_difference)}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatINR(fuel.price)}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatINR(fuel.sales)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-sm text-[var(--neutral-gray600)]"
                >
                  No fuel data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

FuelTable.propTypes = {
  fuelData: PropTypes.arrayOf(
    PropTypes.shape({
      sales_unit_name: PropTypes.string.isRequired,
      product_name: PropTypes.string.isRequired,
      opening_reading: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      closing_reading: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      meter_difference: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      price: PropTypes.number.isRequired,
      sales: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
};

export default FuelTable;
