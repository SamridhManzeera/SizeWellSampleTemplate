import { useEffect, useRef, useState } from 'react';
import { DayPicker, rangeIncludesDate } from '@daypicker/react';
import type { DateRange, Modifiers } from '@daypicker/react';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import '@daypicker/react/style.css';
import './WeekPicker.scss';

export interface WeekRange {
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
}

interface WeekPickerProps {
  value: WeekRange | null;
  onChange: (week: WeekRange) => void;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
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
      className={`week-picker__chevron${
        open ? ' week-picker__chevron--open' : ''
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

function formatWeekLabel(from: Date, to: Date): string {
  return `${format(from, 'd MMM')} – ${format(to, 'd MMM yyyy')}`;
}

function WeekPicker({
  value,
  onChange,
  weekStartsOn = 1,
  minDate,
  maxDate,
  disabled = false,
  placeholder = 'Select a week',
}: WeekPickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(
    value ? parseISO(value.startDate) : new Date()
  );
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedWeek: DateRange | undefined = value
    ? { from: parseISO(value.startDate), to: parseISO(value.endDate) }
    : undefined;

  useEffect(() => {
    if (open && selectedWeek?.from) setMonth(selectedWeek.from);
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

  const isInSelectedWeek = (date: Date) =>
    selectedWeek ? rangeIncludesDate(selectedWeek, date, true) : false;

  const handleDayClick = (day: Date, modifiers: Modifiers) => {
    if (modifiers.disabled || modifiers.hidden) return;
    const week: DateRange = {
      from: startOfWeek(day, { weekStartsOn }),
      to: endOfWeek(day, { weekStartsOn }),
    };
    onChange({
      startDate: toISO(week.from as Date),
      endDate: toISO(week.to as Date),
    });
    setOpen(false);
  };

  return (
    <div
      className={`week-picker${disabled ? ' week-picker--disabled' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="week-picker__trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <CalendarIcon />
        <span className="week-picker__trigger-text">
          {selectedWeek?.from && selectedWeek.to
            ? formatWeekLabel(selectedWeek.from, selectedWeek.to)
            : placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          className="week-picker__popover"
          role="dialog"
          aria-label="Select a week"
        >
          <DayPicker
            month={month}
            onMonthChange={setMonth}
            showOutsideDays
            weekStartsOn={weekStartsOn}
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
              selected: selectedWeek,
              range_start: selectedWeek?.from,
              range_end: selectedWeek?.to,
              range_middle: isInSelectedWeek,
            }}
            onDayClick={handleDayClick}
          />
        </div>
      )}
    </div>
  );
}

export default WeekPicker;
