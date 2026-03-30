import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export function ContentHeader({
  title,
  description,
  tabs,
  activeTab,
  setActiveTab,
  showBackButton = true,
  isLoading = false,
  additionalContent,
  date,
  setDate,
  shifts,
  activeShift,
  setActiveShift,
  onBack,
  displayDatePicker = false,
  showEmptyState = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      const newPath =
        location.pathname.substring(0, location.pathname.lastIndexOf("/")) || "/";
      navigate(newPath);
    }
  };

  const formatTo12Hour = (time) => {
    if (!time) return "";
    try {
      const [hours, minutes] = time.split(":");
      if (!hours || !minutes) return "";
      const period = +hours >= 12 ? "PM" : "AM";
      const formattedHours = +hours % 12 || 12;
      return `${formattedHours}:${minutes} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  const formattedShifts = shifts?.map((shift) => {
    return {
      ...shift,
      startTime: formatTo12Hour(shift?.startTime),
      endTime: formatTo12Hour(shift?.endTime),
    };
  }) || [];


  return (
    <header className="bg-[var(--neutral-white)] border-b max-h-[162px] w-full dark:bg-[var(--neutral-gray900)] dark:border-[var(--neutral-gray700)]">
      <div className="w-full pt-6 px-4 md:px-6 lg:px-10">
        {/* Top section with back button and title */}
        <div className="flex w-full justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBackClick}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex flex-col gap-1">
              {isLoading ? (
                <>
                  <div className="h-7 w-[180px] bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)] rounded animate-pulse" />
                  <div className="h-5 w-[240px] bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)] rounded animate-pulse" />
                </>
              ) : (
                <>
                  <h1 className="text-lg font-semibold text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">{title}</h1>
                  <p className="text-sm text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">{description}</p>
                </>
              )}
            </div>
          </div>
          {additionalContent && (
            <div className="flex items-center gap-4">
              {additionalContent}
            </div>
          )}
        </div>

        {/* Tabs section */}
        {tabs && tabs.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex overflow-x-auto -mb-[1px] w-full sm:w-auto">
              {isLoading ? (
                <div className="flex gap-2">
                  <div className="h-[24px] w-[120px] bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)] rounded animate-pulse" />
                  <div className="h-[24px] w-[120px] bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)] rounded animate-pulse" />
                </div>
              ) : (
                tabs.map((tab) => (
                  <button
                    key={tab.value}
                    className={`px-3 md:px-6 py-3 font-medium text-sm whitespace-nowrap relative border-b-2 transition-colors duration-200 ${
                      activeTab.value === tab.value
                        ? "border-[var(--neutral-black)] dark:border-[var(--neutral-white)] text-[var(--neutral-black)] dark:text-[var(--neutral-white)]"
                        : "border-transparent text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Shifts section */}
        {shifts && Array.isArray(shifts) && shifts.length > 0 ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex overflow-x-auto -mb-[1px] w-full sm:w-auto">
              {isLoading ? (
                <div className="flex gap-2">
                  <div className="h-[42px] w-[180px] bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)] rounded animate-pulse" />
                  <div className="h-[42px] w-[180px] bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)] rounded animate-pulse" />
                  <div className="h-[42px] w-[180px] bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)] rounded animate-pulse" />
                </div>
              ) : (
                shifts.map((shift) => {
                    return shift && shift.shift_id ? (
                    <button
                      key={shift.shift_id}
                      className={`px-3 md:px-6 py-3 font-medium text-sm whitespace-nowrap relative border-b-2 transition-colors duration-200 ${
                        activeShift && activeShift.shift_id === shift.shift_id
                          ? "border-[var(--neutral-black)] dark:border-[var(--neutral-white)] text-[var(--neutral-black)] dark:text-[var(--neutral-white)]"
                          : "border-transparent text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]"
                      }`}
                      onClick={() => shift && setActiveShift(shift)}
                    >
                      <span className="font-semibold text-[16px]">
                        {shift.label}
                      </span>
                      <span className="text-muted-foreground hidden sm:inline">
                        {" "}
                        ({formattedShifts.find(s => s?.shift_id === shift?.shift_id)?.startTime || '--:--'} - {formattedShifts.find(s => s?.shift_id === shift?.shift_id)?.endTime || '--:--'})
                      </span>
                    </button>
                  ) : null;
                })
              )}
            </div>
          </div>
        ) : showEmptyState ? (
          <></>
        ) : null}
      </div>
    </header>
  );
}

ContentHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  activeTab: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
  setActiveTab: PropTypes.func,
  showBackButton: PropTypes.bool,
  isLoading: PropTypes.bool,
  additionalContent: PropTypes.node,
  date: PropTypes.string,
  setDate: PropTypes.func,
  shifts: PropTypes.arrayOf(
    PropTypes.shape({
      shift_id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      timestamp: PropTypes.string,
      key: PropTypes.string,
      portfolio_id: PropTypes.number,
      active: PropTypes.bool,
    })
  ),
  activeShift: PropTypes.shape({
    shift_id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    timestamp: PropTypes.string,
    key: PropTypes.string,
    portfolio_id: PropTypes.number,
    active: PropTypes.bool,
  }),
  setActiveShift: PropTypes.func,
  onBack: PropTypes.func,
  displayDatePicker: PropTypes.bool,
  showEmptyState: PropTypes.bool,
}; 