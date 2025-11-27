"use client"

import * as React from "react"
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  placeholder?: string
  search?: string
  onSearchChange?: (value: string) => void
  
  statusOptions?: FilterOption[]
  status?: string
  onStatusChange?: (value: string) => void
  
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  
  sortOptions?: FilterOption[]
  sort?: string
  onSortChange?: (value: string) => void

  className?: string
}

export function FilterBar({
  placeholder = "Search...",
  search,
  onSearchChange,
  statusOptions,
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  sortOptions,
  sort,
  onSortChange,
  className,
}: FilterBarProps) {
  // Helper to clear all filters
  const handleClear = () => {
    if (onStatusChange) onStatusChange("")
    if (onDateRangeChange) onDateRangeChange(undefined)
    if (onSortChange) onSortChange("newest")
    if (onSearchChange) onSearchChange("")
  }

  const hasActiveFilters = status || dateRange || (sort && sort !== "newest") || search

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            className="pl-8 w-full"
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {onStatusChange && statusOptions && (
          <Select value={status || "all"} onValueChange={(val) => onStatusChange(val === "all" ? "" : val)}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {onDateRangeChange && (
          <div className="w-auto">
            <DatePickerWithRange 
              date={dateRange} 
              setDate={onDateRangeChange} 
              className="w-auto" 
            />
          </div>
        )}

        {onSortChange && sortOptions && (
           <Select value={sort || "newest"} onValueChange={onSortChange}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
             <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClear}
            title="Reset filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

