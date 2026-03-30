"use client"

import { useState } from "react"
import { format } from "date-fns"
import { 
  Calendar,
  ClockIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  MessageSquareIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { attendanceOptions } from "./mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BaseTable } from "@/components/Table/BaseTable"
import TableDataPagination from "@/components/Table/TableDataPagination"

export default function AttendanceTracker({ employees, currentDate, setCurrentDate }) {
  const [attendanceData, setAttendanceData] = useState(
    employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      morningShift: "present",
      eveningShift: "present",
      remarks: "",
    })),
  )

  const [hasChanges, setHasChanges] = useState(false)
  const [initialData] = useState(attendanceData)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  const handleAttendanceChange = (id, shift, value) => {
    setAttendanceData((prev) => prev.map((item) => (item.id === id ? { ...item, [shift]: value } : item)))
    setHasChanges(true)
  }

  const handleRemarksChange = (id, value) => {
    setAttendanceData((prev) => prev.map((item) => (item.id === id ? { ...item, remarks: value } : item)))
    setHasChanges(true)
  }

  const saveAttendance = () => {
    setHasChanges(false)
    // In a real app, you would save this to your backend
  }

  const resetChanges = () => {
    setAttendanceData(initialData)
    setHasChanges(false)
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return attendanceData.slice(startIndex, endIndex)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Present</Badge>
      case "absent":
        return <Badge className="bg-red-500">Absent</Badge>
      case "paidLeave":
        return <Badge className="bg-blue-500">Paid Leave</Badge>
      case "unpaidLeave":
        return <Badge className="bg-orange-500">Unpaid Leave</Badge>
      default:
        return null
    }
  }

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Staff Name</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium cursor-pointer text-[13px]">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "morningShift",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Morning Shift</span>
        </div>
      ),
      cell: ({ row }) => (
        <Select
          value={row.original.morningShift}
          onValueChange={(value) => handleAttendanceChange(row.original.id, "morningShift", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Status">
              {getStatusBadge(row.original.morningShift)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {attendanceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  {getStatusBadge(option.value)}
                  <span className="ml-2">{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "eveningShift",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Evening Shift</span>
        </div>
      ),
      cell: ({ row }) => (
        <Select
          value={row.original.eveningShift}
          onValueChange={(value) => handleAttendanceChange(row.original.id, "eveningShift", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Status">
              {getStatusBadge(row.original.eveningShift)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {attendanceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  {getStatusBadge(option.value)}
                  <span className="ml-2">{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "remarks",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Remarks</span>
        </div>
      ),
      cell: ({ row }) => row.original.remarks,
    },
  ]

  return (
    <Card className="mt-4 shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Attendance</h2>
          <div className="flex items-center gap-4">
            {hasChanges && (
              <>
                <Button 
                  onClick={saveAttendance} 
                  className="px-4 py-2 rounded-lg" 
                  disabled={isLoading}
                >
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetChanges} 
                  className="px-4 py-2 rounded-lg" 
                  disabled={isLoading}
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto ">
          <BaseTable
            columns={columns}
            data={getCurrentPageData()}
            loading={false}
            isRowClickable={false}
          />
        </div>

        {employees.length > 0 && (
          <TableDataPagination
            currentPage={currentPage}
            totalItems={employees.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}