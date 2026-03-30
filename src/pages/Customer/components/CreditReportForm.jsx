"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Download, Bell } from "lucide-react"
import { format } from "date-fns"
import { DialogDatePicker } from "./DialogDatePicker"
export function ReportDialog({ open, onOpenChange, customers, onDownload, onSendNotifications }) {
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  })
  const [searchQuery, setSearchQuery] = useState("")

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle checkbox selection
  const handleCheckboxChange = (customerId) => {
    setSelectedCustomers((prev) => {
      if (prev.includes(customerId)) {
        return prev.filter((id) => id !== customerId)
      } else {
        return [...prev, customerId]
      }
    })
  }

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map((customer) => customer.id))
    }
  }

  // Generate and download report
  const downloadReport = () => {
    const selectedCustomerData = customers.filter((customer) => selectedCustomers.includes(customer.id))
    const dateRangeText =
      dateRange?.from && dateRange?.to
        ? `from ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")}`
        : "for all time"

    // Here you would implement your actual report download logic
    alert(`Report downloaded for ${selectedCustomerData.length} customers ${dateRangeText}`)
    onOpenChange(false)
  }

  // Send notifications
  const sendNotifications = () => {
    const selectedCustomerData = customers.filter((customer) => selectedCustomers.includes(customer.id))

    // Here you would implement your notification sending logic
    alert(`Notifications sent to ${selectedCustomerData.length} customers`)
    onOpenChange(false)
  }

  // Reset form when dialog closes
  const handleOpenChange = (open) => {
    if (!open) {
      setSelectedCustomers([])
      setDateRange({ from: undefined, to: undefined })
      setSearchQuery("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-visible flex flex-col z-[9999]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Generate Customer Report</DialogTitle>
          <DialogDescription>Select customers and date range to generate a custom report</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-visible flex flex-col min-h-0 z-[9999]">
          <div className="space-y-4 py-4 flex-shrink-0">
            <div className="w-full relative z-[9999]">
              <DialogDatePicker 
                className="w-full" 
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            </div>

            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all customers"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => handleCheckboxChange(customer.id)}
                          aria-label={`Select ${customer.customer_name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{customer.customer_name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground mt-4 flex-shrink-0">
            {selectedCustomers.length} of {filteredCustomers.length} customers selected
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={sendNotifications} disabled={selectedCustomers.length === 0}>
            <Bell className="mr-2 h-4 w-4" />
            Send Notifications
          </Button>
          <Button onClick={downloadReport} disabled={selectedCustomers.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}