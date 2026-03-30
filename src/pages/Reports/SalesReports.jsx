"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatINR } from "@/lib/utils/formatters";
import { getResponsiveWidth } from "@/lib/utils/responsiveWidth";
import { DateFilter } from "@/components/DateFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Calendar,
  IndianRupee,
  Package,
  Wallet,
  Receipt,
  ShoppingCart,
  CreditCard as CreditCardIcon,
  TrendingUp,
  PiggyBank,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useIntegratedCashflowStore } from "../../../store/useIntegratedCashflowStore";
import { BaseTable } from "@/components/Table/BaseTable";
import TableDataPagination from "@/components/Table/TableDataPagination";
import SummaryCard from "./Components/SummaryCard";

export default function SalesReports() {
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    return {
      from: lastWeekStart,
      to: today,
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const responsiveWidth = getResponsiveWidth();

  const { fetchIntegratedReport, integratedReport, resetStore } =
    useIntegratedCashflowStore();

  // Prepare data for table including totals row if available
  const tableData = useMemo(() => {
    if (!integratedReport?.data) return [];
    
    // Return only the data rows, not the totals
    return [...integratedReport.data];
  }, [integratedReport]);

  // Sort the entire dataset
  const sortedData = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    
    if (!sortColumn) return tableData;
    
    const sorted = [...tableData].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Handle date values
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle date strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
        }
      }
      
      return 0;
    });
    
    return sorted;
  }, [tableData, sortColumn, sortDirection]);

  // Handle sorting
  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Make initial API call with current date
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        await fetchIntegratedReport(
          format(dateRange.from, "yyyy-MM-dd"),
          format(dateRange.to, "yyyy-MM-dd")
        );
      } catch (error) {
        console.error("Error fetching initial report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Reset current page when data changes
  useEffect(() => {
    setCurrentPage(1);
    setSortColumn(null);
    setSortDirection('asc');
  }, [tableData]);

  const handleDateChange = (newDateRange) => {
    setIsLoading(true);
    setDateRange(newDateRange);
    fetchIntegratedReport(
      format(newDateRange.from, "yyyy-MM-dd"),
      format(newDateRange.to, "yyyy-MM-dd")
    ).finally(() => setIsLoading(false));
  };

  const handleExportCSV = () => {
    let dataToExport = [];
    let filename = "";

    if (sortedData && sortedData.length > 0) {
      dataToExport = sortedData.map((day) => ({
        Date: day.date,
        "Meter Sales": day.meter_sales,
        "Stock Sales": day.stock_sales,
        "Total Income": day.total_income,
        "Cashflow Expenses": day.cashflow_expenses,
        "Stock Expenses": day.stock_expenses,
        "Total Expenses": day.total_expenses,
        Credits: day.credits,
        "Net Cashflow": day.net_cashflow,
        "Cash on Hand": day.cash_on_hand,
      }));

      // Add totals row if available
      if (integratedReport && integratedReport.totals) {
        dataToExport.push({
          Date: "TOTALS",
          "Meter Sales": integratedReport.totals.meter_sales,
          "Stock Sales": integratedReport.totals.stock_sales,
          "Total Income": integratedReport.totals.total_income,
          "Cashflow Expenses": integratedReport.totals.cashflow_expenses,
          "Stock Expenses": integratedReport.totals.stock_expenses,
          "Total Expenses": integratedReport.totals.total_expenses,
          Credits: integratedReport.totals.credits,
          "Net Cashflow": integratedReport.totals.net_cashflow,
          "Cash on Hand": integratedReport.totals.cash_on_hand,
        });
      }

      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = format(dateRange.to, "yyyy-MM-dd");
      filename = `cashflow-report_${fromDate}_to_${toDate}.csv`;
    }

    if (dataToExport.length) {
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers.map((header) => `"${row[header]}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: () => (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("date")}
          >
            <Calendar className="h-4 w-4 text-[var(--neutral-gray600)]" />
            <span className="text-[var(--neutral-gray700)]">Date</span>
            {sortColumn === "date" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-[var(--neutral-gray700)]">
            {row.original.date}
          </span>
        ),
      },
      {
        accessorKey: "meter_sales",
        header: () => (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("meter_sales")}
          >
            <IndianRupee className="h-4 w-4 text-[var(--neutral-gray600)]" />
            <span className="text-[var(--neutral-gray700)]">Meter Sales</span>
            {sortColumn === "meter_sales" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right bg-none text-[var(--neutral-gray700)]">
            {formatCurrency(row.original.meter_sales)}
          </div>
        ),
      },
      {
        accessorKey: "stock_sales",
        header: () => (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("stock_sales")}
          >
            <Package className="h-4 w-4 text-[var(--neutral-gray600)]" />
            <span className="text-[var(--neutral-gray700)]">Stock Sales</span>
            {sortColumn === "stock_sales" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right bg-none text-[var(--neutral-gray700)]">
            {formatCurrency(row.original.stock_sales)}
          </div>
        ),
      },
      {
        accessorKey: "total_income",
        header: () => (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("total_income")}
          >
            <TrendingUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
            <span className="text-[var(--neutral-gray700)]">Total Income</span>
            {sortColumn === "total_income" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right bg-[var(--success-100)] rounded-md px-2 py-1 text-[var(--success-500)] font-semibold">
            {formatCurrency(row.original.total_income)}
          </div>
        ),
      },
      {
        accessorKey: "cashflow_expenses",
        header: () => (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("cashflow_expenses")}
          >
            <Wallet className="h-4 w-4 text-[var(--neutral-gray600)]" />
            <span className="text-[var(--neutral-gray700)]">Cashflow Expenses</span>
            {sortColumn === "cashflow_expenses" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right bg-none text-[var(--neutral-gray700)]">
            {formatCurrency(row.original.cashflow_expenses)}
          </div>
        ),
      },
      {
        accessorKey: "stock_expenses",
        header: () => (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("stock_expenses")}
          >
            <ShoppingCart className="h-4 w-4 text-[var(--neutral-gray600)]" />
            <span className="text-[var(--neutral-gray700)]">Stock Expenses</span>
            {sortColumn === "stock_expenses" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right bg-none text-[var(--neutral-gray700)]">
            {formatCurrency(row.original.stock_expenses)}
          </div>
        ),
      },
      {
        accessorKey: "total_expenses",
        header: () => (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("total_expenses")}
          >
            <Receipt className="h-4 w-4 text-[var(--neutral-gray600)]" />
            <span className="text-[var(--neutral-gray700)]">Total Expenses</span>
            {sortColumn === "total_expenses" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right bg-[var(--danger-100)] rounded-md px-2 py-1 text-[var(--danger-500)] font-semibold">
            {formatCurrency(row.original.total_expenses)}
          </div>
        ),
      },
      {
        accessorKey: "credits",
        header: () => (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("credits")}
          >
            <CreditCardIcon className="h-4 w-4 text-[var(--neutral-gray600)]" />
            <span className="text-[var(--neutral-gray700)]">Credits</span>
            {sortColumn === "credits" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right bg-[var(--warning-100)] rounded-md px-2 py-1 text-[var(--warning-600)] font-semibold">
            {formatCurrency(row.original.credits)}
          </div>
        ),
      },
      {
        accessorKey: "net_cashflow",
        header: () => (
          <div 
            className="flex items-center gap-2 bg-[var(--neutral-gray50)] rounded-md px-2 py-1 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("net_cashflow")}
          >
            <ArrowUpRight className="h-4 w-4 text-[var(--neutral-gray700)]" />
            <span className="text-[var(--neutral-gray700)]">Net Cashflow</span>
            {sortColumn === "net_cashflow" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div
            className={`text-right font-semibold bg-none rounded-md px-2 py-1 ${
              row.original.net_cashflow >= 0
                ? "text-[var(--success-500)]"
                : "text-[var(--danger-500)]"
            }`}
          >
            {formatCurrency(row.original.net_cashflow)}
          </div>
        ),
      },
      {
        accessorKey: "cash_on_hand",
        header: () => (
          <div 
            className="flex items-center gap-2 bg-[var(--neutral-gray50)] rounded-md px-2 py-1 cursor-pointer hover:text-[var(--neutral-gray900)]"
            onClick={() => handleSort("cash_on_hand")}
          >
            <PiggyBank className="h-4 w-4 text-[var(--neutral-gray700)]" />
            <span className="text-[var(--neutral-gray700)]">Cash on Hand</span>
            {sortColumn === "cash_on_hand" ? (
              sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4 text-[var(--neutral-gray600)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--neutral-gray600)]" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-[var(--neutral-gray400)]" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div
            className={`text-right font-semibold bg-none rounded-md px-2 py-1 ${
              row.original.cash_on_hand >= 0
                ? "text-[var(--success-500)]"
                : "text-[var(--danger-500)]"
            }`}
          >
            {formatCurrency(row.original.cash_on_hand)}
          </div>
        ),
      },
    ],
    [sortColumn, sortDirection]
  );

  // Get current page data
  const getCurrentPageData = () => {
    if (!sortedData || sortedData.length === 0) return [];
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  };

  if (isLoading) {
    return (
      <Card
        className={` container mx-auto px-4 py-4 my-auto shadow-sm border border-gray-200 ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
      >
        <CardContent className="px-6">
          <div className="py-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-64 rounded mt-1" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-[280px] rounded" />
                <Skeleton className="h-9 w-32 rounded" />
              </div>
            </div>

            <div className="bg-white rounded-lg">
              <div className="p-4 border-b border-gray-100">
                <Skeleton className="h-4 w-64 rounded" />
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-full divide-y divide-gray-100">
                  {/* Table Header */}
                  <div className="grid grid-cols-10 gap-4 p-4 bg-gray-50">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-20 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Table Rows */}
                  {[...Array(5)].map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-10 gap-4 p-4">
                      {[...Array(10)].map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-6 w-24 rounded" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={` container mx-auto px-4 py-4 my-auto shadow-sm border border-gray-200 ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
    >
      <CardContent className="px-6">
        <div className="py-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Sales Reports
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track and analyze your sales performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateFilter
                onDateChange={handleDateChange}
                initialDate={dateRange.from}
                selectedRange={dateRange}
                defaultOption={"lastWeek"}
                className="w-full min-w-[280px]"
              />

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-4 py-2 border-gray-200 hover:bg-gray-50"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {integratedReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Income Card */}
              <SummaryCard
                icon={TrendingUp}
                iconBg="bg-[var(--success-100)]"
                iconBorder="border-[var(--success-600)]"
                iconColor="text-[var(--success-600)]"
                title="Total Income"
                value={formatCurrency((integratedReport.totals?.total_income || 0))}
                valueColor="text-[var(--success-600)]"
                subItems={[{
                  label: "Stock Sales",
                  value: formatCurrency((integratedReport.totals?.stock_sales || 0)),
                  valueColor: (integratedReport.totals?.stock_sales || 0) > 0 ? "text-[var(--success-600)]" : ((integratedReport.totals?.stock_sales || 0) < 0 ? "text-[var(--danger-600)]" : "text-[var(--neutral-gray700)]")
                }, {
                  label: "Meter Sales",
                  value: formatCurrency((integratedReport.totals?.meter_sales || 0)),
                  valueColor: (integratedReport.totals?.meter_sales || 0) > 0 ? "text-[var(--success-600)]" : ((integratedReport.totals?.meter_sales || 0) < 0 ? "text-[var(--danger-600)]" : "text-[var(--neutral-gray700)]")
                }]}
                cardBg="bg-none"
                cardBorder="border"
              />

              {/* Total Expenses Card */}
              <SummaryCard
                icon={Receipt}
                iconBg="bg-[var(--danger-100)]"
                iconBorder="border-[var(--danger-600)]"
                iconColor="text-[var(--danger-600)]"
                title="Total Expenses"
                value={formatCurrency((integratedReport.totals?.total_expenses || 0))}
                valueColor="text-[var(--danger-600)]"
                subItems={[{
                  label: "Stock Expenses",
                  value: formatCurrency((integratedReport.totals?.stock_expenses || 0)),
                  valueColor: (integratedReport.totals?.stock_expenses || 0) > 0 ? "text-[var(--danger-600)]" : ((integratedReport.totals?.stock_expenses || 0) < 0 ? "text-[var(--success-600)]" : "text-[var(--neutral-gray700)]")
                }, {
                  label: "Cashflow Expenses",
                  value: formatCurrency((integratedReport.totals?.cashflow_expenses || 0)),
                  valueColor: (integratedReport.totals?.cashflow_expenses || 0) > 0 ? "text-[var(--danger-600)]" : ((integratedReport.totals?.cashflow_expenses || 0) < 0 ? "text-[var(--success-600)]" : "text-[var(--neutral-gray700)]")
                }]}
                cardBg="bg-none"
                cardBorder="border "
              />

              {/* Credits Card */}
              <SummaryCard
                icon={CreditCard}
                iconBg="bg-[var(--warning-100)]"
                iconBorder="border-[var(--warning-600)]"
                iconColor="text-[var(--warning-600)]"
                title="Total Credits"
                value={formatCurrency((integratedReport.totals?.credits || 0))}
                valueColor="text-[var(--warning-600)]"
                subItems={[
                  {
                    label: "Outstanding Credits",
                    value: formatCurrency((integratedReport.totals?.credits || 0)),
                    valueColor: "text-[var(--warning-600)]"
                  },
                ]}
                cardBg="bg-none"
                cardBorder="border"
              />

              {/* Net Cashflow Card */}
              <SummaryCard
                icon={(integratedReport.totals?.net_cashflow || 0) >= 0 ? ArrowUpRight : ArrowDownLeft}
                iconBg={(integratedReport.totals?.net_cashflow || 0) >= 0 ? "bg-[var(--success-100)]" : "bg-[var(--danger-100)]"}
                iconBorder={(integratedReport.totals?.net_cashflow || 0) >= 0 ? "border-[var(--success-600)]" : "border-[var(--danger-600)]"}
                iconColor={(integratedReport.totals?.net_cashflow || 0) >= 0 ? "text-[var(--success-600)]" : "text-[var(--danger-600)]"}
                title="Net Cashflow"
                value={formatCurrency((integratedReport.totals?.net_cashflow || 0))}
                valueColor={(integratedReport.totals?.net_cashflow || 0) >= 0 ? "text-[var(--success-600)]" : "text-[var(--danger-600)]"}
                subItems={[{
                  label: "Cash on Hand",
                  value: formatCurrency((integratedReport.totals?.cash_on_hand || 0)),
                  valueColor: (integratedReport.totals?.cash_on_hand || 0) > 0 ? "text-[var(--success-600)]" : ((integratedReport.totals?.cash_on_hand || 0) < 0 ? "text-[var(--danger-600)]" : "text-[var(--neutral-gray700)]")
                }]}
                cardBg={(integratedReport.totals?.net_cashflow || 0) >= 0 ? "bg-none" : "bg-none"}
                cardBorder="border"
              />
            </div>
          )}

          <div className="bg-white rounded-lg">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 font-medium">Cashflow Summary from</p>
                <Badge variant="outline" className="bg-gray-50 border-gray-100 text-gray-600">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {dateRange.from.getTime() === dateRange.to.getTime()
                    ? `${format(dateRange.from, "MMMM dd, yyyy")}`
                    : `${format(dateRange.from, "MMMM dd, yyyy")} to ${format(
                        dateRange.to,
                        "MMMM dd, yyyy"
                      )}`}
                </Badge>
              </div>
            </div>

            {integratedReport && integratedReport.data && (
              <div>
                <BaseTable
                  columns={columns}
                  data={getCurrentPageData()}
                  loading={isLoading}
                  className="min-w-full divide-y divide-gray-100"
                  enableRowHover={true}
                  enableColumnFilters={true}
                  startAndEndColPin={true}
                  isEmpty={!getCurrentPageData().length}
                  emptyTitle="No data available"
                  emptyDescription="Try selecting a different date range"
                  hideDefaultSorting={true}
                />
                {sortedData.length > 0 && (
                  <div className="pt-4">
                    <TableDataPagination
                      currentPage={currentPage}
                      totalItems={sortedData.length}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(newPageSize) => {
                        setPageSize(newPageSize);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
};
