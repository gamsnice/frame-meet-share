import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
}

export default function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);

  // Sync temp state when popover opens
  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [isOpen, startDate, endDate]);

  const presets = [
    { label: "Last 7 days", getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
    { label: "Last 30 days", getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
    { label: "This month", getValue: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
    { label: "All time", getValue: () => ({ start: undefined, end: undefined }) },
  ];

  const handleApply = () => {
    onDateChange(tempStartDate, tempEndDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`;
    }
    return "All time";
  };

  return (
    <div className="w-full sm:w-auto">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("justify-start text-left font-normal w-full sm:w-[280px]", !startDate && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{getDisplayText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto max-h-[80vh] overflow-y-auto" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="p-3 border-b sm:border-b-0 sm:border-r">
              <div className="flex flex-wrap gap-1 sm:flex-col sm:space-y-1 sm:gap-0">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => {
                      const { start, end } = preset.getValue();
                      onDateChange(start, end);
                      setIsOpen(false);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div>
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={tempStartDate}
                    onSelect={setTempStartDate}
                    disabled={(date) => date > new Date()}
                    className={cn("p-2 sm:p-3 pointer-events-auto")}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">End Date</p>
                  <Calendar
                    mode="single"
                    selected={tempEndDate}
                    onSelect={setTempEndDate}
                    disabled={(date) => date > new Date() || (tempStartDate ? date < tempStartDate : false)}
                    className={cn("p-2 sm:p-3 pointer-events-auto")}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
