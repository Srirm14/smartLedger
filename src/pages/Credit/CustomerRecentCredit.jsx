import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ContentHeader } from "@/components/Header/ContentHeader";
import FilterAndSearch from "../../components/Filter/FilterandSearch";
import {
  CalendarIcon,
  CirclePlus,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { useAllCreditStore } from "../../../store/useAllCreditStore";
import useInventoryStore from "../../../store/useInventoryStore";
import { usePortfolioStore } from "../../../store/usePortfolioStore";
import useGlobalDateStore from "../../../store/useGlobalStore";
import { BaseTable } from "@/components/Table/BaseTable";
import { useCreditCustomerStore } from "../../../store/useCreditCustomerStore";
import CreditActionDialog from "@/components/Form/CreditActionDialog";
import { formatINR } from "@/lib/utils/formatters";
import { getResponsiveWidth } from "@/lib/utils/responsiveWidth";
import { Card, CardContent } from "@/components/ui/card";
import TableDataPagination from "@/components/Table/TableDataPagination";
import CustomerCreditDeleteAction from "@/components/Form/CustomerCreditDeleteAction";
import { useCustomerStore } from "../../../store/useCustomerStore";
import CreditSummaryCard from "./components/CreditSummaryCard";
import Backdrop from "@/components/Backdrop";
import { Badge } from "@/components/ui/badge";
import TooltipMessage from "@/components/TooltipMessage";
import { toast } from "react-hot-toast";
import { useCreditNavigationStore } from "../../../store/useCreditNavigationStore";
import { queryClient, QUERY_KEYS } from "@/utils/queryClient";
import { invalidateAllCashflowQueries } from "@/queryHooks/storeCachedQueries/useCashflowTabQuery";

const CustomerRecentCredit = () => {
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchObject, setSearchObject] = useState([]);
  const dataretrival = useRef(1);
  const responsiveWidth = getResponsiveWidth();
  const { AllCredit, fetchAllCredit, loading, FetchDataRetrival, total_count } =
    useAllCreditStore();

  const {
    upsertCreditCustomer,
    insertCreditCustomer,
    deleteCreditCustomer,
    loadingDelete,
    loadingAdd,
  } = useCreditCustomerStore();
  const { inventoryProducts } = useInventoryStore();
  const { portfoliolistforcredit, fetchPortfolioListForCredit } =
    usePortfolioStore();
  const selectedDate = useGlobalDateStore((state) => state.selectedDate);
  const [date, setDate] = useState(selectedDate);
  const [footerData, setFooterData] = useState({
    total_count: 0,
    total_amount: 0,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
  });

  const { customers, fetchCustomers } = useCustomerStore();
  const { creditNavigationState, clearCreditNavigationState } = useCreditNavigationStore();

  // Add state to store customer_id when a customer is selected
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Common function to invalidate cashflow queries using centralized function
  const invalidateCashflowQueries = async () => {
    await invalidateAllCashflowQueries(queryClient);
  };

  // Add effect to fetch customers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Add effect to find customer_id when selectedData changes
  useEffect(() => {
    if (selectedData && selectedData.customer_name) {
      const customer = customers.find(
        (c) => c.customer_name === selectedData.customer_name
      );
      if (customer) {
        setSelectedCustomerId(customer.id);
      }
    }
  }, [selectedData, customers]);

  // Handle navigation state from cashflow tab
  useEffect(() => {
    if (creditNavigationState.isNavigating && creditNavigationState.filters) {
      const { filters } = creditNavigationState;
      
      // Create a new search object with all filters
      const newSearchObject = [];
      
      // Apply date range filter if available
      if (filters.dateRange) {
        newSearchObject.push({ dateRange: filters.dateRange });
      }
      
      // Apply portfolio filter if available
      if (filters.portfolioName) {
        newSearchObject.push({ 
          searchTerm: filters.portfolioName,
          filterOption: "portfolio_name"
        });
      }
      
      // Apply shift filter if available
      if (filters.shiftName) {
        newSearchObject.push({ 
          searchTerm: filters.shiftName,
          filterOption: "shift_name"
        });
      }
      
      // Set all filters at once
      setSearchObject(newSearchObject);
      
      // Clear navigation state after applying filters
      clearCreditNavigationState();
    }
  }, [creditNavigationState, clearCreditNavigationState]);

  useEffect(() => {
    fetchPortfolioListForCredit();
  }, []);

  // Initial data fetch on page load
  useEffect(() => {
    fetchAllCredit(dataretrival.current, searchObject);
  }, [searchObject, fetchAllCredit]);

  // Calculate footer data when AllCredit changes
  useEffect(() => {
    if (AllCredit && AllCredit.length > 0) {
      const totalAmount = AllCredit.reduce(
        (sum, item) => sum + item.total_amount,
        0
      );
      setFooterData({
        total_count: AllCredit.length,
        total_amount: totalAmount,
      });
    } else {
      // Reset footer data when AllCredit is empty
      setFooterData({
        total_count: 0,
        total_amount: 0,
      });
    }
  }, [AllCredit]);

  // Handle date range filter
  const handleDateApply = useCallback(
    (dateRange) => {
      const newSearchObject = searchObject.filter((item) => !item.dateRange);
      setSearchObject([...newSearchObject, { dateRange }]);
      // Clear single date selection when using date range
      const dateFiltered = newSearchObject.filter((item) => !item.dateFilter);
      setSearchObject([...dateFiltered, { dateRange }]);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    },
    [searchObject]
  );

  const handleSearch = useCallback(
    (searchItem) => {
      const newSearchObject = [...searchObject, searchItem];
      setSearchObject(newSearchObject);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    },
    [searchObject]
  );

  // Add function to clear all filters at once
  const handleClearAllFilters = useCallback(() => {
    setSearchObject([]);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchAllCredit(dataretrival.current, []);
    // Dispatch event to clear FilterAndSearch component
    window.dispatchEvent(new Event('clearAllFilters'));
  }, [fetchAllCredit]);

  const handleCancelFilter = useCallback(
    (search) => {
      const updatedSearchObject = searchObject.filter(
        (item) =>
          (search.searchTerm && item.searchTerm !== search.searchTerm) ||
          (search.dateRange && !item.dateRange) ||
          (search.dateFilter && !item.dateFilter)
      );
      
      // If this was the last filter being removed, trigger clear all
      if (updatedSearchObject.length === 0) {
        handleClearAllFilters();
        return;
      }

      setSearchObject(updatedSearchObject);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    },
    [searchObject, handleClearAllFilters]
  );

  // Handle save credit
  const handleSave = async (data) => {
    try {
      if (selectedData) {
        // Edit existing credit
        await upsertCreditCustomer(data);
      } else {
        await insertCreditCustomer(data);
      }
      setSelectedData(null);
      
      // Invalidate cashflow queries after saving
      await invalidateCashflowQueries();
    } catch (error) {
      console.error("Error saving credit:", error);
      toast.error("Failed to save credit entry");
    }
  };
  const handleEditCredit = async (data) => {
    setSelectedData(data);
    setShowCreditForm(true);
    
    // Invalidate cashflow queries when editing
    await invalidateCashflowQueries();
  };

  const handleDeleteCredit = (data) => {
    setSelectedData(data);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedData) {
      await deleteCreditCustomer(selectedData.id);
      fetchAllCredit(dataretrival.current, searchObject);
      setShowDeleteConfirmation(false);
      setSelectedData(null);
      
      // Invalidate cashflow queries after deletion
      await invalidateCashflowQueries();

      console.log("Cashflow queries invalidated");
    }
  };

  const handlePaginationChange = () => {
    dataretrival.current = dataretrival.current + 1;
    FetchDataRetrival(dataretrival.current, searchObject);
  };

  const handleCloseCreditForm = async () => {
    setShowCreditForm(false);
    setSelectedData(null);
    fetchAllCredit(dataretrival.current, searchObject);
    
    // Invalidate cashflow queries to refresh data
    await invalidateCashflowQueries();
  };

  // Get current page data
  const getCurrentPageData = (data, pagination) => {
    // Return empty array if data is null, undefined, or empty object
    if (!data || Object.keys(data).length === 0 || !Array.isArray(data)) {
      return [];
    }
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data?.slice(startIndex, endIndex);
  };

  // Table headers
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      searchable: true,
      enableSorting: true,
    },
    {
      accessorKey: "date",
      header: "Date",
      enableSorting: true,
    },
    {
      accessorKey: "customer_name",
      header: "Organization",
      searchable: true,
    },
    {
      accessorKey: "vehicle_no",
      header: "Vehicle",
      searchable: true,
    },
    {
      accessorKey: "portfolio_name",
      header: "Portfolio",
      searchable: true,
    },
    {
      accessorKey: "shift_name",
      header: "Shift",
      searchable: true,
    },
    {
      accessorKey: "product_name",
      header: "Product",
      searchable: true,
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.product_name.map((p, index) => (
            <span key={index} className="block py-[4px]">
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.price.map((p, index) => (
            <span key={index} className="block py-[4px]">
              {formatINR(p)}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.quantity.map((q, index) => (
            <span key={index} className="block py-[4px]">
              {q}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.amount.map((a, index) => (
            <span key={index} className="block py-[4px]">
              {formatINR(a)}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      enableSorting: true,
      cell: ({ row }) => formatINR(row.original.total_amount),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <TooltipMessage message="Edit credit">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => handleEditCredit(row.original)}
          >
            <Edit className="h-4 w-4 text-neutral-gray900" />
          </Button>
          </TooltipMessage>
          <TooltipMessage message="Delete credit">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => handleDeleteCredit(row.original)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          </TooltipMessage>
        </div>
      ),
    },
  ];

  const headerContent = (
    <div className="bg-[var(--neutral-white)] rounded-t-lg">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-col space-y-4">
          {/* Title Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="hidden sm:block">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--neutral-gray900)]">
                Customer Credits
              </h2>
            </div>

            {/* Search and Actions Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Filter and Search */}
              <div className="flex-grow sm:flex-grow-0">
                <FilterAndSearch
                  onDateApply={handleDateApply}
                  onSearch={handleSearch}
                  filterOption={columns}
                  onClearAll={() => {
                    setSearchObject([]);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    fetchAllCredit(dataretrival.current, []);
                  }}
                />
              </div>
              {/* Add Credit Button */}
              <Button
                onClick={() => setShowCreditForm(true)}
                className="w-full sm:w-auto bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)] justify-center whitespace-nowrap"
              >
                <CirclePlus className="w-4 h-4 mr-2" />
                Credit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ContentHeader
        title="Customer Recent Credit"
        description="View and manage customer credit transactions"
        showBackButton={false}
        isLoading={loading}
      />
      <div
        className={`flex-col ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
      >
        {showCreditForm && (
           <>
          <Backdrop />
          <CreditActionDialog
            isOpen={showCreditForm}
            onClose={handleCloseCreditForm}
            onSave={handleSave}
            inventoryProducts={inventoryProducts}
            portfolioList={portfoliolistforcredit}
            isGlobalCreditEntry={true}
            selectedData={selectedData}
            customer_id={selectedCustomerId}
            loading={loadingAdd}
          />
          </>
        )}
      </div>
      <div
        className={`container mx-auto px-4 py-4 ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
      >
        <Card className="shadow-sm">
          <CardContent className="p-0 pb-8">
            <div className="w-full bg-[var(--neutral-white)] rounded-t-lg">
              <div className="px-6 pt-4">{headerContent}</div>
            </div>

            {/* Active Filters Display */}
            {searchObject.length > 0 && (
              <div className="px-6 my-4">
                <div className="bg-gradient-to-r from-[var(--neutral-white)] to-[var(--neutral-gray25)] dark:from-[var(--neutral-gray900)] dark:to-[var(--neutral-gray850)] py-3 px-4 flex flex-wrap gap-3 rounded-xl border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] shadow-sm">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)] uppercase tracking-wide">
                        Active Filters
                      </span>
                      <button
                        onClick={handleClearAllFilters}
                        className="ml-2 px-2 py-0.5 text-xs font-medium bg-[var(--neutral-gray100)] hover:bg-[var(--neutral-gray200)] text-[var(--neutral-gray600)] hover:text-[var(--neutral-gray700)] rounded-md border border-[var(--neutral-gray200)] transition-colors duration-200 flex items-center gap-1"
                      >
                        Clear all 
                        <XCircle className="w-3.5 h-3.5 text-[var(--neutral-gray600)] hover:text-[var(--neutral-gray700)]" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full">
                    {searchObject.map((search, index) => {
                      // Get the column header for search terms
                      const getFilterLabel = () => {
                        if (search.dateRange) return "Date Range";
                        if (search.dateFilter) return "Date";
                        if (search.searchTerm) {
                          const column = columns.find(col => 
                            col.accessorKey === search.filterOption || 
                            col.header?.toLowerCase() === search.filterOption?.toLowerCase()
                          );
                          return column?.header || "Search";
                        }
                        return "Filter";
                      };

                      const filterLabel = getFilterLabel();
                      
                      return (
                        <Badge 
                          key={index}
                          variant="outline"
                          className="border-[var(--primary-700)] hover:border-[var(--primary-700)] bg-[var(--primary-100)] hover:bg-[var(--primary-100)] gap-2 px-3 py-1 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
                        >
                          {search.dateRange ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5 text-[var(--primary-800)]" />
                                <span className="font-semibold text-xs text-[var(--primary-900)] tracking-wide uppercase">{filterLabel}:</span>
                              </div>
                              <span className="text-sm font-medium text-[var(--primary-700)]">{search.dateRange.startDate} - {search.dateRange.endDate}</span>
                            </>
                          ) : search.dateFilter ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5 text-[var(--primary-800)]" />
                                <span className="font-semibold text-xs text-[var(--primary-900)] tracking-wide uppercase">{filterLabel}:</span>
                              </div>
                              <span className="text-sm font-medium text-[var(--primary-700)]">{search.dateFilter}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-xs text-[var(--secondary-700)] tracking-wide uppercase">{filterLabel}:</span> 
                              <span className="text-sm font-medium text-[var(--primary-700)]">{search.searchTerm}</span>
                            </>
                          )}
                          <button 
                            className="ml-1 p-1 rounded-full hover:bg-[var(--primary-200)] active:bg-[var(--primary-400)] transition-all duration-150 ease-in-out transform hover:scale-110 active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelFilter(search);
                            }}
                            title="Remove filter"
                          >
                            <XCircle className="w-3.5 h-3.5 text-[var(--primary-700)] hover:text-[var(--primary-900)]" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="px-6 mt-6">
              <CreditSummaryCard
                totalCount={footerData.total_count}
                totalAmount={footerData.total_amount}
              />
            </div>

            {/* Table Section */}
            <div className="pt-2 px-6 mt-2">
              <BaseTable
                columns={columns}
                data={getCurrentPageData(AllCredit, pagination)}
                loading={loading}
                isEmpty={!AllCredit || Object.keys(AllCredit).length === 0 || !Array.isArray(AllCredit) || AllCredit.length === 0}
                initialPageSize={pagination.pageSize}
                startAndEndColPin={true}
                emptyTitle="No credit transactions available"
                emptyDescription="Add your first credit transaction to start tracking credits"
                emptyActionLabel="Add Credit"
                onEmptyAction={() => setShowCreditForm(true)}
              />
              {AllCredit && Array.isArray(AllCredit) && AllCredit.length > 0 && (
              <div className="mt-4">
                <TableDataPagination
                  currentPage={pagination.currentPage}
                  totalItems={AllCredit?.length || 0}
                  pageSize={pagination.pageSize}
                  onPageChange={(page) =>
                    setPagination((prev) => ({ ...prev, currentPage: page }))
                  }
                  onPageSizeChange={(size) => {
                    setPagination({ currentPage: 1, pageSize: size });
                  }}
                />
              </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showDeleteConfirmation && (
        <>
          <Backdrop />
          <CustomerCreditDeleteAction
            isOpen={showDeleteConfirmation}
            onClose={() => {
              setShowDeleteConfirmation(false);
              setSelectedData(null);
            }}
            onConfirm={handleDeleteConfirm}
            selectedData={selectedData}
            loading={loadingDelete}
          />
        </>
      )}
    </>
  );
};

export default CustomerRecentCredit;
