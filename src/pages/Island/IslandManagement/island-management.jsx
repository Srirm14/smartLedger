import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings,
  PackageIcon,
  ClockIcon,
  IndianRupeeIcon,
  CreditCardIcon,
  BriefcaseBusiness
} from "lucide-react";
import useGlobalDateStore from "../../../../store/useGlobalStore";
import { usePortfolioStore } from "../../../../store/usePortfolioStore";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/Table/BaseTable";
import { formatINR } from "@/lib/utils/formatters";
import { getResponsiveWidth } from '@/lib/utils/responsiveWidth';
import { Card, CardContent } from "@/components/ui/card";
import { ContentHeader } from "@/components/Header/ContentHeader";
import TableDataPagination from "@/components/Table/TableDataPagination";

export const IslandManagement = () => {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();
  const {
    portfolioList: islands,
    isPortfolioLoading: isLoading,
    fetchPortfolioList: fetchIslands,
  } = usePortfolioStore();
  const { IslandSelectedDate, setIslandSelectedDate, resetIslandSelectedDate } = useGlobalDateStore();
  const responsiveWidth = getResponsiveWidth();
  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data when component mounts or date changes
  useEffect(() => {
    fetchIslands(IslandSelectedDate);
  }, [fetchIslands, IslandSelectedDate]);

  // Handle row click navigation - memoized with useCallback
  const handleRowClick = useCallback((rowData) => {
    navigate(`/island-management/${encodeURIComponent(rowData.portfolio_name)}`); 
  }, [navigate]);

  // Process island data and map shifts from the island data itself - memoized with useMemo
  const processIslandData = useCallback((data) => {
    // Convert object to array if it's not already
    const islandArray = Array.isArray(data) ? data : Object.values(data);
    
    // Group data by portfolio_name
    const portfolioGroups = islandArray.reduce((acc, item) => {
      if (!acc[item.portfolio_name]) {
        acc[item.portfolio_name] = [];
      }
      acc[item.portfolio_name].push(item);
      return acc;
    }, {});

    // Process each portfolio group
    const processedIslands = Object.entries(portfolioGroups).map(([portfolioName, items]) => {
      const shifts = items.map(item => ({
        shift_name: item.shift_name,
        payment: item.overall_payment_received || 0,
        credit: item.credit || 0,
      }));

      const totalSales = items[0].total_sales || 0;
      const totalItems = items[0].total_items || 0;
      const portfolioId = items[0].id;

      const balance = shifts.reduce((acc, shift) => acc + shift.payment + shift.credit, 0) - totalSales;

      return {
        portfolio_id: portfolioId,
        name: portfolioName,
        portfolio_name: portfolioName,
        total_items: totalItems,
        shifts: shifts,
        credit: shifts,
        payment_received: shifts,
        total_sales: totalSales,
        balance: balance
      };
    });
    
    return processedIslands;
  }, []);

  // Memoize processed islands to prevent recalculation on every render
  const processedIslands = useMemo(() => processIslandData(islands), [processIslandData, islands]);

  // Get current page data for pagination - memoized with useMemo
  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedIslands.slice(startIndex, endIndex);
  }, [currentPage, pageSize, processedIslands]);

  // Memoize current page data
  const currentPageData = useMemo(() => getCurrentPageData(), [getCurrentPageData]);

  // Handle page change - memoized with useCallback
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle page size change - memoized with useCallback
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // Handle settings navigation - memoized with useCallback
  const handleSettingsNavigation = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  // Handle empty state action - memoized with useCallback
  const handleEmptyAction = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  // Memoize table columns to prevent recreation on every render
  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
          <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">Island Name</span>
        </div>
      ),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-medium text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)] group-hover:text-[var(--primary-500)] transition-colors duration-200">
          {row.original.portfolio_name || row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "total_items",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <PackageIcon className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
          <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">Total Items</span>
        </div>
      ),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">
          {row.original.total_items || 0}
        </span>
      ),
    },
    {
      accessorKey: "shifts",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]" />
          <span className="text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray400)]">Shift Name</span>
        </div>
      ),
      cell: ({ row }) => {
        const shifts = row.original.shifts || [];
        return (!shifts || !shifts.length || shifts.every(shift => !shift.shift_name)) ? (
          <div className="py-1 text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)] italic">
            No shifts created
          </div>
        ) : (
          <ul className="list-disc pl-5">
            {shifts.map((shift, index) => (
              <div key={index} className="py-1 text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] font-medium">
                {shift.shift_name}
              </div>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "credit",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <CreditCardIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Credit</span>
        </div>
      ),
      cell: ({ row }) => {
        const shifts = row.original.shifts || [];
        return (
          <ul className="list-disc pl-5">
            {shifts.map((shift, index) => (
              <div key={index} className="py-1 text-gray-700 font-medium">{formatINR(shift.credit || 0)}</div>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "payment_received",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Payment Received</span>
        </div>
      ),
      cell: ({ row }) => {
        const shifts = row.original.shifts || [];
        return (
          <ul className="list-disc pl-5">
            {shifts.map((shift, index) => (
              <div key={index} className="py-1 text-gray-700 font-medium">{formatINR(shift.payment || 0)}</div>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "totalSales",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Total Sales</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatINR(row.original.totalSales || row.original.total_sales || 0)}
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Balance</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className={`font-medium ${row.original.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {formatINR(row.original.balance || 0)}
        </span>
      ),
    },
  ], []);

  return (
    <>
      <ContentHeader
        title="Island Management"
        description="Manage your islands and their details"
        showBackButton={false}
        isLoading={isLoading}
      />
      <div className={`container mx-auto px-4 py-4 my-auto ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}>
        <Card className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
          <CardContent className="p-0 flex flex-col">
            {/* Header Section */}
            <div className="flex items-center justify-between pt-4 px-6">
              <span className="text-md font-poppins font-medium text-slate-700 flex items-center gap-2">
                Island's Overview <span className="text-sm font-normal text-slate-600">as of</span>
                <span className="inline-flex items-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-semibold text-slate-700">{IslandSelectedDate}</span>
                </span>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 flex items-center gap-2 text-xs font-medium"
                  onClick={handleSettingsNavigation}
                >
                  <Settings className="h-4 w-4" />
                  CONFIG
                </Button>
              </div>
            </div>
            {/* Table Section */}
            <div className="p-6">
              <BaseTable
                columns={columns}
                data={currentPageData}
                loading={isLoading}
                isRowClickable={true}
                onRowClick={handleRowClick}
                isEmpty={currentPageData.length === 0}
                emptyTitle="No islands available"
                emptyDescription="Configure your islands in settings to start managing them"
                emptyActionLabel="Go to Settings"
                onEmptyAction={handleEmptyAction}
              />
            </div>
            {/* Pagination Controls */}
            {currentPageData.length > 0 && (
            <div className="mt-auto">
              <TableDataPagination
                currentPage={currentPage}
                totalItems={processedIslands.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default IslandManagement;
