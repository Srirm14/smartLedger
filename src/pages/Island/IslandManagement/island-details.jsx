import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ContentHeader } from "@/components/Header/ContentHeader";
import { SalesProductsTab } from "../SalesTab/sales-products-tab";
import { CashflowTab } from "../CashflowTab/cashflow-tab";
import { Button } from "@/components/ui/button";
import { View } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalDateStore from "../../../../store/useGlobalStore";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioStore } from "../../../../store/usePortfolioStore";
import { useShiftConfigStore } from "../../../../store/useSettingStore";
import { TableEmptyState } from "@/components/EmptyState/TableEmptyState";

// Memoized skeleton component for loading state
const LoadingSkeleton = memo(() => (
  <div className="flex-1 flex flex-col">
    <ContentHeader
      title="Island: Loading..."
      description="Details and shift data for this island"
      showBackButton={true}
      onBack={() => navigate('/island-management')}
      isLoading={true}
    />
    <div className="p-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center h-[400px] w-full">
            <div className="relative w-full p-6 rounded-lg animate-pulse">
              <div className="absolute top-4 right-4">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="mb-6">
                <Skeleton className="h-6 w-3/4 rounded" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>
              <div className="mt-6 flex justify-between items-center">
                <Skeleton className="h-10 w-24 rounded" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
));

