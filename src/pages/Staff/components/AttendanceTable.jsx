"use client";

import { BaseTable } from "@/components/Table/BaseTable";
import { Badge } from "@/components/ui/badge";
import TableDataPagination from "@/components/Table/TableDataPagination";
import { format } from "date-fns";

const getStatusBadge = (status) => {
  switch (status) {
    case "present":
      return <Badge className="bg-green-500">Present</Badge>;
    case "absent":
      return <Badge className="bg-red-500">Absent</Badge>;
    case "leave":
      return <Badge className="bg-orange-500">Leave</Badge>;
    default:
      return null;
  }
};

export default function AttendanceTable({
  attendanceData,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return attendanceData.slice(startIndex, endIndex);
  };

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.date), "dd MMM yyyy"),
    },
    {
      accessorKey: "morningShift",
      header: "Morning Shift",
      cell: ({ row }) => getStatusBadge(row.original.morningShift),
    },
    {
      accessorKey: "eveningShift",
      header: "Evening Shift",
      cell: ({ row }) => getStatusBadge(row.original.eveningShift),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200">
      <BaseTable
        columns={columns}
        data={getCurrentPageData()}
        loading={false}
        isRowClickable={false}
      />
      {attendanceData.length > 0 && (
        <TableDataPagination
          currentPage={currentPage}
          totalItems={attendanceData.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={(newPageSize) => {
            onPageSizeChange(newPageSize);
            onPageChange(1);
          }}
        />
      )}
    </div>
  );
} 