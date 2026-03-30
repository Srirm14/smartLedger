"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock employee data - in a real app, this would come from your API
const employeeData = {
  "emp-123": {
    id: "emp-123",
    name: "John Doe",
    baseSalary: 50000,
  },
}

export default function TransactionForm({ employeeId, onSubmit, onCancel }) {
  const [activeTab, setActiveTab] = useState("salary")
  const [formData, setFormData] = useState({
    type: "Salary Bill",
    amount: "",
    mode: "Bank Transfer",
    note: "",
    date: new Date().toISOString(),
  })
  const [cycleStart, setCycleStart] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [cycleEnd, setCycleEnd] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))
  const [selectedDate, setSelectedDate] = useState(new Date())

  const employee = employeeData[employeeId] || { baseSalary: 0, name: "Unknown Employee" }

  useEffect(() => {
    // Set default values based on active tab
    if (activeTab === "salary") {
      setFormData({
        ...formData,
        type: "Salary Bill",
        amount: employee.baseSalary.toString(),
      })
    } else if (activeTab === "payment") {
      setFormData({
        ...formData,
        type: "Payment",
        amount: "",
      })
    } else if (activeTab === "bill") {
      setFormData({
        ...formData,
        type: "Bill",
        amount: "",
      })
    }
  }, [activeTab, employee.baseSalary])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setFormData({
      ...formData,
      date: date.toISOString(),
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Create the transaction object
    const transaction = {
      ...formData,
      amount: Number.parseFloat(formData.amount),
    }

    onSubmit(transaction)
  }

  const generateSalaryBill = () => {
    // In a real app, you might do additional calculations here
    onSubmit({
      ...formData,
      amount: Number.parseFloat(formData.amount),
      note: `Salary for period ${format(new Date(cycleStart), "dd MMM yyyy")} to ${format(new Date(cycleEnd), "dd MMM yyyy")}`,
    })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-gray-100 py-[2px] px-[2px] h-auto">
        <TabsTrigger
          value="salary"
          className={`px-3 py-2 text-sm ${
            activeTab === "salary" ? "bg-white" : "bg-transparent"
          }`}
        >
          Salary Bill
        </TabsTrigger>
        <TabsTrigger
          value="payment"
          className={`px-3 py-2 text-sm ${
            activeTab === "payment" ? "bg-white" : "bg-transparent"
          }`}
        >
          Payment
        </TabsTrigger>
        <TabsTrigger
          value="bill"
          className={`px-3 py-2 text-sm ${
            activeTab === "bill" ? "bg-white" : "bg-transparent"
          }`}
        >
          Other Bill
        </TabsTrigger>
      </TabsList>

      <div className="min-h-[500px] pt-4 relative">
        <TabsContent value="salary" className="space-y-4 pb-16">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycleStart">Cycle Start</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !cycleStart && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {cycleStart ? format(new Date(cycleStart), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(cycleStart)}
                      onSelect={(date) => setCycleStart(format(date, "yyyy-MM-dd"))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycleEnd">Cycle End</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !cycleEnd && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {cycleEnd ? format(new Date(cycleEnd), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(cycleEnd)}
                      onSelect={(date) => setCycleEnd(format(date, "yyyy-MM-dd"))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Additional Notes</Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Any additional information"
                rows={10}
              />
            </div>
          </div>

          <div className="absolute bottom-0 right-0 flex justify-end space-x-2 w-full bg-background p-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={generateSalaryBill}>Generate Salary Bill</Button>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4 pb-16">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Payment Mode</Label>
              <Select value={formData.mode} onValueChange={(value) => handleSelectChange("mode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Payment Notes</Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Any additional information"
                rows={3}
              />
            </div>
          </div>

          <div className="absolute bottom-0 right-0 flex justify-end space-x-2 w-full bg-background p-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Record Payment</Button>
          </div>
        </TabsContent>

        <TabsContent value="bill" className="space-y-4 pb-16">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billType">Bill Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bill type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Advance">Advance</SelectItem>
                  <SelectItem value="Bonus">Bonus</SelectItem>
                  <SelectItem value="Reimbursement">Reimbursement</SelectItem>
                  <SelectItem value="Deduction">Deduction</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Bill Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Bill Description</Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Describe the purpose of this bill"
                rows={3}
              />
            </div>
          </div>

          <div className="absolute bottom-0 right-0 flex justify-end space-x-2 w-full bg-background p-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Bill</Button>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