// Memoized tab button component
const TabButton = memo(({ isActive, onClick, children }) => (
  <button
    className={`py-2 md:py-3 px-3 md:px-4 text-sm md:text-base font-medium ${
      isActive
        ? "border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]"
        : "text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)] hover:text-[var(--neutral-gray700)] dark:hover:text-[var(--neutral-gray300)]"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
));

// Memoized report button component
const ReportButton = memo(({ activeShift, onTallySalesAndPayments }) => {
  if (!activeShift?.shift_id) return null;
  
  return (
    <div className="ml-auto mt-2 sm:mt-0">
      <Button
        variant="outline"
        className="gap-1 md:gap-2 h-8 md:h-10 text-xs md:text-sm text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)] hover:bg-[var(--neutral-gray100)] dark:hover:bg-[var(--neutral-gray800)]"
        onClick={onTallySalesAndPayments}
      >
        <View className="h-3.5 w-3.5 md:h-4 md:w-4" />
        Report
      </Button>
    </div>
  );
});

// Memoized empty state component
const EmptyStateComponent = memo(({ onConfigureShifts }) => (
  <TableEmptyState 
    title="No shifts available"
    description="No shifts available for this day. Please add shifts in settings."
    actionLabel="Configure Shifts"
    onAction={onConfigureShifts}
  />
));

// Memoized tab content component
const TabContent = memo(({ activeTab, activeShift, onConfigureShifts }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={`${activeTab}-${activeShift?.shift_id || 'no-shift'}`}
      initial={{ opacity: 0, x: 50, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-8 w-full"
    >
      {activeShift?.shift_id ? (
        activeTab === "sales" ? (
          <SalesProductsTab shift={activeShift} />
        ) : (
          <CashflowTab shift={activeShift} />
        )
      ) : (
        <EmptyStateComponent onConfigureShifts={onConfigureShifts} />
      )}
    </motion.div>
  </AnimatePresence>
));

export function IslandDetails() {
  const [activeTab, setActiveTab] = useState("sales");
  const [activeShift, setActiveShift] = useState(null);
  
  const { portfolioName } = useParams();
  const { IslandSelectedDate } = useGlobalDateStore();
  const navigate = useNavigate();
  
  const { 
    setActiveShiftState, 
    portfolioList, 
    isPortfolioLoading,
    fetchPortfolioList 
  } = usePortfolioStore();
  
  const { 
    shifts, 
    isLoading: isShiftsLoading, 
    fetchPortfolioShifts 
  } = useShiftConfigStore();

  // Custom setActiveShift function that updates both local and global state
  // and resets tab to "sales" when shift changes
  const handleSetActiveShift = useCallback((shift) => {
    setActiveShift(shift);
    setActiveShiftState(shift);
    // Reset to sales tab whenever shift changes
    setActiveTab("sales");
  }, [setActiveShiftState]);

  // Memoized portfolio finding logic
  const currentPortfolio = useMemo(() => {
    if (!portfolioList || portfolioList.length === 0) return null;
    return portfolioList.find(p => p?.portfolio_name === portfolioName);
  }, [portfolioList, portfolioName]);

  // Memoized loading state
  const isLoading = useMemo(() => 
    isPortfolioLoading || isShiftsLoading, 
    [isPortfolioLoading, isShiftsLoading]
  );

  // Memoized callbacks
  const handleTallySalesAndPayments = useCallback(() => {
    if (activeShift?.shift_id) {
      navigate(`${window.location.pathname}/tallyreport_${activeShift.shift_id}`);
    }
  }, [activeShift?.shift_id, navigate]);

  const handleConfigureShifts = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Fetch portfolio list if not available
  useEffect(() => {
    if (!portfolioList || portfolioList.length === 0) {
      fetchPortfolioList(IslandSelectedDate);
    }
  }, [IslandSelectedDate, portfolioList, fetchPortfolioList]);

  // Fetch shifts when portfolio is found
  useEffect(() => {
    if (!isPortfolioLoading && currentPortfolio?.id) {
      fetchPortfolioShifts(currentPortfolio.id, IslandSelectedDate);
    }
  }, [IslandSelectedDate, fetchPortfolioShifts, currentPortfolio, isPortfolioLoading]);

  // Set active shift when shifts are loaded
  useEffect(() => {
    if (isShiftsLoading) return;

    if (shifts && Array.isArray(shifts) && shifts.length > 0) {
      // First try to find an active shift
      const activeShiftFound = shifts.find(shift => 
        shift && shift.shift_id && shift.active !== false
      );
      
      if (activeShiftFound) {
        setActiveShift(activeShiftFound);
        setActiveShiftState(activeShiftFound);
        // Reset to sales tab when shift is set
        setActiveTab("sales");
      } else {
        // If no active shift found, use the first valid shift
        const validShift = shifts.find(shift => shift && shift.shift_id);
        if (validShift) {
          setActiveShift(validShift);
          setActiveShiftState(validShift);
          // Reset to sales tab when shift is set
          setActiveTab("sales");
        } else {
          setActiveShift(null);
          setActiveShiftState(null);
        }
      }
    } else {
      setActiveShift(null);
      setActiveShiftState(null);
    }
  }, [shifts, setActiveShiftState, isShiftsLoading]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title={`Island: ${portfolioName || 'Loading...'}`}
        description={`Details and shift data for ${portfolioName || 'this island'}`}
        showBackButton={true}
        onBack={() => navigate('/island-management')}
        isLoading={isLoading}
        shifts={shifts || []}
        activeShift={activeShift}
        setActiveShift={handleSetActiveShift}
        showEmptyState={true}
      />
      <div className="p-4 md:p-6">
        <Card className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
          <CardContent className="p-2 md:p-4">
            <div className="flex flex-wrap justify-between items-center border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] w-full">
              <div className="justify-start h-auto p-0 bg-transparent rounded-none border-0">
                <TabButton
                  isActive={activeTab === "sales"}
                  onClick={() => setActiveTab("sales")}
                >
                  Sales Products
                </TabButton>
                <TabButton
                  isActive={activeTab === "cashflow"}
                  onClick={() => setActiveTab("cashflow")}
                >
                  Cashflow
                </TabButton>
              </div>
              <ReportButton
                activeShift={activeShift}
                onTallySalesAndPayments={handleTallySalesAndPayments}
              />
            </div>
            <motion.div
              key={`${activeTab}-${activeShift?.shift_id || 'no-shift'}`}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
              className="p-2 md:p-4"
            >
              <TabContent
                activeTab={activeTab}
                activeShift={activeShift}
                onConfigureShifts={handleConfigureShifts}
              />
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default memo(IslandDetails);
