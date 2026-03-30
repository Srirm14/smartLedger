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

const OtherProductsTable = ({ otherProductsData = [] }) => {
  // Function to format numbers with 2 decimal places
  const formatNumber = (number) => {
    return Number(number).toFixed(2);
  };

  return (
    <div className="space-y-3 py-4 px-6">
      <h3 className="text-sm font-semibold tracking-tight text-[var(--neutral-gray800)] other-products-report-title">
        Other Products Report
      </h3>
      <div className="rounded-lg border border-[var(--neutral-gray200)] shadow-sm other-products-table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--neutral-gray50)]">
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-left">
                Sales Unit
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-left">
                Product Name
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-left">
                Category
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Opening Quantity
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Closing Quantity
              </TableHead>
              <TableHead className="py-4 px-6 text-xs font-medium text-[var(--neutral-gray700)] text-right">
                Sold Quantity (UOM)
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
            {otherProductsData.length > 0 ? (
              otherProductsData.map((product, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-[var(--neutral-gray50)] transition-colors"
                >
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-left">
                    {product.sales_unit_name}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-left">
                    {product.product_name}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-left capitalize">
                    {product.category}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatNumber(product.opening_reading)}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatNumber(product.closing_reading)}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatNumber(product.meter_difference)} {product.uom}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatINR(product.price)}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-[var(--neutral-gray700)] text-right">
                    {formatINR(product.sales)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-sm text-[var(--neutral-gray600)]"
                >
                  No other products data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

OtherProductsTable.propTypes = {
  otherProductsData: PropTypes.arrayOf(
    PropTypes.shape({
      sales_unit_name: PropTypes.string.isRequired,
      product_name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      opening_reading: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      closing_reading: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      meter_difference: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      uom: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      sales: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
};

export default OtherProductsTable; 