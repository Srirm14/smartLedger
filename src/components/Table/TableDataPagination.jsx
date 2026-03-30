import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TableDataPagination = ({ 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange,
  onPageSizeChange 
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 pb-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1 text-sm text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
          Showing {startIndex + 1} to {endIndex} of {totalItems} results
        </div>

        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder={`Show ${pageSize}`} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                Show {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TableDataPagination;
