import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  DollarSign,
  Briefcase,
  CircleDollarSign,
  Wallet,
  Info,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils/formatters";
import useGlobalDateStore from "../../../../store/useGlobalStore";
import { useIntegratedCashflowStore } from "../../../../store/useIntegratedCashflowStore";
import { useGlobalCashflowStore } from "../../../../store/useGlobalCashflowStore";
import SummaryCard from "./SummaryCard";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const CashflowSummaryCard = () => {
  const { cashflowSummary, fetchCashflowSummary, cashflowSummaryLoading, cashflowSummaryError } = useIntegratedCashflowStore();
  const { CashflowSelectedDate } = useGlobalDateStore();
  const [selectedTabs, setSelectedTabs] = useState({});
  const { IncomeCashflow, ExpenseCashflow, fetchIncomeCashflow, fetchCategoryWiseExpenseCashflow } = useGlobalCashflowStore();
  
  useEffect(() => {
    fetchCashflowSummary(CashflowSelectedDate);
    fetchIncomeCashflow(CashflowSelectedDate);
    fetchCategoryWiseExpenseCashflow(CashflowSelectedDate);
  }, [CashflowSelectedDate, fetchCashflowSummary, fetchIncomeCashflow, fetchCategoryWiseExpenseCashflow]);
  
  // Loading state
  if (cashflowSummaryLoading) {
    return (
      <Card className="bg-white shadow-sm mb-4 md:mb-6 border-none shadow-none">
        <CardContent className="px-2 py-2 md:py-3">
          <div className="flex justify-between items-center mb-2 md:mb-4">
          <Skeleton className="h-6 w-[200px] md:h-7 md:w-[300px] rounded-md" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {/* Income Section Skeleton */}
            <div className="border rounded-lg p-3 md:p-4 w-full bg-white flex-1">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 md:gap-3">
                  <Skeleton className="h-6 w-6 md:h-7 md:w-7 rounded-md" />
                  <div>
                    <Skeleton className="h-4 w-16 md:w-20" />
                    <Skeleton className="h-6 w-24 md:w-32 mt-1" />
                  </div>
                </div>
              </div>
              <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-1 md:p-1.5 bg-gray-50 rounded-md">
                    <Skeleton className="h-4 w-24 md:w-32" />
                    <Skeleton className="h-4 w-20 md:w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Section Skeleton */}
            <div className="border rounded-lg p-3 md:p-4 w-full bg-white flex-1">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 md:gap-3">
                  <Skeleton className="h-6 w-6 md:h-7 md:w-7 rounded-md" />
                  <div>
                    <Skeleton className="h-4 w-16 md:w-20" />
                    <Skeleton className="h-6 w-24 md:w-32 mt-1" />
                  </div>
                </div>
              </div>
              <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-1 md:p-1.5 bg-gray-50 rounded-md">
                    <Skeleton className="h-4 w-24 md:w-32" />
                    <Skeleton className="h-4 w-20 md:w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Section Skeleton */}
            <div className="border rounded-lg p-3 md:p-4 w-full bg-white flex-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 md:gap-3">
                  <Skeleton className="h-6 w-6 md:h-7 md:w-7 rounded-md" />
                  <div>
                    <Skeleton className="h-4 w-16 md:w-20" />
                    <Skeleton className="h-6 w-24 md:w-32 mt-1" />
                  </div>
                </div>
              </div>
              <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                <div className="flex items-center justify-between p-1 md:p-1.5 bg-gray-50 rounded-md">
                  <Skeleton className="h-4 w-24 md:w-32" />
                  <Skeleton className="h-4 w-20 md:w-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Section Skeleton */}
          <div className="mt-3 md:mt-5 pt-2 md:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-3 md:p-4 w-full bg-white flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Skeleton className="h-6 w-6 md:h-7 md:w-7 rounded-md" />
                    <div>
                      <Skeleton className="h-4 w-24 md:w-32" />
                      <Skeleton className="h-6 w-32 md:w-40 mt-1" />
                      <Skeleton className="h-3 w-40 md:w-48 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 md:w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (cashflowSummaryError) {
    return (
      <Card className="bg-white shadow-sm mb-4 md:mb-6 border-rose-200">
        <CardContent className="p-3 md:p-6">
          <div className="text-rose-600 flex items-center gap-1.5 md:gap-2">
            <Info className="h-4 w-4 md:h-5 md:w-5" />
            <h2 className="text-base md:text-lg font-semibold">Error Loading Cashflow Data</h2>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
            Failed to load the cashflow summary. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // No data state
  if (!cashflowSummary) {
    return (
      <Card className="bg-white shadow-sm mb-4 md:mb-6">
        <CardContent className="px-2 py-2 md:py-3">
          <h2 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Sales Summary</h2>
          <p className="text-xs md:text-sm text-gray-500">No sales data available for the selected date.</p>
        </CardContent>
      </Card>
    );
  }
  
  const { income, expenses, credit, summary, portfolio_breakdown } = cashflowSummary;
  const isNetCashflowPositive = summary.net_cashflow >= 0;
  const isCashOnHandPositive = summary.cash_on_hand >= 0;
  
  const handleTabChange = (islandName, tab) => {
    setSelectedTabs(prev => ({
      ...prev,
      [islandName]: tab
    }));
  };

  return (
    <Card className="bg-white shadow-sm mb-4 md:mb-6 border-none shadow-none">
      <CardContent className="px-2 py-2 md:py-3">
        <div className="flex justify-between items-center mb-2 md:mb-4">
          <span className="text-md font-poppins font-medium text-slate-700 flex items-center gap-2">
            Sales Summary <span className="text-sm font-normal text-slate-600">as of</span>
            <span className="inline-flex items-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-semibold text-slate-700">{CashflowSelectedDate || new Date().toISOString().split('T')[0]}</span>
            </span>
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Income Section */}
          <SummaryCard
            icon={TrendingUp}
            iconBg="bg-[var(--success-100)]"
            iconBorder="border-[var(--success-600)]"
            iconColor="text-[var(--success-600)]"
            title="Income"
            value={formatINR(income.total_income)}
            valueColor="text-[var(--success-600)]"
            subItems={[
              {
                label: "Island Sales",
                value: formatINR(income.meter_sales_income),
                valueColor: income.meter_sales_income > 0 ? "text-[var(--success-600)]" : (income.meter_sales_income < 0 ? "text-[var(--danger-600)]" : "text-[var(--neutral-gray700)]")
              },
              {
                label: "Outbound Stock",
                value: formatINR(income.stock_sales_income),
                valueColor: income.stock_sales_income > 0 ? "text-[var(--success-600)]" : (income.stock_sales_income < 0 ? "text-[var(--danger-600)]" : "text-[var(--neutral-gray700)]")
              },
            ]}
            cardBg="bg-none"
            cardBorder="border"
          />
          {/* Expense Section */}
          <SummaryCard
            icon={TrendingDown}
            iconBg="bg-[var(--danger-100)]"
            iconBorder="border-[var(--danger-600)]"
            iconColor="text-[var(--danger-600)]"
            title="Expense"
            value={formatINR(expenses.total_expenses)}
            valueColor="text-[var(--danger-600)]"
            subItems={[
              {
                label: "Expenses",
                value: formatINR(expenses.cashflow_expenses),
                valueColor: expenses.cashflow_expenses > 0 ? "text-[var(--danger-600)]" : (expenses.cashflow_expenses < 0 ? "text-[var(--success-600)]" : "text-[var(--neutral-gray700)]")
              },
              {
                label: "Stock Purchases",
                value: formatINR(expenses.stock_purchase_expenses),
                valueColor: expenses.stock_purchase_expenses > 0 ? "text-[var(--danger-600)]" : (expenses.stock_purchase_expenses < 0 ? "text-[var(--success-600)]" : "text-[var(--neutral-gray700)]")
              },
            ]}
            cardBg="bg-none"
            cardBorder="border"
          />
          {/* Credit Section */}
          <SummaryCard
            icon={CreditCard}
            iconBg="bg-[var(--warning-100)]"
            iconBorder="border-[var(--warning-600)]"
            iconColor="text-[var(--warning-600)]"
            title="Credit"
            value={formatINR(credit.total_credit)}
            valueColor="text-[var(--warning-600)]"
            subItems={[
              {
                label: "Credit Given",
                value: formatINR(credit.total_credit),
                valueColor: credit.total_credit > 0 ? "text-[var(--warning-600)]" : (credit.total_credit < 0 ? "text-[var(--danger-600)]" : "text-[var(--neutral-gray700)]")
              },
            ]}
            cardBg="bg-none"
            cardBorder="border"
          />
        </div>
        
        {/* Summary Section */}
        <div className="mt-3 md:mt-5 pt-2 md:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="border rounded-lg p-3 md:p-4 w-full bg-[var(--neutral-white)] flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`h-6 w-6 md:h-7 md:w-7 rounded-md flex items-center justify-center ${isNetCashflowPositive ? 'bg-[var(--success-100)] border-[var(--success-600)]' : 'bg-[var(--danger-100)] border-[var(--danger-600)]'} border-[1.3px]`}>
                  <DollarSign className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isNetCashflowPositive ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`} />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[var(--neutral-gray800)]">Net Cashflow</p>
                  <div className={`text-lg md:text-xl font-semibold mt-0.5 md:mt-1 ${isNetCashflowPositive ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`}>
                    {formatINR(summary.net_cashflow)}
                  </div>
                  <p className="text-[12px] md:text-xs font-medium  text-[var(--neutral-gray800)] mt-0.5 md:mt-1">Total income - expenses</p>
                </div>
              </div>
              {isNetCashflowPositive ? (
                <div className="flex items-center text-[var(--success-600)]">
                  <ArrowUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-xs font-semibold ml-0.5 md:ml-1">Profit</span>
                </div>
              ) : (
                <div className="flex items-center text-[var(--danger-600)]">
                  <ArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] font-semibold md:text-xs ml-0.5 md:ml-1">Loss</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-3 md:p-4 w-full bg-[var(--neutral-white)] flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`h-6 w-6 md:h-7 md:w-7 rounded-md flex items-center justify-center ${isCashOnHandPositive ? 'bg-[var(--success-100)] border-[var(--success-600)]' : 'bg-[var(--danger-100)] border-[var(--danger-600)]'} border-[1.3px]`}>
                  <Wallet className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isCashOnHandPositive ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`} />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[var(--neutral-gray800)]">Cash on Hand</p>
                  <div className={`text-lg md:text-xl font-semibold mt-0.5 md:mt-1 ${isCashOnHandPositive ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`}>
                    {formatINR(summary.cash_on_hand)}
                  </div>
                  <p className="text-[12px] font-medium md:text-xs text-[var(--neutral-gray800)] mt-0.5 md:mt-1">(Total income - expenses) - credit given</p>
                </div>
              </div>
              {isCashOnHandPositive ? (
                <div className="flex items-center text-[var(--success-600)]">
                  <ArrowUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] font-semibold md:text-xs ml-0.5 md:ml-1">Sufficient</span>
                </div>
              ) : (
                <div className="flex items-center text-[var(--danger-600)]">
                  <ArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] font-semibold  md:text-xs ml-0.5 md:ml-1">Insufficient</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Island-wise Sales Cashflow Breakdown */}
        {portfolio_breakdown && Object.keys(portfolio_breakdown).length > 0 && (
          <div className="mt-6 md:mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-[var(--neutral-gray800)] tracking-tight">
                Island-wise Sales Cashflow Breakdown
              </h3>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2 py-1 text-xs md:text-sm text-[var(--neutral-gray500)] hover:text-[var(--neutral-gray700)] transition-colors rounded-md hover:bg-[var(--neutral-gray50)]">
                    <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>Details</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] md:w-[320px] p-4">
                  <div className="space-y-2">
                    <h5 className="font-semibold text-[var(--neutral-gray800)]">Island-wise Sales Cashflow Breakdown</h5>
                    <p className="text-xs md:text-sm text-[var(--neutral-gray600)] leading-relaxed">
                    This provides a detailed island-wise breakdown of income, expenses, and credit transactions for the selected date.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Responsive grid for Accordion, balanced left/right */}
            {(() => {
              const entries = Object.entries(portfolio_breakdown);
              const mid = Math.ceil(entries.length / 2);
              const left = entries.slice(0, mid);
              const right = entries.slice(mid);
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {[left, right].map((items, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <Accordion 
                        type="multiple" 
                        className="space-y-2.5"
                        onValueChange={(openItems) => {
                          if (Array.isArray(openItems)) {
                            openItems.forEach((name) => {
                              if (selectedTabs[name] !== 'income') {
                                handleTabChange(name, 'income');
                              }
                            });
                          }
                        }}
                      >
                        {items.map(([name, data]) => {
                          const isPortfolioNetPositive = data.net >= 0;
                          return (
                            <AccordionItem 
                              key={name} 
                              value={name} 
                              className="border border-[var(--neutral-gray100)] rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-sm"
                            >
                              <AccordionTrigger className="w-full px-4 py-2.5 bg-white hover:bg-[var(--neutral-gray50)] transition-all duration-300 rounded-xl rounded-b-none group text-left min-h-[48px] no-underline focus:no-underline hover:no-underline">
                                <div className="flex items-center gap-3 w-full select-none">
                                  <span className="text-base font-medium text-[var(--neutral-gray800)]">{name}</span>
                                  <div className="ml-auto flex items-center gap-2">
                                    <span className={`text-sm font-semibold whitespace-nowrap pr-2 ${isPortfolioNetPositive ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`}>
                                      {formatINR(data.net)}
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="bg-white border-t border-[var(--neutral-gray100)] px-4 py-2.5 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden transition-all duration-300">
                                <div className="flex gap-2 mb-3">
                                  {['income', 'expense', 'credit'].map((tab) => (
                                    <button 
                                      key={tab}
                                      onClick={() => handleTabChange(name, tab)}
                                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                                        selectedTabs[name] === tab 
                                          ? 'bg-[var(--neutral-gray100)] text-[var(--neutral-gray800)]'
                                          : 'bg-transparent text-[var(--neutral-gray600)] hover:bg-[var(--neutral-gray50)]'
                                      }`}
                                    >
                                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                  ))}
                                </div>

                                {selectedTabs[name] === 'income' && IncomeCashflow && (
                                  <div className="space-y-1.5">
                                    {IncomeCashflow.island?.find(island => island.name === name)?.products?.length > 0 ? (
                                      <>
                                        {IncomeCashflow.island?.find(island => island.name === name)?.products?.map((product) => (
                                          <div key={product.id} className="flex justify-between items-center py-1.5">
                                            <span className="text-[13px] font-medium text-[var(--neutral-gray700)]">- {product.name}</span>
                                            <span className="text-[13px] font-medium text-[var(--success-600)]">
                                              {formatINR(parseFloat(product.sales?.replace(/[₹,]/g, '') || 0))}
                                            </span>
                                          </div>
                                        ))}
                                        <div className="flex justify-between items-center py-2 border-t border-[var(--neutral-gray100)] mt-1.5">
                                          <span className="text-sm font-semibold text-[var(--neutral-gray800)]">Total Income</span>
                                          <span className="text-sm font-bold text-[var(--success-600)]">
                                            {formatINR(IncomeCashflow.island?.find(island => island.name === name)?.products?.reduce((sum, product) => 
                                              sum + parseFloat(product.sales?.replace(/[₹,]/g, '') || 0), 0
                                            ) || 0)}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex items-center justify-center py-4">
                                        <span className="text-sm text-[var(--neutral-gray600)]">No income entries present</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {selectedTabs[name] === 'expense' && ExpenseCashflow && (
                                  <div className="space-y-1.5">
                                    {Object.keys(ExpenseCashflow[name] || {}).length > 0 ? (
                                      <>
                                        {Object.entries(ExpenseCashflow[name] || {}).map(([category, amount]) => (
                                          <div key={category} className="flex justify-between items-center py-1.5">
                                            <span className="text-[13px] font-medium text-[var(--neutral-gray700)]">- {category}</span>
                                            <span className="text-[13px] font-medium text-[var(--danger-600)]">{formatINR(amount)}</span>
                                          </div>
                                        ))}
                                        <div className="flex justify-between items-center py-2 border-t border-[var(--neutral-gray100)] mt-1.5">
                                          <span className="text-sm font-semibold text-[var(--neutral-gray800)]">Total Expense</span>
                                          <span className="text-sm font-bold text-[var(--danger-600)]">
                                            {formatINR(Object.values(ExpenseCashflow[name] || {}).reduce((sum, amount) => sum + amount, 0))}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex items-center justify-center py-4">
                                        <span className="text-sm text-[var(--neutral-gray600)]">No expense entries present</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {selectedTabs[name] === 'credit' && (
                                  <div className="space-y-1.5">
                                    {portfolio_breakdown[name]?.credit > 0 ? (
                                      <>
                                        <div className="flex justify-between items-center py-1.5">
                                          <span className="text-[13px] font-medium text-[var(--neutral-gray700)]">- Credit Given</span>
                                          <span className="text-[13px] font-medium text-[var(--warning-600)]">{formatINR(portfolio_breakdown[name].credit)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-t border-[var(--neutral-gray100)] mt-1.5">
                                          <span className="text-sm font-semibold text-[var(--neutral-gray800)]">Total Credit</span>
                                          <span className="text-sm font-bold text-[var(--warning-600)]">
                                            {formatINR(portfolio_breakdown[name].credit)}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex items-center justify-center py-4">
                                        <span className="text-sm text-[var(--neutral-gray600)]">No credit entries present</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashflowSummaryCard; 