import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/utils/formatters";
import { format } from "date-fns";
import Backdrop from "../Backdrop";
import { Skeleton } from "@/components/ui/skeleton";

export function CreditReportPreview({
  open,
  onOpenChange,
  previewData,
  customerName,
  dateRange,
  isLoading,
}) {
  if (!previewData || !previewData.data) return null;

  const { preview = [], total_amount, interest, base_amount } = previewData.data;

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "-";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return format(date, "PPP");
    } catch (error) {
      return "-";
    }
  };

  return (
    <>
      {open && <Backdrop />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Credit Report Preview</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Customer Name</p>
                <p className="text-sm">{customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date Range</p>
                <p className="text-sm">
                  {formatDate(dateRange?.from)} to {formatDate(dateRange?.to)}
                </p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle No</TableHead>
                    <TableHead>Portfolio</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton rows
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[80px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[120px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[80px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : preview && preview.length > 0 ? (
                    preview.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.vehicle_no}</TableCell>
                        <TableCell>{item.portfolio_name}</TableCell>
                        <TableCell>
                          {Array.isArray(item.product_name)
                            ? item.product_name.map((product, i) => (
                                <div key={i}>{product}</div>
                              ))
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(item.quantity)
                            ? item.quantity.map((qty, i) => (
                                <div key={i}>{qty}</div>
                              ))
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(item.price)
                            ? item.price.map((price, i) => (
                                <div key={i}>{formatINR(price)}</div>
                              ))
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(item.amount)
                            ? item.amount.map((amt, i) => (
                                <div key={i}>{formatINR(amt)}</div>
                              ))
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Section */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Base Amount</p>
                  <p className="text-lg font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-6 w-[120px]" />
                    ) : (
                      formatINR(base_amount)
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Interest</p>
                  <p className="text-lg font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-6 w-[120px]" />
                    ) : (
                      formatINR(interest)
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {isLoading ? (
                      <Skeleton className="h-8 w-[150px]" />
                    ) : (
                      formatINR(total_amount)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
