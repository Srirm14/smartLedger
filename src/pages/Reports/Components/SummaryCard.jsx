import React from "react";

const SummaryCard = ({
  icon: Icon,
  iconBg,
  iconBorder,
  iconColor,
  title,
  value,
  valueColor,
  subItems = [],
  totalLabel,
  totalValue,
  totalBg,
  totalBorder,
  totalTextColor,
  children,
  cardBg = "bg-white",
  cardBorder = "border",
  className = "",
  ...props
}) => {
  return (
    <div className={`border rounded-lg p-3 md:p-4 w-full flex-1 shadow-xs ${cardBg} ${cardBorder} ${className}`} {...props}>
      <div className="flex flex-col items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2 md:gap-3 w-full">
          <div className={`h-6 w-6 md:h-7 md:w-7 rounded-md flex items-center justify-center ${iconBg} ${iconBorder} border-[1.3px] flex-shrink-0`}>
            {Icon && <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${iconColor}`} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm md:text-sm text-[var(--neutral-gray800)] truncate">{title}</p>
            <div className={`text-lg md:text-xl font-semibold mt-0.5 md:mt-1 ${valueColor}`}>{value}</div>
          </div>
        </div>

        {subItems.length > 0 && (
          <div className="flex flex-col w-full gap-1">
            {subItems.map((item, idx) => (
              <div
                key={item.label || idx}
                className="flex justify-between items-center w-full"
              >
                <span className="font-medium text-xs text-[var(--neutral-gray700)]">{item.label}:</span>
                <span className={`font-medium text-sm  text-right break-all ${item.valueColor || ''}`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalLabel && (
        <div className={`flex justify-between text-[10px] md:text-xs p-1 md:p-1.5 ${totalBg} rounded ${totalBorder} mt-3`}>
          <span className={`font-medium ${totalTextColor}`}>{totalLabel}</span>
          <span className={`font-medium ${totalTextColor}`}>{totalValue}</span>
        </div>
      )}
      {children}
    </div>
  );
};

export default SummaryCard; 