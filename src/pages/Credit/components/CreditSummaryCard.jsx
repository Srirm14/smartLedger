import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

const CreditSummaryCard = ({ 
  totalCount, 
  totalAmount,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 min-w-[340px] flex-1 h-[120px]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="h-7 w-7 rounded-md" />
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4 min-w-[340px] flex-1 h-[120px]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="h-7 w-7 rounded-md" />
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4 min-w-[340px] bg-white flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center" style={{ background: 'var(--warning-100)', border: '1.3px solid var(--warning-700)' }}>
              <CreditCard className="h-4 w-4" style={{ color: 'var(--warning-700)' }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <div className="text-xl font-semibold mt-1" style={{ color: 'var(--warning-600)' }}>
                {totalCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 min-w-[340px] bg-white flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center" style={{ background: 'var(--success-100)', border: '1.3px solid var(--success-700)' }}>
              <DollarSign className="h-4 w-4" style={{ color: 'var(--success-700)' }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <div className="text-xl font-semibold mt-1" style={{ color: 'var(--success-600)' }}>
                {formatINR(totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditSummaryCard; 