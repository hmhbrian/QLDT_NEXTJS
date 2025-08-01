"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, ChevronDown, RefreshCw } from "lucide-react";

export type FilterType = "all" | "year" | "quarter" | "month";

interface ReportFilterProps {
  filterType: FilterType;
  selectedYear: number;
  selectedQuarter: number;
  selectedMonth: number;
  onFilterChange: (filterType: FilterType) => void;
  onYearChange: (year: number) => void;
  onQuarterChange: (quarter: number) => void;
  onMonthChange: (month: number) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  hasActiveFilter: boolean;
}

export function ReportFilter({
  filterType,
  selectedYear,
  selectedQuarter,
  selectedMonth,
  onFilterChange,
  onYearChange,
  onQuarterChange,
  onMonthChange,
  onApplyFilters,
  onResetFilters,
  hasActiveFilter,
}: ReportFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getFilterDisplayLabel = () => {
    switch (filterType) {
      case "month":
        return `Tháng ${selectedMonth}/${selectedYear}`;
      case "quarter":
        return `Quý ${selectedQuarter}/${selectedYear}`;
      case "year":
        return `Năm ${selectedYear}`;
      default:
        return "Toàn bộ thời gian";
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center gap-3">
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-orange-500" />
              <span className="font-medium">{getFilterDisplayLabel()}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xl"
          align="end"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-500" />
                Lọc theo thời gian
              </h4>
              <RadioGroup
                value={filterType}
                onValueChange={onFilterChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label
                    htmlFor="all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Toàn bộ thời gian
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="year" id="year" />
                  <Label
                    htmlFor="year"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Theo năm
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarter" id="quarter" />
                  <Label
                    htmlFor="quarter"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Theo quý
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="month" />
                  <Label
                    htmlFor="month"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Theo tháng
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {filterType !== "all" && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Năm
                  </Label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => onYearChange(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filterType === "quarter" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Quý
                    </Label>
                    <Select
                      value={selectedQuarter.toString()}
                      onValueChange={(value) =>
                        onQuarterChange(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((quarter) => (
                          <SelectItem key={quarter} value={quarter.toString()}>
                            Quý {quarter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filterType === "month" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Tháng
                    </Label>
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(value) => onMonthChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Tháng {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={() => {
                    onApplyFilters();
                    setIsFilterOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                >
                  Áp dụng bộ lọc
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilter && (
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Đặt lại</span>
        </Button>
      )}
    </div>
  );
}
