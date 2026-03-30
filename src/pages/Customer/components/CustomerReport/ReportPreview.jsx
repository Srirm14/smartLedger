"use client";

import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Check,
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

// PropTypes definition
ReportPreview.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  selectedCustomers: PropTypes.array.isRequired,
  previewDataMap: PropTypes.object.isRequired,
  isLoadingPreviewMap: PropTypes.object.isRequired,
  activePreviewCustomer: PropTypes.number,
  onActiveCustomerChange: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  isDownloading: PropTypes.bool.isRequired,
};

// Preview Skeleton Component
function PreviewSkeleton() {
  return (
    <div className="space-y-4">
      {/* Summary Card Skeleton */}
      <div className="bg-muted/10 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="p-4 border-b last:border-b-0">
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReportPreview({
  open,
  onOpenChange,
  selectedCustomers,
  previewDataMap,
  isLoadingPreviewMap,
  activePreviewCustomer,
  onActiveCustomerChange,
  onDownload,
  isDownloading,
}) {
  // Computed values
  const successfulPreviewCount = useMemo(() => 
    Object.keys(previewDataMap).filter(key => !previewDataMap[key]?.error).length,
    [previewDataMap]
  );

  const failedPreviewCount = useMemo(() => 
    Object.keys(previewDataMap).filter(key => previewDataMap[key]?.error).length,
    [previewDataMap]
  );

  const availableCustomersCount = useMemo(() => 
    Object.keys(previewDataMap).filter(key => !previewDataMap[key]?.error).length,
    [previewDataMap]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Report Preview</DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Customer List Sidebar */}
          <div className="w-64 border-r pr-3 pl-3 overflow-y-auto">
            <h3 className="text-sm font-medium mb-2">Selected Customers</h3>
            <div className="space-y-1.5">
              {selectedCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onActiveCustomerChange(customer.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm",
                    "flex items-center justify-between group",
                    "transition-all duration-200 ease-in-out",
                    "border",
                    activePreviewCustomer === customer.id
                      ? "bg-primary border-primary shadow-sm text-primary-foreground"
                      : "border-transparent hover:border-primary/20 hover:bg-primary/5",
                    "relative overflow-hidden",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
                  )}
                >
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="truncate font-medium">
                      {customer.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoadingPreviewMap[customer.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary/70" />
                    ) : previewDataMap[customer.id]?.error ? (
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    ) : previewDataMap[customer.id] ? (
                      <div className="flex items-center text-primary">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                  </div>
                  {activePreviewCustomer === customer.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                  )}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 transition-opacity duration-200",
                      "bg-gradient-to-r from-primary/5 to-transparent",
                      "group-hover:opacity-100",
                      activePreviewCustomer === customer.id ? "hidden" : ""
                    )}
                  />
                </button>
              ))}
            </div>
            {/* Summary of preview status */}
            <div className="mt-4 px-3 py-2 bg-muted/10 rounded-lg">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Total Selected:</span>
                  <span className="font-medium">
                    {selectedCustomers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Previews Loaded:</span>
                  <span className="font-medium text-primary">
                    {successfulPreviewCount}
                  </span>
                </div>
                {failedPreviewCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Failed:</span>
                    <span className="font-medium text-red-500">
                      {failedPreviewCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 pl-4 overflow-y-auto">
            {activePreviewCustomer &&
            previewDataMap[activePreviewCustomer] &&
            !previewDataMap[activePreviewCustomer].error ? (
              <div className="space-y-4">
                {/* Summary Card */}
                <div className="bg-muted/10 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Customer
                      </h4>
                      <p className="text-lg font-semibold">
                        {
                          selectedCustomers.find(
                            (c) => c.id === activePreviewCustomer
                          )?.name
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Total Entries
                      </h4>
                      <p className="text-lg font-semibold">
                        {previewDataMap[activePreviewCustomer].total_entries}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Total Amount
                      </h4>
                      <p className="text-lg font-semibold text-primary">
                        ₹
                        {previewDataMap[
                          activePreviewCustomer
                        ].total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Portfolio</TableHead>
                        <TableHead>Vehicle No.</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewDataMap[activePreviewCustomer].preview.map(
                        (entry, index) => (
                          <TableRow key={index}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.portfolio_name}</TableCell>
                            <TableCell>{entry.vehicle_no}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {entry.product_name.map((product, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between"
                                  >
                                    <span>{product}</span>
                                    <span className="text-muted-foreground">
                                      {entry.quantity[idx]} {entry.uom} × ₹
                                      {entry.price[idx]}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{entry.total_amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : activePreviewCustomer &&
              previewDataMap[activePreviewCustomer]?.error ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {previewDataMap[activePreviewCustomer].message || "Failed to Load Preview"}
                </h3>
                <p className="text-muted-foreground">
                  Please check the date range and try again.
                </p>
              </div>
            ) : activePreviewCustomer && isLoadingPreviewMap[activePreviewCustomer] ? (
              <PreviewSkeleton />
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <p className="text-muted-foreground">
                  Select a customer to view their report preview
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-4 mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Preview available for {Object.keys(previewDataMap).length} of{" "}
              {selectedCustomers.length} customers
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={onDownload}
              disabled={
                isDownloading || availableCustomersCount === 0
              }
              className="gap-2"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Bills ({availableCustomersCount} available)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 