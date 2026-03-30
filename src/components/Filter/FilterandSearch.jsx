import { useState, useEffect } from "react";
import {
  CalendarCheck,
  CalendarDays,
  CalendarIcon,
  CalendarRange,
  Search,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { DateFilter } from "@/components/DateFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FILTER_PREFERENCE_KEY = 'userFilterPreference';

const FilterAndSearch = ({ onDateApply, onSearch, filterOption, onClearAll }) => {
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [hasInput, setHasInput] = useState(false);

  // Initialize filter preference from localStorage or default to ID
  useEffect(() => {
    const savedFilter = localStorage.getItem(FILTER_PREFERENCE_KEY);
    const defaultFilter = filterOption.find(option => option.searchable)?.accessorKey || "";
    
    if (savedFilter && filterOption.some(option => option.accessorKey === savedFilter)) {
      setSelectedOption(savedFilter);
    } else {
      setSelectedOption(defaultFilter);
      localStorage.setItem(FILTER_PREFERENCE_KEY, defaultFilter);
    }
  }, [filterOption]);

  useEffect(() => {
    setHasInput(searchTerm.trim().length > 0);
  }, [searchTerm]);

  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
    if (newDateRange.from) {
      onDateApply({
        startDate: format(newDateRange.from, "yyyy-MM-dd"),
        endDate: newDateRange.to ? format(newDateRange.to, "yyyy-MM-dd") : format(newDateRange.from, "yyyy-MM-dd"),
      });
    }
  };

  const handleFilterChange = (value) => {
    setSelectedOption(value);
    localStorage.setItem(FILTER_PREFERENCE_KEY, value);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch({
        searchTerm: searchTerm.trim(),
        filterOption: selectedOption,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Add method to clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setDateRange({
      from: undefined,
      to: undefined,
    });
    setHasInput(false);
    if (onClearAll) {
      onClearAll();
    }
  };

  // Add effect to handle external clear all trigger
  useEffect(() => {
    if (onClearAll) {
      // Subscribe to clear all event
      window.addEventListener('clearAllFilters', clearAllFilters);
      return () => {
        window.removeEventListener('clearAllFilters', clearAllFilters);
      };
    }
  }, [onClearAll]);

  return (
    <div className="flex items-center gap-3 px-2 py-1 bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] w-full justify-end">
      {/* Date Filter */}
      <div className="flex items-center">
        <DateFilter
          onDateChange={handleDateChange}
          selectedRange={dateRange}
          className="w-full min-w-[200px]"
        />
      </div>

      {/* Search with Filter */}
      <div className="relative flex items-center w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--secondary-500)] dark:text-[var(--neutral-gray500)] pointer-events-none" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 h-7 flex items-center gap-2">
            <div className="w-px h-4 bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)]" />
            <Select
              value={selectedOption}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="h-6 px-2 text-xs border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] bg-transparent hover:bg-[var(--neutral-gray50)] dark:hover:bg-[var(--neutral-gray800)] rounded transition-colors focus:ring-0">
                <SelectValue placeholder="Filter" className="text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]" />
              </SelectTrigger>
              <SelectContent>
                {filterOption
                  .filter((filter) => filter.searchable)
                  .map((filter) => (
                    <SelectItem
                      key={filter.accessorKey}
                      value={filter.accessorKey}
                      className="text-xs"
                    >
                      {filter.header}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {hasInput && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs bg-[var(--primary-100)] border-[var(--primary-500)] text-[var(--primary-500)] hover:bg-[var(--primary-100)] dark:hover:bg-[var(--primary-900)]"
                onClick={handleSearch}
              >
                Search
              </Button>
            )}
          </div>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="w-full h-9 pl-10 pr-28 text-sm placeholder:text-[var(--neutral-gray400)] dark:placeholder:text-[var(--neutral-gray500)] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] rounded-md focus:ring-[var(--neutral-gray300)] dark:focus:ring-[var(--neutral-gray600)]"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterAndSearch;
