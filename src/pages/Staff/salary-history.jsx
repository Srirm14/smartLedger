"use client"

import { useState } from "react"
import { format } from "date-fns"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BaseTable } from "@/components/Table/BaseTable"
import TableDataPagination from "@/components/Table/TableDataPagination"

export default function SalaryHistory({ salaryData = [] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return salaryData.slice(startIndex, endIndex)
  }

  const handlePaySlip = (salary) => {
  }

  const columns = [
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => format(new Date(row.original.month), "MMMM yyyy"),
    },
    {
      accessorKey: "baseSalary",
      header: "Base Salary",
      cell: ({ row }) => `₹${row.original.baseSalary.toFixed(2)}`,
    },
    {
      accessorKey: "deductions",
      header: "Deductions",
      cell: ({ row }) => `₹${row.original.deductions.toFixed(2)}`,
    },
    {
      accessorKey: "netPayable",
      header: "Net Payable",
      cell: ({ row }) => `₹${row.original.netPayable.toFixed(2)}`,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => handlePaySlip(row.original)}
        >
          <FileText className="h-4 w-4" />
          Pay slip
        </Button>
      ),
    },
  ]

  return (
    <div className="rounded-lg border border-gray-200">
      <BaseTable
        columns={columns}
        data={getCurrentPageData()}
        loading={false}
        isRowClickable={false}
      />
      {salaryData.length > 0 && (
        <TableDataPagination
          currentPage={currentPage}
          totalItems={salaryData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  )
}
