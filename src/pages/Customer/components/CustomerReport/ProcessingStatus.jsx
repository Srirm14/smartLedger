"use client";

import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Check,
  Loader2,
  Download,
  Bell,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Backdrop from "@/components/Backdrop";

// PropTypes definition
ProcessingStatus.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  selectedCustomers: PropTypes.array.isRequired,
  currentAction: PropTypes.string,
  isProcessing: PropTypes.bool.isRequired,
  allCompleted: PropTypes.bool.isRequired,
  date: PropTypes.object.isRequired,
  onRetryFailed: PropTypes.func.isRequired,
  onResetProcess: PropTypes.func.isRequired,
};

export function ProcessingStatus({
  open,
  onOpenChange,
  selectedCustomers,
  currentAction,
  isProcessing,
  allCompleted,
  date,
  onRetryFailed,
  onResetProcess,
}) {
  // Computed values
  const successCount = useMemo(() => 
    selectedCustomers.filter((c) => c.status === "success").length,
    [selectedCustomers]
  );

  const errorCount = useMemo(() => 
    selectedCustomers.filter((c) => c.status === "error").length,
    [selectedCustomers]
  );

  const processedCount = useMemo(() => 
    selectedCustomers.filter(c => c.status !== "idle").length,
    [selectedCustomers]
  );

  const failedCustomers = useMemo(() => 
    selectedCustomers.filter((c) => c.status === "error"),
    [selectedCustomers]
  );

  return (
    <>
      {open && <Backdrop />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden p-0">
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-100px)]">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {currentAction === "download"
                  ? "Downloading Reports"
                  : "Sending Notifications"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Date range info */}
              {date?.from && date?.to && (
                <div className="p-3 bg-muted/10 rounded-lg">
                  <p className="text-xs font-medium">Date Range:</p>
                  <p className="text-xs text-muted-foreground">
                    {format(date.from, "MMMM dd, yyyy")} -{" "}
                    {format(date.to, "MMMM dd, yyyy")}
                  </p>
                </div>
              )}

              {/* Processing status */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">
                  {allCompleted
                    ? "Process completed"
                    : `Processing ${selectedCustomers.length} customers with successful previews...`}
                </h3>

                {/* Show info about filtered customers */}
                {!allCompleted && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      Only processing customers with successfully loaded previews
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Progress: {processedCount} of {selectedCustomers.length} customers processed
                    </p>
                  </div>
                )}

                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {selectedCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border text-sm",
                        customer.status === "success" &&
                          "bg-green-50 border-green-200",
                        customer.status === "error" &&
                          "bg-red-50 border-red-200",
                        customer.status === "loading" &&
                          "bg-blue-50 border-blue-200"
                      )}
                    >
                      <span className="font-medium truncate max-w-[270px]">
                        {customer.name}
                      </span>
                      <span>
                        {customer.status === "loading" && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        {customer.status === "success" && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {customer.status === "error" && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {customer.status === "idle" && (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {allCompleted && (
                <div className="p-3 bg-muted/10 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Summary</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center p-2 bg-background rounded-lg border">
                      <span className="text-muted-foreground">Processed</span>
                      <span className="text-base font-bold">
                        {selectedCustomers.length}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-600">Success</span>
                      <span className="text-base font-bold text-green-600">
                        {successCount}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-red-600">Failed</span>
                      <span className="text-base font-bold text-red-600">
                        {errorCount}
                      </span>
                    </div>
                  </div>
                  {/* Show total selected vs processed */}
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <p>Total selected: {selectedCustomers.length} customers</p>
                    <p>Successfully processed: {successCount} customers</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-4 flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={onResetProcess}
              disabled={isProcessing}
              className="px-3 h-9 text-sm"
            >
              {allCompleted ? "Close" : "Cancel"}
            </Button>

            {allCompleted && (
              <Button
                className="gap-2 px-3 h-9 text-sm"
                onClick={onRetryFailed}
                disabled={
                  failedCustomers.length === 0 || isProcessing
                }
              >
                {currentAction === "download" ? (
                  <Download className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                <span className="whitespace-nowrap">Retry Failed</span>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 