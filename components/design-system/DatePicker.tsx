import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  // Date constraints
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  // Format
  format?: string;
  locale?: string;
  // Time picker
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  minuteStep?: number;
  // Range picker
  range?: boolean;
  rangeValue?: [Date | null, Date | null];
  onRangeChange?: (range: [Date | null, Date | null]) => void;
  // UI
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost';
  position?: 'bottom' | 'top' | 'auto';
  className?: string;
  // Quick selections
  showQuickSelections?: boolean;
  quickSelections?: Array<{
    label: string;
    getValue: () => Date | [Date, Date];
  }>;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  label,
  error,
  helperText,
  disabled = false,
  readOnly = false,
  clearable = true,
  minDate,
  maxDate,
  disabledDates,
  format = 'MM/dd/yyyy',
  locale = 'en-US',
  showTime = false,
  timeFormat = '12h',
  minuteStep = 5,
  range = false,
  rangeValue,
  onRangeChange,
  size = 'md',
  variant = 'default',
  position = 'auto',
  className = '',
  showQuickSelections = false,
  quickSelections,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<Date | null>(value || null);
  const [internalRangeValue, setInternalRangeValue] = useState<[Date | null, Date | null]>(
    rangeValue || [null, null]
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0 });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external value
  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (rangeValue !== undefined) setInternalRangeValue(rangeValue);
  }, [rangeValue]);

  // Date utilities
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    
    if (format === 'MM/dd/yyyy') {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
    
    return date.toLocaleDateString(locale);
  };

  const formatTime = (date: Date): string => {
    if (timeFormat === '12h') {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    if (disabledDates) {
      if (typeof disabledDates === 'function') {
        return disabledDates(date);
      }
      return disabledDates.some(d => 
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    }
    
    return false;
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameMonth = (date: Date, month: Date): boolean => {
    return date.getMonth() === month.getMonth() &&
           date.getFullYear() === month.getFullYear();
  };

  const isSelected = (date: Date): boolean => {
    if (range) {
      const [start, end] = internalRangeValue;
      if (start && end) {
        return date >= start && date <= end;
      }
      if (start) {
        return date.getTime() === start.getTime();
      }
    } else if (internalValue) {
      return date.getDate() === internalValue.getDate() &&
             date.getMonth() === internalValue.getMonth() &&
             date.getFullYear() === internalValue.getFullYear();
    }
    return false;
  };

  const isRangeStart = (date: Date): boolean => {
    if (!range) return false;
    const [start] = internalRangeValue;
    return start ? date.getTime() === start.getTime() : false;
  };

  const isRangeEnd = (date: Date): boolean => {
    if (!range) return false;
    const [, end] = internalRangeValue;
    return end ? date.getTime() === end.getTime() : false;
  };

  const isInRange = (date: Date): boolean => {
    if (!range) return false;
    const [start, end] = internalRangeValue;
    if (start && end) {
      return date > start && date < end;
    }
    if (start && hoveredDate) {
      return (date > start && date < hoveredDate) || (date < start && date > hoveredDate);
    }
    return false;
  };

  // Handlers
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (range) {
      const [start, end] = internalRangeValue;
      
      if (!start || (start && end)) {
        // Start new selection
        setInternalRangeValue([date, null]);
        onRangeChange?.([date, null]);
      } else {
        // Complete selection
        const newRange: [Date, Date] = date < start ? [date, start] : [start, date];
        setInternalRangeValue(newRange);
        onRangeChange?.(newRange);
        if (!showTime) {
          setIsOpen(false);
        }
      }
    } else {
      const newDate = new Date(date);
      if (showTime) {
        newDate.setHours(selectedTime.hours, selectedTime.minutes);
      }
      setInternalValue(newDate);
      onChange?.(newDate);
      if (!showTime) {
        setIsOpen(false);
      }
    }
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setSelectedTime({ hours, minutes });
    if (internalValue) {
      const newDate = new Date(internalValue);
      newDate.setHours(hours, minutes);
      setInternalValue(newDate);
      onChange?.(newDate);
    }
  };

  const handleClear = () => {
    if (range) {
      setInternalRangeValue([null, null]);
      onRangeChange?.([null, null]);
    } else {
      setInternalValue(null);
      onChange?.(null);
    }
    setIsOpen(false);
  };

  const handleQuickSelection = (getValue: () => Date | [Date, Date]) => {
    const value = getValue();
    if (range && Array.isArray(value)) {
      setInternalRangeValue(value as [Date, Date]);
      onRangeChange?.(value as [Date, Date]);
    } else if (!range && !Array.isArray(value)) {
      setInternalValue(value as Date);
      onChange?.(value as Date);
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  // Variant styles
  const variants = {
    default: `
      border border-gray-300 bg-white
      hover:border-gray-400
      focus:border-[#8B9F7E] focus:ring-2 focus:ring-[#8B9F7E]/20
    `,
    filled: `
      border border-transparent bg-gray-100
      hover:bg-gray-150
      focus:bg-white focus:border-[#8B9F7E] focus:ring-2 focus:ring-[#8B9F7E]/20
    `,
    ghost: `
      border-b border-gray-300 rounded-none px-0
      hover:border-gray-400
      focus:border-[#8B9F7E]
    `
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const defaultQuickSelections = [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Yesterday', getValue: () => new Date(Date.now() - 86400000) },
    { label: 'Last 7 days', getValue: () => [new Date(Date.now() - 7 * 86400000), new Date()] as [Date, Date] },
    { label: 'Last 30 days', getValue: () => [new Date(Date.now() - 30 * 86400000), new Date()] as [Date, Date] },
    { label: 'This month', getValue: () => {
      const now = new Date();
      return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)] as [Date, Date];
    }},
  ];

  const quickSelectionsToUse = quickSelections || defaultQuickSelections;

  // Display value
  const displayValue = () => {
    if (range) {
      const [start, end] = internalRangeValue;
      if (start && end) {
        return `${formatDate(start)} - ${formatDate(end)}`;
      }
      if (start) {
        return `${formatDate(start)} - ...`;
      }
      return '';
    }
    
    if (internalValue) {
      let display = formatDate(internalValue);
      if (showTime) {
        display += ` ${formatTime(internalValue)}`;
      }
      return display;
    }
    
    return '';
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        {/* Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={displayValue()}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
            className={`
              w-full rounded-lg transition-all duration-200 outline-none cursor-pointer
              ${sizes[size]}
              ${variants[variant]}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              pr-10
            `}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {clearable && displayValue() && !disabled && !readOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            <Calendar size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className={`
            absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
            ${position === 'top' ? 'bottom-full mb-1' : ''}
            ${showQuickSelections ? 'flex' : ''}
          `}>
            {/* Quick Selections */}
            {showQuickSelections && (
              <div className="border-r border-gray-200 p-2 space-y-1">
                {quickSelectionsToUse.map((selection, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSelection(selection.getValue)}
                    className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    {selection.label}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3">
              {/* Month/Year Selector */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <select
                    value={currentMonth.getMonth()}
                    onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))}
                    className="text-sm font-medium px-2 py-1 border border-gray-300 rounded"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={currentMonth.getFullYear()}
                    onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()))}
                    className="text-sm font-medium px-2 py-1 border border-gray-300 rounded"
                  >
                    {Array.from({ length: 20 }, (_, i) => currentMonth.getFullYear() - 10 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Week days */}
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                
                {/* Days */}
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const disabled = isDateDisabled(date);
                  const selected = isSelected(date);
                  const today = isToday(date);
                  const sameMonth = isSameMonth(date, currentMonth);
                  const rangeStart = isRangeStart(date);
                  const rangeEnd = isRangeEnd(date);
                  const inRange = isInRange(date);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      onMouseEnter={() => range && setHoveredDate(date)}
                      onMouseLeave={() => range && setHoveredDate(null)}
                      disabled={disabled}
                      className={`
                        p-2 text-sm rounded transition-colors
                        ${!sameMonth ? 'text-gray-400' : 'text-gray-900'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                        ${selected ? 'bg-[#8B9F7E] text-white hover:bg-[#7A8E6D]' : ''}
                        ${today && !selected ? 'font-bold text-[#8B9F7E]' : ''}
                        ${inRange ? 'bg-[#8B9F7E]/10' : ''}
                        ${rangeStart ? 'rounded-r-none' : ''}
                        ${rangeEnd ? 'rounded-l-none' : ''}
                        ${inRange && !rangeStart && !rangeEnd ? 'rounded-none' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Time Picker */}
              {showTime && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      max={timeFormat === '12h' ? 12 : 23}
                      value={selectedTime.hours}
                      onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedTime.minutes)}
                      className="w-12 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <span className="text-gray-500">:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      step={minuteStep}
                      value={String(selectedTime.minutes).padStart(2, '0')}
                      onChange={(e) => handleTimeChange(selectedTime.hours, parseInt(e.target.value))}
                      className="w-12 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    {timeFormat === '12h' && (
                      <select
                        value={selectedTime.hours >= 12 ? 'PM' : 'AM'}
                        onChange={(e) => {
                          const isPM = e.target.value === 'PM';
                          const hours = isPM ? selectedTime.hours + 12 : selectedTime.hours - 12;
                          handleTimeChange(hours, selectedTime.minutes);
                        }}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              {showTime && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-sm bg-[#8B9F7E] text-white hover:bg-[#7A8E6D] rounded transition-colors"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text / Error */}
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// Range Date Picker Component
export const RangeDatePicker: React.FC<Omit<DatePickerProps, 'range' | 'value' | 'onChange'> & {
  value?: [Date | null, Date | null];
  onChange?: (range: [Date | null, Date | null]) => void;
}> = (props) => {
  return <DatePicker {...props} range rangeValue={props.value} onRangeChange={props.onChange} />;
};

// Date Time Picker Component
export const DateTimePicker: React.FC<Omit<DatePickerProps, 'showTime'>> = (props) => {
  return <DatePicker {...props} showTime />;
};

export default DatePicker;