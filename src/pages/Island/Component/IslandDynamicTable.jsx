"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Tag,
  Ruler,
  BarChart,
  BarChart2,
  Calculator,
  CreditCard,
  FileText,
  Layers,
  ArrowUp,
  ArrowDown,
  IndianRupee,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import noDataPresentSvg from "../../../assets/illustrations/noDataPresent.svg";

/**
 * IslandDynamicTable - A reusable table component with sorting, pagination, and CRUD operations
 *
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions with id, header, and render functions
 * @param {Array} props.data - Array of data objects to display in the table
 * @param {boolean} props.loading - Whether the table is in loading state
 * @param {Function} props.onAddRow - Callback when a row is added
 * @param {Function} props.onDeleteRow - Callback when a row is deleted
 * @param {Function} props.onUpdateRow - Callback when a row is updated
 * @param {Function} props.onSave - Callback when changes are saved
 * @param {Function} props.onReset - Callback when changes are reset
 * @param {Function} props.onCellClick - Callback when a cell is clicked
 * @param {boolean} props.pinFirstColumn - Whether to pin the first column
 * @param {boolean} props.pinLastColumn - Whether to pin the last column
 * @param {boolean} props.showBottomButtons - Whether to show bottom action buttons
 */
export function IslandDynamicTable({
  columns,
  data,
  loading,
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  onCellClick,
  pinFirstColumn = true,
  pinLastColumn = true,
  parentComponent,
  showBottomButtons = false,
  
}) {
  // State management for table data and UI
  const [tableData, setTableData] = useState(data || []);
  const [originalData, setOriginalData] = useState(data || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Update table data when props data changes
  useEffect(() => {
    setTableData(data || []);
    setOriginalData(data || []);
  }, [data]);

  // Track changes between current and original data
  useEffect(() => {
    if (JSON.stringify(tableData) !== JSON.stringify(originalData)) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [tableData, originalData]);

  /**
   * Handles input changes in table cells
   * @param {number} rowIndex - Index of the row being edited
   * @param {string} columnId - ID of the column being edited
   * @param {any} value - New value for the cell
   */
  const handleInputChange = (rowIndex, columnId, value) => {
    // Calculate the actual index in the full dataset
    const actualIndex = (currentPage - 1) * rowsPerPage + rowIndex;
    
    const newData = [...tableData];
    newData[actualIndex] = {
      ...newData[actualIndex],
      [columnId]: value,
    };
    setTableData(newData);
    setHasChanges(true);
    onUpdateRow && onUpdateRow(actualIndex, columnId, value);
  };

  /**
   * Handles deletion of a row
   * @param {number} index - Index of the row to delete
   */
  const handleDeleteRow = (index) => {
    const rowToDelete = tableData[index];
    const newData = [...tableData];
    newData.splice(index, 1);
    setTableData(
      newData.filter((row) => Object.values(row).some((val) => val !== ""))
    );
    onDeleteRow && onDeleteRow(index, rowToDelete); // Pass row details
    setHasChanges(true);
  };

  /**
   * Adds a new empty row to the table
   */
  const handleAddRow = () => {
    const newRow = {};
    columns.forEach((column) => {
      newRow[column.id] = "";
    });
    // Add an id if not present
    if (!newRow.id) {
      newRow.id = `row-${Date.now()}`;
    }
    // Add new row at the top of the list
    const newData = [newRow, ...tableData];
    setTableData(newData);
    setHasChanges(true);
    onAddRow && onAddRow(newRow);
  };

  /**
   * Handles sorting of table data
   * @param {string} columnId - ID of the column to sort by
   */
  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  /**
   * Returns the appropriate icon for a column
   * @param {string} columnId - ID of the column
   * @returns {JSX.Element} Icon component
   */
  const getIconForColumn = (columnId) => {
    const iconMap = {
      salesUnitName: <Package size={16} />,
      productName: <Package size={16} />,
      price: <IndianRupee size={16} />,
      category: <Tag size={16} />,
      uom: <Ruler size={16} />,
      initialReading: <BarChart size={16} />,
      currentReading: <BarChart2 size={16} />,
      soldQuantity: <Calculator size={16} />,
      salesIncome: <Banknote size={16} />,
      type: <Layers size={16} />,
      amount: <IndianRupee size={16} />,
      mode: <CreditCard size={16} />,
      description: <FileText size={16} />,
    };

    return iconMap[columnId] || <Package size={16} />;
  };

  // Calculate pagination
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, tableData.length);

  // Sorting logic
  const sortedData = [...tableData];
  if (sortColumn && sortDirection) {
    sortedData.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn])
        return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn])
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {columns.map((column, idx) => (
              <TableHead key={idx}>
                <Skeleton className="h-4 w-[100px] bg-gray-200" />
              </TableHead>
            ))}
          </TableHeader>
          <TableBody>
            {Array(rowsPerPage)
              .fill(0)
              .map((_, idx) => (
                <TableRow key={idx} className="h-[41px]">
                  {columns.map((_, cellIdx) => (
                    <TableCell key={cellIdx}>
                      <Skeleton className="h-6 w-[100px] bg-gray-200" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <div className="sticky bottom-0 bg-white border-t z-20 p-4 flex items-center justify-between text-sm">
          <div>
            <Skeleton className="h-4 w-48 bg-gray-200" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 bg-gray-200" />
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 bg-gray-200" />
              <Skeleton className="h-8 w-32 bg-gray-200" />
              <Skeleton className="h-8 w-8 bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  } else if (tableData.length === 0) {
    // Empty state when no data is available
    return (
      <div className="bg-white min-h-[250px] w-full flex items-center justify-center border-[1.4px] border-gray-100 rounded-md">
        <div className="flex flex-col items-center justify-center h-[250px] ">
          {parentComponent?.toLowerCase() === "salestab" ? (
            <p className="mt-4 text-[16px] font-normal text-neutral-gray400 flex flex-col gap-2 items-center">
              <img 
                src={noDataPresentSvg} 
                alt="No sales data available" 
                width={180} 
                height={180}
                priority
              />
              No products found. Use "+ Sales Unit" to begin tracking your sales
              and tally.
            </p>
          ) : (
            <p className="mt-4 text-[16px] font-normal text-neutral-gray400 flex flex-col gap-2 items-center">
              <img 
                src={noDataPresentSvg} 
                alt="No data available" 
                width={180} 
                height={180}
                priority
              />
              Looks empty! Add your first entry using "Track Cashflow" to monitor
              cashflow for sales products.
            </p>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full rounded-lg">
        <div className="relative border rounded-lg">
          <div
            className="overflow-x-auto min-w-full max-w-[calc(100vw-319px)] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-[#F9FAFB]">
                <tr className="border-b">
                  {columns.map((column, index) => (
                    <th
                      key={column.id}
                      className={`text-left p-3 text-sm font-medium text-[#656565] bg-[#F9FAFB] whitespace-nowrap ${
                        pinFirstColumn && index === 0
                          ? "sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r-[1px] rounded-l-lg"
                          : pinLastColumn && index === columns.length - 1
                          ? "sticky right-0 z-30 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] border-l-[1px] rounded-r-lg"
                          : ""
                      }`}
                      style={{
                        position:
                          (pinFirstColumn && index === 0) ||
                          (pinLastColumn && index === columns.length - 1)
                            ? "sticky"
                            : "relative",
                        backgroundColor: "#F9FAFB",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {getIconForColumn(column.id)}
                        {column.header}
                        <button onClick={() => handleSort(column.id)}>
                          {sortColumn === column.id &&
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : sortColumn === column.id &&
                            sortDirection === "desc" ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUp className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.slice(startIndex, endIndex).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td
                        key={column.id}
                        className={`p-2 ${
                          pinFirstColumn && colIndex === 0
                            ? "sticky left-0 z-20 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r-[1px]"
                            : pinLastColumn && colIndex === columns.length - 1
                            ? "sticky right-0 z-20 bg-white shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] border-l-[1px]"
                            : ""
                        }`}
                        style={{
                          position:
                            (pinFirstColumn && colIndex === 0) ||
                            (pinLastColumn && colIndex === columns.length - 1)
                              ? "sticky"
                              : "relative",
                          backgroundColor:
                            (pinFirstColumn && colIndex === 0) ||
                            (pinLastColumn && colIndex === columns.length - 1)
                              ? "white"
                              : "",
                        }}
                        onClick={() => {
                          onCellClick && onCellClick(row, rowIndex);
                        }}
                      >
                        {(row === null && row[column.id] === undefined) ||
                        row[column.id] === null ||
                        row[column.id] === ""
                          ? column.renderEmptyCell({
                              placeholder: column.placeholder,
                              onChange: (value) =>
                                handleInputChange(rowIndex, column.id, value),
                            })
                          : column.renderCell({
                              value: row[column.id],
                              row,
                              column,
                              rowIndex,
                              onChange: (value) =>
                                handleInputChange(
                                  rowIndex,
                                  column.id,
                                  value,
                                  row
                                ),
                            })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t z-20 p-4 flex items-center justify-between text-sm">
          <div>
            Showing {startIndex + 1} to {endIndex} of {tableData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number.parseInt(value));
                setCurrentPage(1);  // Reset to page 1 when page size changes
              }}
            >
              <SelectTrigger className="h-8 w-24">
                <SelectValue placeholder="Show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Show 10</SelectItem>
                <SelectItem value="20">Show 20</SelectItem>
                <SelectItem value="50">Show 50</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-r-none"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 border-y border-r h-8 flex items-center">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-l-none"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
