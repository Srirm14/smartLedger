import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { Input } from "./input"; // Assuming './input' is correct path
import { ChevronsUpDown } from "lucide-react";
import { createPortal } from "react-dom";

// Counter for unique IDs (optional, mainly for ARIA)
let instanceCounter = 0;

export const AutocompleteInput = ({
  value,
  onChange,
  options = [], // Default to empty array
  placeholder,
  disabled = false,
  required = false,
  className,
  id, // Allow passing an ID for label association
  ...props
}) => {
  // --- State ---
  const [isOpen, setIsOpen] = useState(false);
  // Internal input value state separate from the controlled 'value' prop
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Renamed for clarity
  const [selectedIndex, setSelectedIndex] = useState(-1); // Track the currently selected option
  const [searchTerm, setSearchTerm] = useState("");

  // --- Refs ---
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  // Use a stable, unique ID for ARIA attributes
  const uniqueId = useRef(id || `autocomplete-${instanceCounter++}`);
  // Ref to track if the blur was caused by clicking an option
  const ignoreBlurRef = useRef(false);

  // Add state for dropdown position
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);

  // --- Effects ---

  // Effect to update internal input value when controlled 'value' prop changes
  useEffect(() => {
    // Only update if the external value is different from the internal one
    // to avoid disrupting typing or selection process unnecessarily.
    if (value !== inputValue) {
       setInputValue(value || "");
    }
    // Intentionally limiting dependency to `value`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Effect to filter options based on input value
  useEffect(() => {
    if (!disabled) {
      const lowerInputValue = inputValue?.toLowerCase() || "";
      let filtered = [];

      if (lowerInputValue) {
        // When user types, filter based on input
        filtered = options.filter(option =>
          option.text?.toLowerCase().includes(lowerInputValue)
        );
      } else {
        // When no input, show first 5 options
        filtered = options.slice(0, 5);
      }

      setFilteredOptions(filtered);
      setHighlightedIndex(-1);

      // Only close if there are no matches during typing
      if (filtered.length === 0 && lowerInputValue) {
        setIsOpen(false);
      }
    } else {
      setFilteredOptions([]);
      setIsOpen(false);
    }
  }, [inputValue, options, disabled]);

  // Effect for handling clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close if the click is outside the input and the dropdown
      if (
        inputRef.current && !inputRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
         // And also ensure it wasn't the trigger button if you had one
        setIsOpen(false);
      }
    };

    // Use mousedown event to potentially catch before blur
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Update dropdown position when input dimensions change or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current && isOpen) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // --- Event Handlers ---

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (!isOpen) {
      setIsOpen(true);
    }

    const lowerInputValue = newValue.toLowerCase();
    let filtered = [];
    
    if (newValue) {
      filtered = options.filter(option =>
        option.text?.toLowerCase().includes(lowerInputValue)
      );
    } else {
      // Show first 5 options when input is cleared
      filtered = options.slice(0, 5);
    }

    if (filtered.length > 0) {
      setFilteredOptions(filtered);
      setHighlightedIndex(0);
    }
  };

  const handleSelectOption = useCallback((optionValue) => {
    if (optionValue !== undefined && optionValue !== null) {
      setInputValue(optionValue); // Update internal input display
      onChange(optionValue);     // Update parent component state
      setIsOpen(false);          // Close dropdown
      setHighlightedIndex(-1);   // Reset highlight
      setSelectedIndex(-1);      // Reset selected index
      inputRef.current?.focus(); // Keep focus on the input after selection
    }
  }, [onChange]); // Dependency: onChange function from props

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        if (isOpen && filteredOptions.length > 0) {
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          setSelectedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        } else if (!isOpen && inputValue && filteredOptions.length > 0) {
          e.preventDefault();
          setIsOpen(true);
          setHighlightedIndex(0);
          setSelectedIndex(0);
        }
        break;

      case "ArrowUp":
        if (isOpen && filteredOptions.length > 0) {
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;

      case "Enter":
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          e.preventDefault();
          handleSelectOption(filteredOptions[highlightedIndex].value);
        } else if (isOpen) {
          setIsOpen(false);
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;

      case "Tab":
        if (isOpen && filteredOptions.length > 0) {
          e.preventDefault();
          // For tab completion - only use options that start with the input
          const startsWithOptions = filteredOptions.filter(option =>
            option.text?.toLowerCase().startsWith(inputValue.toLowerCase())
          );
          
          if (startsWithOptions.length > 0) {
            // If something is highlighted, use it if it starts with input
            if (highlightedIndex >= 0 && 
                filteredOptions[highlightedIndex].text.toLowerCase().startsWith(inputValue.toLowerCase())) {
              handleSelectOption(filteredOptions[highlightedIndex].value);
            } else {
              // Otherwise use the first option that starts with input
              handleSelectOption(startsWithOptions[0].value);
            }
          }
          // Keep focus in the same field
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }
        break;

      default:
        break;
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      if (inputValue) {
        const lowerInputValue = inputValue.toLowerCase();
        const filtered = options.filter(option =>
          option.text?.toLowerCase().includes(lowerInputValue)
        );
        if (filtered.length > 0) {
          setFilteredOptions(filtered);
          setIsOpen(true);
          setSelectedIndex(0);
        }
      } else {
        // Show first 5 options on focus when input is empty
        const initialOptions = options.slice(0, 5);
        if (initialOptions.length > 0) {
          setFilteredOptions(initialOptions);
          setIsOpen(true);
          setSelectedIndex(0);
        }
      }
    }
  };

  const handleBlur = (e) => {
    if (ignoreBlurRef.current) {
      ignoreBlurRef.current = false; // Reset flag and do nothing
      return;
    }

    // Use a small timeout to allow click events on options to register first
    setTimeout(() => {
      // Check if focus has moved *outside* the component (input and dropdown)
      if (
        document.activeElement !== inputRef.current &&
        !dropdownRef.current?.contains(document.activeElement)
      ) {
        setIsOpen(false);
        // Optional: Validate if the current inputValue matches a valid option value
        const isValid = options.some(opt => opt.value === inputValue);
        if (!isValid && inputValue !== "") {
          setInputValue("");
          onChange(""); // Also clear parent state
        }
      }
    }, 150);
  };

  // Add new handler for mouse interactions
  const handleOptionMouseDown = (e, optionValue) => {
    e.preventDefault(); // Prevent blur before click
    ignoreBlurRef.current = true; // Set flag to ignore the next blur event
    handleSelectOption(optionValue);
  };

   // --- Scroll highlighted item into view ---
   useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && dropdownRef.current) {
      const listElement = dropdownRef.current;
      const optionElement = listElement.children[highlightedIndex]; // Assuming direct children are options
      if (optionElement) {
        optionElement.scrollIntoView({
          behavior: 'smooth', // Optional: nice scrolling
          block: 'nearest',   // Adjusts minimal scrolling needed
        });
      }
    }
  }, [highlightedIndex, isOpen]); // Rerun when index or open state changes


  // --- Render ---
  const listboxId = `${uniqueId.current}-listbox`;
  const getOptionId = (index) => `${uniqueId.current}-option-${index}`;

  return (
    <div ref={containerRef} className="relative w-full" role="combobox" aria-haspopup="listbox" aria-expanded={isOpen}>
      <Input
        ref={inputRef}
        id={uniqueId.current}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn("w-full", className)}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined}
        {...props}
      />
      <ChevronsUpDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]" />

      {/* Render dropdown in a portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[99999] rounded-md shadow-lg max-h-60 overflow-auto bg-[var(--neutral-white)] border border-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray900)] dark:border-[var(--neutral-gray700)]"
          role="listbox"
          id={listboxId}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            pointerEvents: 'auto' // Ensure pointer events work
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value || index}
                id={getOptionId(index)}
                role="option"
                aria-selected={highlightedIndex === index}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer flex items-center justify-between text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]",
                  "focus:outline-none",
                  highlightedIndex === index
                    ? "bg-[var(--primary-100)] text-[var(--primary-600)] dark:bg-[var(--primary-900)] dark:text-[var(--primary-200)]"
                    : "hover:bg-[var(--neutral-gray50)] hover:text-[var(--neutral-gray900)] dark:hover:bg-[var(--neutral-gray800)] dark:hover:text-[var(--neutral-gray50)]"
                )}
                onMouseDown={(e) => handleOptionMouseDown(e, option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span>{option.text}</span>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">No results found.</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

AutocompleteInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })
  ), // Make options optional, default handled
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string, // Allow passing ID
};