import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Info,
  Filter,
  MapPin,
  Clock,
  Building2,
  CreditCard,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Receipt,
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { formatINR } from "@/lib/utils/formatters";
import { BaseTable } from "@/components/Table/BaseTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTransactionLedgerStore } from "../../../store/useTransactionLedgerStore";
import { getPortfolioListForCredit, getModeList } from "@/services/apiService";
import { DateFilter } from "@/components/DateFilter";
import TableDataPagination from "@/components/Table/TableDataPagination";

const TransactionLedger = ({ dateRange }) => {
  // Get store state and actions
  const {
    transactions,
    summary,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    fetchTransactions,
    getFilterOptions,
  } = useTransactionLedgerStore();

  // State for portfolio list
  const [portfolioList, setPortfolioList] = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  
  // State for payment modes
  const [modesList, setModesList] = useState([]);
  const [loadingModes, setLoadingModes] = useState(false);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return transactions?.slice(startIndex, endIndex);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    if (range.from) {
      updateFilters({ startDate: format(range.from, 'yyyy-MM-dd') });
    }
    if (range.to) {
      updateFilters({ endDate: format(range.to, 'yyyy-MM-dd') });
    }
    fetchTransactions();
  };

  // Initial data fetching
  useEffect(() => {
    // Fetch portfolios from API
    const fetchPortfolios = async () => {
      setLoadingPortfolios(true);
      try {
        const response = await getPortfolioListForCredit();
        if (response && Array.isArray(response)) {
          // Filter out invalid portfolios and ensure required properties exist
          const validPortfolios = response.filter(portfolio => 
            portfolio && 
            portfolio.id !== null && 
            portfolio.id !== undefined
          );
          setPortfolioList(validPortfolios);
        } else if (response && response.data && Array.isArray(response.data)) {
          // Filter out invalid portfolios and ensure required properties exist
          const validPortfolios = response.data.filter(portfolio => 
            portfolio && 
            portfolio.id !== null && 
            portfolio.id !== undefined
          );
          setPortfolioList(validPortfolios);
        } else {
          console.error("Unexpected portfolio list format:", response);
          setPortfolioList([]);
        }
      } catch (error) {
        console.error("Error fetching portfolio list:", error);
        setPortfolioList([]);
      } finally {
        setLoadingPortfolios(false);
      }
    };

    // Fetch payment modes from API
    const fetchModes = async () => {
      setLoadingModes(true);
      try {
        const response = await getModeList();
            
        if (response) {
          // Response is an object with numeric keys
          // Convert to array for easier handling
          const modesArray = Object.values(response).map(mode => ({
            id: mode.id,
            name: mode.mode_name
          }));
          setModesList(modesArray);
        } else {
          console.error("Unexpected modes list format:", response);
          setModesList([]);
        }
      } catch (error) {
        console.error("Error fetching payment modes:", error);
        setModesList([]);
      } finally {
        setLoadingModes(false);
      }
    };

    fetchPortfolios();
    fetchModes();
  }, []);

  // Only fetch data when dateRange changes in parent component
  useEffect(() => {
    if (dateRange) {
      if (dateRange.from) {
        updateFilters({ startDate: format(dateRange.from, 'yyyy-MM-dd') });
      }
      if (dateRange.to) {
        updateFilters({ endDate: format(dateRange.to, 'yyyy-MM-dd') });
      }
      
      // Only fetch data when date range changes
      fetchTransactions();
    }
  }, [dateRange, updateFilters, fetchTransactions]);

  // Get filter options
  const filterOptions = getFilterOptions();

  // Handle filter changes
  const handleTypeChange = (value) => {
    updateFilters({ type: value === "all" ? null : value });
    fetchTransactions(); // Apply filter immediately
  };

  const handlePortfolioChange = (value) => {
    if (value === "global") {
      updateFilters({ portfolioId: null });
    } else {
      updateFilters({ portfolioId: value === "all" ? null : parseInt(value) });
    }
    fetchTransactions(); // Apply filter immediately
  };

  const handleModeChange = (value) => {
    updateFilters({ mode: value === "all" ? null : value });
    fetchTransactions(); // Apply filter immediately
  };
  // Table columns
  const columns = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--neutral-gray600)]" />
          <span className="text-[var(--neutral-gray600)]">Date</span>
        </div>
      ),
      cell: ({ row }) => <div className="font-medium text-[var(--neutral-gray800)]">{row.original.date}</div>,
    },
    {
      accessorKey: "portfolio_name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[var(--neutral-gray600)]" />
          <span className="text-[var(--neutral-gray600)]">Island</span>
        </div>
      ),
      cell: ({ row }) => <Badge variant="outline">{row.original.portfolio_name || "Global"}</Badge>,
    },
    {
      accessorKey: "shift_name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--neutral-gray600)]" />
          <span className="text-[var(--neutral-gray600)]">Shift</span>
        </div>
      ),
      cell: ({ row }) => <div className="text-[var(--neutral-gray700)]">{row.original.shift_name || "N/A"}</div>,
    },
    {
      accessorKey: "bank_account",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[var(--neutral-gray600)]" />
          <span className="text-[var(--neutral-gray600)]">Account</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-[var(--neutral-gray800)]">{row.original.bank_account || "N/A"}</div>
      ),
    },
    {
      accessorKey: "mode",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[var(--neutral-gray600)]" />
          <span className="text-[var(--neutral-gray600)]">Mode</span>
        </div>
      ),
      cell: ({ row }) => <div className="text-[var(--neutral-gray700)]">{row.original.mode}</div>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-[var(--neutral-gray600)]" />
          <span className="text-[var(--neutral-gray600)]">Type</span>
        </div>
      ),
      cell: ({ row }) => (
        <Badge 
          variant="secondary"
          className={`${row.original.type === 'net income' ? 'hover:bg-[var(--success-100)] bg-[var(--success-100)] text-[var(--success-600)] border-none' : ' hover:bg-[var(--danger-100)] bg-[var(--danger-100)] text-[var(--danger-600)] border-none'}`}
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-[var(--neutral-gray600)]" />
          <span className="text-[var(--neutral-gray600)]">Amount</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className={`font-medium ${row.original.type === 'net income' ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`}>
          {formatINR(row.original.amount)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Transaction Table with integrated filters */}
      <Card className="shadow-none">
        <CardContent>
          {/* Filters */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5 mb-5 sm:mb-7">
              {/* Date Filter */}
              <div className="space-y-1.5 sm:space-y-2 ">
                <label className="text-sm font-medium text-[var(--neutral-gray600)]">Date Range</label>
                <DateFilter
                  onDateChange={handleDateRangeChange}
                  selectedRange={dateRange}
                  defaultOption="lastMonth"
                  className="w-full"
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-sm font-medium text-[var(--neutral-gray600)]">Transaction Type</label>
                <Select 
                  onValueChange={handleTypeChange} 
                  defaultValue="all"
                  value={filters.type || "all"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="net income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Portfolio/Island Filter */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-sm font-medium text-[var(--neutral-gray600)]">Island</label>
                <Select 
                  onValueChange={handlePortfolioChange} 
                  defaultValue="all"
                  value={filters.portfolioId === null ? "all" : filters.portfolioId?.toString() || "all"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select island" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Islands</SelectItem>
                    {!loadingPortfolios && portfolioList.length > 0 ? (
                      portfolioList.map((portfolio) => (
                        <SelectItem 
                          key={portfolio.id} 
                          value={portfolio.id ? portfolio.id.toString() : 'undefined'}
                        >
                          {portfolio.portfolio_name || 'Unnamed Island'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        {loadingPortfolios ? "Loading..." : "No islands available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode Filter */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-sm font-medium text-[var(--neutral-gray600)]">Payment Mode</label>
                <Select 
                  onValueChange={handleModeChange} 
                  defaultValue="all"
                  value={filters.mode || "all"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {!loadingModes && modesList.length > 0 ? (
                      modesList.map((mode) => (
                        <SelectItem key={mode.id} value={mode.name}>
                          {mode.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        {loadingModes ? "Loading..." : "No payment modes available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Account Summary Cards */}
            {transactions && transactions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 mb-10">
                {loading ? (
                  // Loading state
                  Array(3).fill(0).map((_, index) => (
                    <Card key={`loading-${index}`} className="border shadow-sm hover:shadow-md transition-shadow opacity-70">
                      <CardContent className="p-3">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-[var(--neutral-gray200)] rounded w-1/2"></div>
                          <div className="h-6 bg-[var(--neutral-gray200)] rounded"></div>
                          <div className="h-4 bg-[var(--neutral-gray200)] rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  // Account summaries
                  Object.entries(
                    transactions.reduce((acc, transaction) => {
                      const accountName = transaction.bank_account || 'Cash';
                      if (!acc[accountName]) {
                        acc[accountName] = {
                          totalIncome: 0,
                          totalExpense: 0
                        };
                      }
                      if (transaction.type === 'net income') {
                        acc[accountName].totalIncome += transaction.amount;
                      } else if (transaction.type === 'expense') {
                        acc[accountName].totalExpense += transaction.amount;
                      }
                      return acc;
                    }, {})
                  ).map(([accountName, summary]) => {
                    const netAmount = summary.totalIncome - summary.totalExpense;
                    const isPositive = netAmount >= 0;
                    
                    return (
                      <Card key={accountName} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-[var(--neutral-gray800)]">{accountName}</h3>
                            <Badge 
                              variant="outline" 
                              className={`flex items-center gap-1 ${
                                isPositive 
                                  ? 'bg-[var(--success-100)] text-[var(--success-600)] border-[var(--success-200)]' 
                                  : 'bg-[var(--danger-100)] text-[var(--danger-600)] border-[var(--danger-600)]'
                              }`}
                            >
                              {isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>Net {isPositive ? '+' : '-'}</span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[var(--neutral-gray600)]">Income</span>
                              <span className="text-sm text-[var(--success-600)] font-medium">
                                {formatINR(summary.totalIncome)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[var(--neutral-gray600)]">Expense</span>
                              <span className="text-sm text-[var(--danger-600)] font-medium">
                                {formatINR(summary.totalExpense)}
                              </span>
                            </div>
                            
                            <div className="pt-1.5 border-t border-[var(--neutral-gray100)]">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-[var(--neutral-gray700)]">Cashflow</span>
                                <span className={`text-sm font-semibold ${
                                  isPositive ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'
                                }`}>
                                  {formatINR(netAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Transaction Table */}
          <div className="mt-8">
            <BaseTable
              columns={columns}
              data={getCurrentPageData()}
              loading={loading}
              isEmpty={!transactions?.length}
              emptyTitle="No transactions available"
              emptyDescription="No transactions found for the selected filters"
            />
             {transactions?.length > 0 && (
              <div className="mt-4">
                <TableDataPagination
                  currentPage={currentPage}
                  totalItems={transactions.length}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionLedger;
