import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Check, X } from "lucide-react";

const StatusBadge = ({
  status,
  activeText = "Active",
  inactiveText = "Inactive",
  className,
  ...props
}) => {
  const isActive = status === true || status === "active" || status === "Active";
  
  return (
    <Badge
      className={cn(
        "w-fit px-2 py-1 rounded-full text-xs font-medium shadow-none flex items-center gap-1",
        isActive 
          ? "bg-success-100 text-success-600 hover:bg-success-200" 
          : "bg-danger-100 text-danger-600 hover:bg-danger-100",
        className
      )}
      {...props}
    >
      {isActive ? (
        <>
          <Check className="w-3 h-3" />
          {activeText}
        </>
      ) : (
        <>
          <X className="w-3 h-3" />
          {inactiveText}
        </>
      )}
    </Badge>
  );
};

export { StatusBadge }; 