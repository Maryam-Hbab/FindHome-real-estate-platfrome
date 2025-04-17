"use client"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface ScheduleTourFormProps {
  propertyId: string
  agentId: string
  onSchedule: (date: string, time: string) => void
}

export function ScheduleTourForm({ propertyId, agentId, onSchedule }: ScheduleTourFormProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [customTime, setCustomTime] = useState<string>("")
  const { toast } = useToast()

  // Generate time options in 30-minute intervals
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 8; hour <= 18; hour++) {
      for (const minute of [0, 30]) {
        const hourFormatted = hour.toString().padStart(2, "0")
        const minuteFormatted = minute.toString().padStart(2, "0")
        const value = `${hourFormatted}:${minuteFormatted}`

        // Format for display (12-hour format)
        let displayHour = hour % 12
        if (displayHour === 0) displayHour = 12
        const period = hour < 12 ? "AM" : "PM"
        const label = `${displayHour}:${minuteFormatted} ${period}`

        options.push({ value, label })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const handleSubmit = () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      })
      return
    }

    const selectedTime = time === "custom" ? customTime : time

    if (!selectedTime) {
      toast({
        title: "Error",
        description: "Please select or enter a time",
        variant: "destructive",
      })
      return
    }

    // Format date as YYYY-MM-DD using native JavaScript
    const formattedDate = date.toISOString().split("T")[0]

    onSchedule(formattedDate, selectedTime)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Calendar className="h-5 w-5 text-emerald-600 mr-2" />
        <h2 className="text-xl font-semibold">Schedule a Tour</h2>
      </div>

      <div className="space-y-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? (
                  date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Time</label>
          <Select
            value={time}
            onValueChange={(value) => {
              setTime(value)
              if (value !== "custom") {
                setCustomTime("")
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Time Input */}
        {time === "custom" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter Custom Time</label>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <Input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        onClick={handleSubmit}
        disabled={!date || !time || (time === "custom" && !customTime)}
      >
        Schedule Tour
      </Button>
    </div>
  )
}
