// DateRangePicker component (placeholder - using existing date picker from shadcn)
import { useState } from "react";
import { Calendar } from "@/Components/ui/calendar";
import { Button } from "@/Components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import dayjs from "dayjs";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    return date ? dayjs(date).format("DD MMM YYYY") : "Select";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon size={16} />
          {formatDate(startDate)} - {formatDate(endDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: startDate || undefined,
            to: endDate || undefined,
          }}
          onSelect={(range) => {
            onChange({
              startDate: range?.from || null,
              endDate: range?.to || null,
            });
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
