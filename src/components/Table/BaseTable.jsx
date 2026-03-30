import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TableEmptyState } from "@/components/EmptyState/TableEmptyState";

export function BaseTable({
  columns,
  data,
  loading,
  onRowClick,
  isRowClickable = false,
  getRowClassName,
  startAndEndColPin = false,
  isRowDisabled = (row) => false,
  disabledTooltip = "",
  isEmpty = false,
  emptyTitle = "No data available",
  emptyDescription = "No records found",
  emptyActionLabel,
  onEmptyAction,
  hideDefaultSorting = false
}) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-gray200 bg-neutral-white dark:border-neutral-gray700 dark:bg-neutral-gray900 shadow-sm w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {columns.map((column, idx) => (
                <TableHead key={idx}>
                  <Skeleton className="h-4 w-[100px] bg-neutral-gray100 dark:bg-neutral-gray800" />
                </TableHead>
              ))}
            </TableHeader>
            <TableBody>
              {Array(8)
                .fill(0)
                .map((_, idx) => (
                  <TableRow key={idx}>
                    {columns.map((_, cellIdx) => (
                      <TableCell key={cellIdx}>
                        <Skeleton className="h-5 w-[100px] bg-neutral-gray100 dark:bg-neutral-gray800" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-white dark:bg-neutral-gray900 rounded-xl border border-neutral-gray200 dark:border-neutral-gray700 shadow-sm">
      <style jsx global>{`
        .enhanced-table-container {
          position: relative;
          overflow: hidden;
        }
        
        .enhanced-table-body {
          position: relative;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--neutral-gray400) var(--neutral-white);
        }
        
        /* Webkit (Chrome, Safari, Edge) */
        .enhanced-table-body::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        
        .enhanced-table-body::-webkit-scrollbar-track {
          background: var(--neutral-white);
          border-radius: 20px;
        }
        
        .enhanced-table-body::-webkit-scrollbar-thumb {
          background-color: var(--neutral-gray400);
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .enhanced-table-body::-webkit-scrollbar-thumb:hover {
          background-color: var(--neutral-gray500);
        }
        
        /* Fixed header styles */
        .fixed-header-cell {
          position: sticky;
          top: 0;
          z-index: 2;
          background: var(--neutral-gray50);
          isolation: isolate;
        }
        
        /* Fixed column styles */
        .fixed-column {
          position: sticky;
          background: var(--neutral-white);
        }
        
        .fixed-column-left {
          left: 0;
          border-right: 1px solid var(--neutral-gray200);
          box-shadow: rgba(0, 0, 0, 0.15) 2px 0px 8px 0px;
          filter: drop-shadow(2px 0px 4px rgba(0, 0, 0, 0.15));
          position: sticky;
          background: inherit;
          z-index: 4;
        }
        
        .fixed-column-right {
          right: 0;
          border-left: 1px solid var(--neutral-gray200);
          box-shadow: rgba(0, 0, 0, 0.15) -2px 0px 8px 0px;
          filter: drop-shadow(-2px 0px 4px rgba(0, 0, 0, 0.15));
          position: sticky;
          background: inherit;
          z-index: 4;
        }
        
        /* Combined fixed header and fixed column */
        .fixed-header-cell.fixed-column {
          z-index: 5;
          background: var(--neutral-gray50);
        }

        /* Ensure header hover states don't overlap fixed columns */
        .fixed-header-cell:hover {
          z-index: 3;
        }

        .fixed-header-cell.fixed-column:hover {
          z-index: 5;
        }

        /* Dark mode adjustments */
        .dark .fixed-header-cell,
        .dark .fixed-header-cell.fixed-column {
          background: var(--neutral-gray800);
        }

        /* Dark mode shadow adjustments */
        .dark .fixed-column-left {
          border-right: 1px solid var(--neutral-gray700);
          box-shadow: rgba(0, 0, 0, 0.4) 2px 0px 12px 0px;
          filter: drop-shadow(2px 0px 6px rgba(0, 0, 0, 0.3));
        }

        .dark .fixed-column-right {
          border-left: 1px solid var(--neutral-gray700);
          box-shadow: rgba(0, 0, 0, 0.4) -2px 0px 12px 0px;
          filter: drop-shadow(-2px 0px 6px rgba(0, 0, 0, 0.3));
        }

        /* Fix for background inheritance */
        .fixed-column {
          background-color: var(--neutral-white) !important;
        }

        .dark .fixed-column {
          background-color: var(--neutral-gray900) !important;
        }

        /* Hover effects */
        .enhanced-table-body tr.table-row-hover:hover {
          background: linear-gradient(90deg,rgba(248, 245, 245, 0.35) 0%,rgba(234, 234, 234, 0.17) 100%) !important;
        }

        .dark .enhanced-table-body tr.table-row-hover:hover {
          background: linear-gradient(90deg, #232526 0%, #414345 100%) !important;
        }

        /* Ensure TableCell backgrounds are transparent on hover */
        .enhanced-table-body tr.table-row-hover:hover td {
          background: transparent !important;
        }

        /* Handle hover states for fixed columns */
        .enhanced-table-body tr:hover .fixed-column {
          background: transparent !important;
          box-shadow: none !important;
          filter: none !important;
        }

        .enhanced-table-body tr.table-row-hover:hover .fixed-column {
          background-color: var(--neutral-white) !important;
        }

        .dark .enhanced-table-body tr.table-row-hover:hover .fixed-column {
          background-color: var(--neutral-gray900) !important;
        }

        /* Column pinning styles */
        .enhanced-table-container {
          position: relative;
          overflow: hidden;
        }
        
        .enhanced-table-body {
          position: relative;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--neutral-gray400) var(--neutral-white);
        }
        
        /* First and last column pinning */
        .table-column-start,
        .table-column-end {
          position: sticky !important;
          background: var(--neutral-white) !important;
          z-index: 2;
        }

        .dark .table-column-start,
        .dark .table-column-end {
          background: var(--neutral-gray900) !important;
        }

        .table-column-start {
          left: 0;
          border-right: 1px solid var(--neutral-gray200);
          box-shadow: 6px 0 8px -5px rgba(0, 0, 0, 0.2);
        }

        .table-column-end {
          right: 0;
          border-left: 1px solid var(--neutral-gray200);
          box-shadow: -6px 0 8px -5px rgba(0, 0, 0, 0.2);
        }

        .dark .table-column-start {
          border-right: 1px solid var(--neutral-gray700);
          box-shadow: 6px 0 8px -5px rgba(0, 0, 0, 0.35);
        }

        .dark .table-column-end {
          border-left: 1px solid var(--neutral-gray700);
          box-shadow: -6px 0 8px -5px rgba(0, 0, 0, 0.35);
        }

        /* Header pinning with column alignment */
        .table-header-cell.table-column-start,
        .table-header-cell.table-column-end {
          z-index: 3;
          background: var(--neutral-gray50) !important;
        }

        .dark .table-header-cell.table-column-start,
        .dark .table-header-cell.table-column-end {
          background: var(--neutral-gray800) !important;
        }

        /* Prevent hover effects from affecting pinned column backgrounds */
        tr:hover .table-column-start,
        tr:hover .table-column-end {
          background: var(--neutral-white) !important;
        }

        .dark tr:hover .table-column-start,
        .dark tr:hover .table-column-end {
          background: var(--neutral-gray900) !important;
        }

        /* Ensure hover effects don't override pinned column backgrounds */
        .enhanced-table-body tr.table-row-hover:hover .table-column-start,
        .enhanced-table-body tr.table-row-hover:hover .table-column-end {
          background: var(--neutral-white) !important;
        }

        .dark .enhanced-table-body tr.table-row-hover:hover .table-column-start,
        .dark .enhanced-table-body tr.table-row-hover:hover .table-column-end {
          background: var(--neutral-gray900) !important;
        }

        /* Keep header backgrounds consistent */
        tr:hover .table-header-cell.table-column-start,
        tr:hover .table-header-cell.table-column-end {
          background: var(--neutral-gray50) !important;
        }

        .dark tr:hover .table-header-cell.table-column-start,
        .dark tr:hover .table-header-cell.table-column-end {
          background: var(--neutral-gray800) !important;
        }
      `}</style>

      {isEmpty ? (
        <TableEmptyState 
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <div className="enhanced-table-container">
          <div className="enhanced-table-body">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-neutral-gray50 dark:bg-neutral-gray800">
                    {headerGroup.headers.map((header, index) => {
                      const isFirstColumn = index === 0;
                      const isLastColumn = index === headerGroup.headers.length - 1;
                      const columnClassName = cn(
                        "py-3 px-4 whitespace-nowrap",
                        isFirstColumn && startAndEndColPin && "table-column-start table-header-cell",
                        isLastColumn && startAndEndColPin && "table-column-end table-header-cell"
                      );

                      return (
                        <TableHead
                          key={header.id}
                          className={columnClassName}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={`flex items-center font-semibold text-neutral-gray900 dark:text-neutral-gray100 ${
                                header.column.getCanSort() && !hideDefaultSorting ? "cursor-pointer select-none hover:text-neutral-black dark:hover:text-neutral-white" : ""
                              }`}
                              onClick={header.column.getCanSort() && !hideDefaultSorting ? header.column.getToggleSortingHandler() : undefined}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && !hideDefaultSorting && (
                                <ChevronsUpDown className="ml-1.5 h-4 w-4 text-neutral-gray600 dark:text-neutral-gray400" />
                              )}
                            </div>
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, rowIndex) => {
                    const isDisabled = isRowDisabled(row.original);
                    const rowContent = (
                      <TableRow
                        key={row.id}
                        className={cn(
                          "border-b border-neutral-gray100 dark:border-neutral-gray800 transition-colors group table-row-hover",
                          isRowClickable && !isDisabled && "cursor-pointer active:bg-neutral-gray100 dark:active:bg-neutral-gray700",
                          isDisabled && "opacity-60 cursor-not-allowed",
                          rowIndex === table.getRowModel().rows.length - 1 && "last:border-b-0",
                          getRowClassName && getRowClassName(row)
                        )}
                        onClick={() => !isDisabled && isRowClickable && onRowClick?.(row.original)}
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => {
                          const isFirstColumn = cellIndex === 0;
                          const isLastColumn = cellIndex === row.getVisibleCells().length - 1;
                          const columnClassName = cn(
                            "py-3 px-4 whitespace-nowrap text-neutral-black dark:text-neutral-white",
                            isFirstColumn && startAndEndColPin && "table-column-start",
                            isLastColumn && startAndEndColPin && "table-column-end",
                            isRowClickable && !isDisabled && isFirstColumn &&
                              "font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:underline"
                          );

                          return (
                            <TableCell
                              key={cell.id}
                              className={columnClassName}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );

                    return isDisabled && disabledTooltip ? (
                      <TooltipProvider key={row.id}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            {rowContent}
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            align="center"
                            sideOffset={5}
                            className="bg-neutral-gray900 text-neutral-white px-3 py-1.5 text-sm rounded-md shadow-lg z-50"
                          >
                            <p>{disabledTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      rowContent
                    );
                  })
                ) : null}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
