"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export default function StaffDetails({ employee, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <Card className="border-none shadow-none rounded-lg ">
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
        <div className="flex justify-end mb-4 space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(employee)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium text-gray-900">{employee?.id || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Employee ID</p>
              <p className="font-medium text-gray-900">{employee?.employee_id || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Staff Name</p>
              <p className="font-medium text-gray-900">{employee?.name || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900">{employee?.role || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{employee?.email || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900">{employee?.contact_number || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Salary</p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {employee?.salary ? `₹${Number(employee.salary).toLocaleString()}` : "-"}
                </span>
                <Badge
                  className="bg-green-50 text-green-500 border-green-500"
                  variant="outline"
                >
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
