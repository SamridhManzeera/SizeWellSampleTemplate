import { useEffect, useRef, useState } from 'react';
import { DayPicker } from '@daypicker/react';
import type { Modifiers } from '@daypicker/react';
import { format } from 'date-fns';
import '@daypicker/react/style.css';
import './DatePicker.scss';

interface DatePickerProps {
  value: string | null; // yyyy-MM-dd
  onChange: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`date-picker__chevron${
        open ? ' date-picker__chevron--open' : ''
      }`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function parseISO(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function formatDateLabel(date: Date): string {
  return format(date, 'EEE, d MMM yyyy');
}

function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  placeholder = 'Select a date',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(
    value ? parseISO(value) : (minDate ?? new Date())
  );
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parseISO(value) : undefined;

  useEffect(() => {
    if (open && selectedDate) setMonth(selectedDate);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleDayClick = (day: Date, modifiers: Modifiers) => {
    if (modifiers.disabled || modifiers.hidden) return;
    onChange(toISO(day));
    setOpen(false);
  };

  return (
    <div
      className={`date-picker${disabled ? ' date-picker--disabled' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="date-picker__trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <CalendarIcon />
        <span className="date-picker__trigger-text">
          {selectedDate ? formatDateLabel(selectedDate) : placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          className="date-picker__popover"
          role="dialog"
          aria-label="Select a date"
        >
          <DayPicker
            month={month}
            onMonthChange={setMonth}
            showOutsideDays
            disabled={
              minDate && maxDate
                ? [{ before: minDate }, { after: maxDate }]
                : minDate
                ? { before: minDate }
                : maxDate
                ? { after: maxDate }
                : undefined
            }
            modifiers={{
              selected: selectedDate,
            }}
            onDayClick={handleDayClick}
          />
        </div>
      )}
    </div>
  );
}

export default DatePicker;
