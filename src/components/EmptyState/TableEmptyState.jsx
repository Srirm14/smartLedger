import { Button } from "@/components/ui/button";
import { FileSearch2 } from "lucide-react";
import { memo } from "react";
import noDataPresentSvg from "../../assets/illustrations/noDataPresent.svg";

const FallbackIcon = () => (
  <div className="w-[100px] h-[100px] rounded-full bg-neutral-gray100 dark:bg-neutral-gray800 flex items-center justify-center">
    <FileSearch2
      width={64}
      height={64}
      className="text-neutral-gray500 dark:text-neutral-gray400" 
      strokeWidth={1.2}
      aria-hidden="true"
    />
  </div>
);

FallbackIcon.displayName = 'FallbackIcon';

export const TableEmptyState = memo(({
  title = "No data available",
  description = "There are no items to display at the moment.",
  actionLabel,
  onAction,
  imageSrc = noDataPresentSvg
}) => {
  return (
    <div className="h-[350px] flex flex-col items-center justify-center gap-4 px-8 py-8 rounded-lg">
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-[200px] h-[200px] object-contain"
          loading="eager"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = '<div class="w-[100px] h-[100px] rounded-full bg-neutral-gray100 dark:bg-neutral-gray800 flex items-center justify-center"><svg class="w-16 h-16 text-neutral-gray500 dark:text-neutral-gray400" stroke-width="1.5"></svg></div>';
            e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
          }}
        />
      ) : (
        <FallbackIcon />
      )}
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-gray700 dark:text-neutral-gray100 mb-1">
          {title}
        </h3>
        <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          variant="outline"
          className="mt-2 border-[var(--primary-500)] text-[var(--primary-500)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)] active:bg-[var(--primary-100)] active:text-[var(--primary-600)]"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
});

TableEmptyState.displayName = 'TableEmptyState'; 