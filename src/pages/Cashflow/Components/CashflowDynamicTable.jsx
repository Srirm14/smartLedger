import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/lib/utils/formatters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CashflowDynamicTable = ({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = "No data available.",
  onRowUpdate,
  onRowDelete,
  modes = [
    { id: 'cash', name: 'Cash' },
    { id: 'upi', name: 'UPI' },
    { id: 'card', name: 'Card' },
    { id: 'netbanking', name: 'Net Banking' }
  ],
}) => {
  // Generate grid template based on number of columns plus action column
  const gridTemplateColumns = `repeat(${columns.length + 1}, 1fr)`;

  const handleCellChange = (rowIndex, columnId, value) => {
    if (typeof onRowUpdate === 'function') {
      onRowUpdate(rowIndex, columnId, value);
    }
  };

  const renderCell = (column, value, rowIndex) => {
    switch (column.id) {
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleCellChange(rowIndex, column.id, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'type':
        return (
          <Select 
            value={value || ""} 
            onValueChange={(newValue) => handleCellChange(rowIndex, column.id, newValue)}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'amount':
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            className="h-9"
            placeholder="₹00.00"
          />
        );
      case 'mode':
        return (
          <Select 
            value={value || ""} 
            onValueChange={(newValue) => handleCellChange(rowIndex, column.id, newValue)}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {modes.map((mode) => (
                <SelectItem key={mode.id} value={mode.id}>
                  {mode.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'category':
        return (
          <Select 
            value={value || ""} 
            onValueChange={(newValue) => handleCellChange(rowIndex, column.id, newValue)}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Fuel">Fuel</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'description':
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            className="h-9"
            placeholder="Enter description"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Table header */}
      <div 
        className="grid bg-[var(--neutral-gray50)] border-b" 
        style={{ gridTemplateColumns }}
      >
        {columns.map((column) => (
          <div key={column.id} className="px-4 py-3 font-medium text-[14px] text-[var(--neutral-gray700)]">
            {typeof column.header === 'function' ? column.header() : column.header}
          </div>
        ))}
        <div className="px-4 py-3 font-medium text-[var(--neutral-gray700)] text-[14px]">Action</div>
      </div>

      {isLoading ? (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, idx) => (
                <TableHead key={idx}>
                  <Skeleton className="h-4 w-full bg-[var(--neutral-gray200)]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5)
              .fill(0)
              .map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((_, cellIdx) => (
                    <TableCell key={cellIdx}>
                      <Skeleton className="h-6 w-full bg-[var(--neutral-gray200)]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-[var(--neutral-gray500)]">
          {emptyMessage}
        </div>
      ) : (
        <>
          {/* Table rows */}
          {data.map((row, rowIndex) => (
            <div 
              key={row.id || rowIndex} 
              className="grid border-b" 
              style={{ gridTemplateColumns }}
            >
              {columns.map((column) => (
                <div key={column.id} className="p-2">
                  {renderCell(column, row[column.id], rowIndex)}
                </div>
              ))}
              <div className="p-2 flex justify-center items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRowDelete(rowIndex)}
                  className="text-[var(--neutral-gray500)] hover:text-[var(--danger-500)]"
                  disabled={isLoading}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default CashflowDynamicTable; 