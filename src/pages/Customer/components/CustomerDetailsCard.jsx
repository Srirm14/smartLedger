"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const CustomerDetailsCard = ({ 
  customerId, 
  customerName, 
  outstandingBalance, 
  unbilledAmount, 
  email, 
  phone, 
  creditLimit,
  loading,
  onEdit
}) => {
  if (loading) {
    return (
      <Card className="border-none shadow-none rounded-lg">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-none">
      <CardContent className="px-6">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit()}
            className="text-gray-600 hover:text-gray-900"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Customer Id</p>
              <p className="font-medium text-gray-900">{customerId || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="font-medium text-gray-900">{customerName || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{email || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900">{phone || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Credit Limit</p>
              <p className="font-medium text-gray-900">₹{creditLimit?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Outstanding Balance</p>
              <div className="flex items-center gap-2">
                {(() => {
                  let absValue = Math.abs(Number(outstandingBalance) || 0).toFixed(2);
                  let isNegative = Number(outstandingBalance) < 0;
                  let isZero = Number(outstandingBalance) === 0;
                  let colorClass = isZero
                    ? "text-gray-900"
                    : isNegative
                    ? "text-[var(--warning-600)]"
                    : "text-[var(--success-500)]";
                  return (
                    <span className={`font-medium ${colorClass}`}>
                      ₹{absValue}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Unbilled Amount</p>
              <p className="font-medium text-gray-900">₹{unbilledAmount?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDetailsCard; 