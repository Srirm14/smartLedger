"use client"

import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"


export function BankAutocompleteWithInput({
  banks,
  onSelect,
  placeholder = "Search for a bank...",
  allowCustomValue = true,
}) {
  const [inputValue, setInputValue] = useState("")
  const [filteredBanks, setFilteredBanks] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (inputValue) {
      const filtered = banks
        .filter((bank) => bank.toLowerCase().includes(inputValue.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
      setFilteredBanks(filtered)
      setIsOpen(filtered.length > 0)
      setSelectedIndex(-1)
    } else {
      setFilteredBanks([])
      setIsOpen(false)
    }
  }, [inputValue, banks])

  const handleSelect = (bank) => {
    setInputValue(bank)
    setIsOpen(false)
    if (onSelect) {
      onSelect(bank)
    }
    // Focus back on input after selection
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen && e.key === "ArrowDown" && inputValue) {
      e.preventDefault()
      setIsOpen(true)
      return
    }
    
    if (!isOpen) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filteredBanks.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(filteredBanks[selectedIndex])
    } else if (e.key === "Escape") {
      e.preventDefault()
      setIsOpen(false)
    } else if (e.key === "Tab") {
      // Auto-complete with first matching option on Tab
      if (filteredBanks.length > 0) {
        e.preventDefault()
        handleSelect(filteredBanks[0])
      }
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)

    // Always show dropdown if there's any input
    if (value) {
      setIsOpen(true)
    }

    // If user types a single letter, find banks starting with that letter
    if (value.length === 1) {
      const matchingBanks = banks
        .filter((bank) => bank.toLowerCase().startsWith(value.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))

      setFilteredBanks(matchingBanks)
      if (matchingBanks.length > 0) {
        setSelectedIndex(0)
      }
    }

    // If custom values are allowed, trigger onSelect with the current value
    if (allowCustomValue && onSelect) {
      onSelect(value)
    }
  }

  useEffect(() => {
    // Scroll selected item into view
    if (selectedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[role="option"]')
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({
          block: "nearest",
        })
      }
    }
  }, [selectedIndex])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle window resize to reposition dropdown
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize to ensure proper positioning
      if (isOpen) {
        setIsOpen(false)
        setTimeout(() => {
          if (inputValue) {
            setIsOpen(true)
          }
        }, 50)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, inputValue])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Search className="h-4 w-4" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 mt-1 transition-all duration-200 focus:ring-2 focus:ring-offset-1 focus:ring-primary/30"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? "bank-autocomplete-list" : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `bank-option-${selectedIndex}` : undefined}
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-slate-100"
            onClick={() => {
              setInputValue("")
              inputRef.current?.focus()
            }}
            tabIndex={-1}
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && filteredBanks.length > 0 && (
        <div
          ref={dropdownRef}
          id="bank-autocomplete-list"
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto overflow-x-hidden rounded-md border border-slate-200 bg-white shadow-xl"
          style={{ top: "calc(100% + 4px)", left: 0 }}
          role="listbox"
        >
          <div className="p-1">
            {filteredBanks.map((bank, index) => (
              <div
                key={bank}
                id={`bank-option-${index}`}
                role="option"
                aria-selected={selectedIndex === index}
                className={`
                  flex items-center cursor-pointer px-3 py-2 text-sm rounded-md
                  ${selectedIndex === index 
                    ? "bg-primary text-primary-foreground" 
                    : "text-slate-700 hover:bg-slate-100"}
                  transition-colors duration-150 ease-in-out
                `}
                onClick={() => handleSelect(bank)}
              >
                {bank}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && filteredBanks.length === 0 && inputValue && (
        <div 
          className="absolute z-50 w-full mt-1 p-3 rounded-md border border-slate-200 bg-white shadow-xl text-center text-sm text-gray-500"
          style={{ top: "calc(100% + 4px)", left: 0 }}
        >
          {allowCustomValue ? (
            <div>
              <p>No matching banks found</p>
              <p className="text-xs mt-1">You can enter a custom bank name</p>
            </div>
          ) : (
            <p>No banks found matching "{inputValue}"</p>
          )}
        </div>
      )}
    </div>
  )
} 