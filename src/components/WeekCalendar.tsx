import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

interface WeekCalendarProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
  startDate: Date;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getWeekDates(startDate: Date, weekOffset: number): Date[] {
  const result: Date[] = [];
  const base = new Date(startDate);
  base.setDate(base.getDate() + weekOffset * 7);
  // Найдём понедельник
  const dayOfWeek = base.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  base.setDate(base.getDate() + diff);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    result.push(d);
  }
  return result;
}

function getPregnancyWeek(startDate: Date, date: Date): number {
  const diff = date.getTime() - startDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(days / 7) + 1);
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ currentWeek, onWeekChange, startDate }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null);

  const weekDates = getWeekDates(new Date(), weekOffset);
  const today = new Date();

  const goNext = () => {
    setAnimDir('right');
    setTimeout(() => setAnimDir(null), 400);
    setWeekOffset(prev => prev + 1);
  };

  const goPrev = () => {
    setAnimDir('left');
    setTimeout(() => setAnimDir(null), 400);
    setWeekOffset(prev => prev - 1);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const week = getPregnancyWeek(startDate, date);
    if (week >= 1 && week <= 40) {
      onWeekChange(week);
    }
  };

  const formatMonth = (dates: Date[]) => {
    const months = [...new Set(dates.map(d => d.toLocaleDateString('ru', { month: 'long' })))];
    return months.join(' / ');
  };

  const formatYear = (date: Date) => date.getFullYear();

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();
  const isFuture = (date: Date) => date > today;

  return (
    <div className="card-soft rounded-3xl p-5 w-full">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goPrev}
          className="w-9 h-9 rounded-full bg-blush hover:bg-primary/20 flex items-center justify-center transition-all hover:scale-110"
        >
          <Icon name="ChevronLeft" size={18} className="text-primary" />
        </button>

        <div className="text-center">
          <p className="font-cormorant text-xl font-medium capitalize text-foreground">
            {formatMonth(weekDates)}
          </p>
          <p className="font-golos text-xs text-muted-foreground">{formatYear(weekDates[0])}</p>
        </div>

        <button
          onClick={goNext}
          className="w-9 h-9 rounded-full bg-blush hover:bg-primary/20 flex items-center justify-center transition-all hover:scale-110"
        >
          <Icon name="ChevronRight" size={18} className="text-primary" />
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center">
            <span className="font-golos text-xs text-muted-foreground font-medium">{day}</span>
          </div>
        ))}
      </div>

      {/* Даты */}
      <div
        className="grid grid-cols-7 gap-1"
        style={{
          opacity: animDir ? 0 : 1,
          transform: animDir === 'right' ? 'translateX(-10px)' : animDir === 'left' ? 'translateX(10px)' : 'translateX(0)',
          transition: 'all 0.3s ease',
        }}
      >
        {weekDates.map((date, i) => {
          const pregWeek = getPregnancyWeek(startDate, date);
          const isCurrentWeek = pregWeek === currentWeek;

          return (
            <button
              key={i}
              onClick={() => handleDayClick(date)}
              className={`
                relative flex flex-col items-center justify-center rounded-2xl py-2 px-1
                transition-all duration-200 hover:scale-105
                ${isSelected(date)
                  ? 'bg-primary text-white shadow-md'
                  : isToday(date)
                  ? 'bg-peach text-foreground'
                  : isCurrentWeek
                  ? 'bg-blush/60 text-foreground'
                  : 'hover:bg-muted text-foreground/70'}
                ${isFuture(date) ? 'opacity-50' : ''}
              `}
            >
              <span className={`font-golos text-sm font-medium leading-none ${isSelected(date) ? 'text-white' : ''}`}>
                {date.getDate()}
              </span>
              {isToday(date) && !isSelected(date) && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
              {isCurrentWeek && !isSelected(date) && (
                <span className="font-golos text-[9px] text-primary/70 mt-0.5">{pregWeek}н</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Подпись недели */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-heartbeat" />
          <span className="font-golos text-sm text-muted-foreground">
            Неделя <span className="text-primary font-semibold">{currentWeek}</span> из 40
          </span>
        </div>
        <span className="font-cormorant text-sm italic text-muted-foreground">
          {selectedDate.toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
};

export default WeekCalendar;
