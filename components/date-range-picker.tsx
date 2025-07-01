"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onDateChange: (startDate: Date, endDate: Date) => void
}

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleMonthChange = (value: string) => {
    if (value === "all") {
      const newStartDate = subMonths(new Date(), 60)
      const newEndDate = new Date()
      onDateChange(newStartDate, newEndDate)
    } else if (value === "custom") {
      setIsOpen(true)
    } else {
      const [year, month] = value.split("-").map(Number)
      const newStartDate = startOfMonth(new Date(year, month - 1))
      const newEndDate = endOfMonth(new Date(year, month - 1))
      onDateChange(newStartDate, newEndDate)
    }
  }

  const handlePrevMonth = () => {
    const newStartDate = startOfMonth(subMonths(startDate, 1))
    const newEndDate = endOfMonth(subMonths(endDate, 1))
    onDateChange(newStartDate, newEndDate)
  }

  const handleNextMonth = () => {
    const newStartDate = startOfMonth(addMonths(startDate, 1))
    const newEndDate = endOfMonth(addMonths(endDate, 1))
    onDateChange(newStartDate, newEndDate)
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return {
      value: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: format(date, "MMM yyyy"),
    }
  })

  const isFullMonth =
    startDate.getDate() === 1 &&
    endDate.getDate() === new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()

  const currentMonthValue = isFullMonth ? `${startDate.getFullYear()}-${startDate.getMonth() + 1}` : "custom"

  return (
    <div className="w-full space-y-2">
      {/* Month Navigation */}
      <div className="flex items-center justify-between gap-1">
        <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-7 w-7 p-0 bg-transparent">
          <ChevronLeft className="h-3 w-3" />
          <span className="sr-only">Previous month</span>
        </Button>

        <Select value={currentMonthValue} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="h-7 w-7 p-0 bg-transparent"
          disabled={
            startDate.getMonth() === new Date().getMonth() && startDate.getFullYear() === new Date().getFullYear()
          }
        >
          <ChevronRight className="h-3 w-3" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>

      {/* Custom Date Range Picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-7 text-xs",
              !startDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {startDate && endDate ? (
              <span className="truncate">
                {format(startDate, "MMM dd")} - {format(endDate, "MMM dd, yy")}
              </span>
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={startDate}
            selected={{
              from: startDate,
              to: endDate,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateChange(range.from, range.to)
                setIsOpen(false)
              }
            }}
            numberOfMonths={1}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
