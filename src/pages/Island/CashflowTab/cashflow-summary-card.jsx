// SummaryCard.jsx

import {
  Info,
  HandCoinsIcon,
  ShoppingBagIcon,
  FuelIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  LucideBanknote,
  ArrowRight,
  Eye,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils/formatters";

export function SummaryCard({
  icon,
  title,
  primaryAmount,
  value, // New prop for simplified API
  secondaryAmount,
  untrackedAmount,
  ledgerBalanced,
  excessAmount,
  isTotal = false,
  textColor,
  breakdown = [], // Array of {mode: "Cash", amount: "₹2,000"}
  details = [], // New prop for simplified API with [{name, value}]
  loading = false,
  onClick, // New prop for click handler
}) {
  // Support different value props
  const displayAmount = value || primaryAmount;
  // Icon color and background combinations
  const getIconStyles = () => {
    switch (icon) {
      case "income":
        return {
          bg: "bg-emerald-100 border-emerald-700 border-[1.3px]",
          text: "text-emerald-700",
        };
      case "expense":
        return {
          bg: "bg-rose-100 border-rose-700 border-[1.3px]",
          text: "text-rose-700",
        };
      case "credit":
        return {
          bg: "bg-orange-100 border-orange-700 border-[1.3px]",
          text: "text-orange-700",
        };
      case "total":
        return {
          bg: "bg-indigo-100 border-indigo-700 border-[1.3px]",
          text: "text-indigo-700",
        };
      case "fuel":
        return {
          bg: "bg-amber-100 border-amber-700 border-[1.3px]",
          text: "text-amber-700",
        };
      case "consumables":
        return {
          bg: "bg-purple-100 border-purple-700 border-[1.3px]",
          text: "text-purple-700",
        };
      default:
        return {
          bg: "bg-sky-100 border-sky-700 border-[1.3px]",
          text: "text-sky-700",
        };
    }
  };

  const iconStyles = getIconStyles();

  if (loading) {
    return (
      <div className="border rounded-lg p-3 md:p-4 w-full flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 md:gap-3">
            <Skeleton className="h-6 w-6 md:h-7 md:w-7 rounded-md" />
            <div>
              <Skeleton className="h-3 md:h-4 w-16 md:w-20 mb-1 md:mb-2" />
              <Skeleton className="h-5 md:h-6 w-24 md:w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine what data to display in the popover
  const popoverData =
    details.length > 0
      ? details.map((item) => ({
          mode: item.mode || item.name,
          amount: item.amount || item.value,
        }))
      : breakdown;

  return (
    <div
      className={`border rounded-lg p-3 md:p-4 w-full bg-white flex-1 relative ${
        isTotal ? "bg-muted/20" : ""
      } ${onClick ? "cursor-pointer hover:bg-gray-50 transition-colors group" : ""}`}
      onClick={onClick}
    >
      {/* View indicator - positioned on top right */}
      {onClick && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm border border-gray-200/50">
          <Eye className="h-3 w-3 text-gray-600 group-hover:text-primary-600 transition-colors duration-200" />
          <span className="text-[8px] md:text-xs text-gray-700 group-hover:text-primary-600 font-medium transition-colors duration-200">
            View
          </span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 md:gap-3">
          <div
            className={`h-6 w-6 md:h-7 md:w-7 rounded-md flex items-center justify-center ${iconStyles.bg}`}
          >
            {icon === "income" && (
              <TrendingUpIcon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${iconStyles.text}`} />
            )}
            {icon === "expense" && (
              <TrendingDownIcon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${iconStyles.text}`} />
            )}
            {icon === "credit" && (
              <LucideBanknote className={`h-3.5 w-3.5 md:h-4 md:w-4 ${iconStyles.text}`} />
            )}
            {icon === "total" && (
              <HandCoinsIcon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${iconStyles.text}`} />
            )}
            {icon === "fuel" && (
              <FuelIcon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${iconStyles.text}`} />
            )}
            {icon === "consumables" && (
              <ShoppingBagIcon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${iconStyles.text}`} />
            )}
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <span className="flex flex-wrap items-center gap-1 md:gap-2">
              <p className="text-xs md:text-sm text-muted-foreground">{title}</p>{" "}
              {untrackedAmount !== undefined &&
                Number(untrackedAmount) !== 0 && (
                  <div>
                    <Badge
                      variant="destructive"
                      className="text-[8px] md:text-xs px-1 py-0 md:px-2 md:py-0.5"
                    >
                      untracked: {formatINR(untrackedAmount)}
                    </Badge>
                  </div>
                )}
              {ledgerBalanced && (
                <div>
                  <Badge
                    variant="success"
                    className="text-[8px] md:text-xs px-1 py-0 md:px-2 md:py-0.5"
                  >
                    {ledgerBalanced}
                  </Badge>
                </div>
              )}
              {excessAmount !== undefined && Number(excessAmount) !== 0 && (
                <div>
                  <Badge
                    variant="warning"
                    className="text-[8px] md:text-xs px-1 py-0 md:px-2 md:py-0.5"
                  >
                    excess: {formatINR(excessAmount)}
                  </Badge>
                </div>
              )}
            </span>

            <div className={`text-base md:text-xl font-semibold mt-0.5 md:mt-1 ${textColor || ""}`}>
              <span>{displayAmount}</span>
              {secondaryAmount && (
                <>
                  <span className="mx-0.5 md:mx-1">/</span>
                  <span className="text-[12px] md:text-[16px] text-gray-600">
                    {secondaryAmount}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {popoverData.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-0.5 md:p-1 rounded-md hover:bg-gray-100 transition-colors">
                <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] md:w-[220px] p-2 md:p-3 shadow-lg">
              <div className="space-y-1 md:space-y-2">
                <h4 className="font-medium text-xs md:text-sm">Breakdown</h4>
                <div className="space-y-0.5 md:space-y-1">
                  {popoverData.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-[10px] md:text-sm"
                    >
                      <span className="text-muted-foreground">{item.mode}</span>
                      <span className={textColor || ""}>{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
