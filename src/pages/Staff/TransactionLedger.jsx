"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus, CalendarIcon, TagIcon, IndianRupeeIcon, CreditCardIcon, MessageSquareIcon } from "lucide-react"
import { mockTransactions } from "./mock-data"
import TransactionForm from "./transaction-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BaseTable } from "@/components/Table/BaseTable"

export default function TransactionLedger({ employeeId, date }) {
  const [transactions, setTransactions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {

    // Filter data for the selected employee
    const filteredData = mockTransactions.filter((record) => {
      const matchesEmployee = record.employeeId === employeeId
      return matchesEmployee
    })

    // Convert amount strings to numbers
    const processedData = filteredData.map((record) => ({
      ...record,
      amount: Number.parseFloat(record.amount),
    }))

    setTransactions(processedData)
  }, [employeeId])

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return transactions.slice(startIndex, endIndex)
  }

  const handleEdit = (transaction) => {
  }

  const handleDelete = (transaction) => {
  }

  const handleAddTransaction = (newTransaction) => {
    // In a real app, you would send this to your API
    const newTransactionWithId = {
      ...newTransaction,
      id: `trans-${Date.now()}`,
      employeeId,
      date: newTransaction.date || new Date().toISOString(),
    }

    setTransactions([...transactions, newTransactionWithId])
    setIsFormOpen(false)
  }

  const columns = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Date</span>
        </div>
      ),
      cell: ({ row }) => format(new Date(row.original.date), "dd MMM yyyy"),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Type</span>
        </div>
      ),
      cell: ({ row }) => row.original.type,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Amount</span>
        </div>
      ),
      cell: ({ row }) => `₹${row.original.amount.toFixed(2)}`,
    },
    {
      accessorKey: "mode",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CreditCardIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Mode</span>
        </div>
      ),
      cell: ({ row }) => row.original.mode,
    },
    {
      accessorKey: "note",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Note</span>
        </div>
      ),
      cell: ({ row }) => row.original.note,
    },
    {
      id: "actions",
      header: () => <span className="text-gray-600">Actions</span>,
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>Create a new transaction for this employee.</DialogDescription>
            </DialogHeader>
            <TransactionForm
              employeeId={employeeId}
              onSubmit={handleAddTransaction}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <BaseTable
        columns={columns}
        data={getCurrentPageData()}
        loading={false}
        isRowClickable={false}
      />
    </>
  )
}
