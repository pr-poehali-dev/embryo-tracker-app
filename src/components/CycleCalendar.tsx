import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

function getPhaseForDay(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

const PHASE_COLORS: Record<CyclePhase, { bg: string; text: string }> = {
  menstrual:  { bg: 'bg-rose-400',    text: 'text-white' },
  follicular: { bg: 'bg-orange-300',  text: 'text-white' },
  ovulation:  { bg: 'bg-emerald-400', text: 'text-white' },
  luteal:     { bg: 'bg-violet-300',  text: 'text-white' },
};

const DAYS_HEADER = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];
const MONTH_NAMES_RU = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
];
const MONTH_NAMES_GEN_RU = [
  'января','февраля','марта','апреля','мая','июня',
  'июля','августа','сентября','октября','ноября','декабря',
];

interface DayCell {
  date: Date;
  cycleDay: number;
  inMonth: boolean;
}

function buildMonthGrid(year: number, month: number, periodStart: Date, cycleLength: number): DayCell[] {
  const firstDay = new Date(year, month, 1);
  // day of week 0=Sun, adjust to Mon=0
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: DayCell[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    const diff = Math.floor((d.getTime() - periodStart.getTime()) / 86400000);
    const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    cells.push({ date: d, cycleDay, inMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const diff = Math.floor((date.getTime() - periodStart.getTime()) / 86400000);
    const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    cells.push({ date, cycleDay, inMonth: true });
  }

  // Next month padding to fill rows
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      const diff = Math.floor((date.getTime() - periodStart.getTime()) / 86400000);
      const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
      cells.push({ date, cycleDay, inMonth: false });
    }
  }

  return cells;
}

interface EditPeriodsModalProps {
  periodStart: Date;
  onSave: (newDate: Date) => void;
  onClose: () => void;
}

const EditPeriodsModal: React.FC<EditPeriodsModalProps> = ({ periodStart, onSave, onClose }) => {
  const [val, setVal] = useState(periodStart.toISOString().slice(0, 10));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-background rounded-t-3xl w-full max-w-md p-6 pb-10 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
        <h3 className="font-cormorant text-2xl font-semibold text-foreground mb-4 text-center">
          Изменить даты месячных
        </h3>
        <p className="font-golos text-sm text-muted-foreground text-center mb-5">
          Укажи первый день последних месячных
        </p>
        <input
          type="date"
          value={val}
          onChange={e => setVal(e.target.value)}
          className="w-full rounded-2xl border border-border/60 bg-card px-4 py-3 font-golos text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
        />
        <button
          onClick={() => { onSave(new Date(val)); onClose(); }}
          className="w-full bg-primary text-white rounded-full py-3.5 font-golos text-base font-semibold hover:bg-primary/90 transition-all"
        >
          Сохранить
        </button>
        <button onClick={onClose} className="w-full mt-2 py-2 font-golos text-sm text-muted-foreground">
          Отмена
        </button>
      </div>
    </div>
  );
};

interface CycleCalendarProps {
  periodStart: Date;
  cycleLength: number;
  onClose: () => void;
  onChangePeriodStart: (d: Date) => void;
}

const CycleCalendar: React.FC<CycleCalendarProps> = ({
  periodStart, cycleLength, onClose, onChangePeriodStart,
}) => {
  const today = new Date();
  const [view, setView] = useState<'month' | 'year'>('month');
  const [showEdit, setShowEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // For month view — which months to show (scroll through them)
  const currentYear = today.getFullYear();
  const monthsToShow: { year: number; month: number }[] = [];
  // Show 3 months before today and 6 after
  for (let offset = -2; offset <= 10; offset++) {
    const d = new Date(currentYear, today.getMonth() + offset, 1);
    monthsToShow.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => selectedDate ? d.toDateString() === selectedDate.toDateString() : false;

  // Year view: small month grids
  const yearMonths = Array.from({ length: 12 }, (_, i) => ({
    year: currentYear,
    month: i,
  }));

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b border-border/40">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-all">
          <Icon name="X" size={20} className="text-foreground" />
        </button>

        {/* Переключатель Месяц / Год */}
        <div className="flex bg-muted rounded-full p-0.5">
          <button
            onClick={() => setView('month')}
            className={`px-5 py-1.5 rounded-full font-golos text-sm font-medium transition-all duration-200
              ${view === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Месяц
          </button>
          <button
            onClick={() => setView('year')}
            className={`px-5 py-1.5 rounded-full font-golos text-sm font-medium transition-all duration-200
              ${view === 'year' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Год
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedDate(today);
          }}
          className="font-golos text-sm font-medium text-primary"
        >
          Сегодня
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 px-4 py-2 border-b border-border/20">
        {DAYS_HEADER.map((d, i) => (
          <div key={i} className="text-center font-golos text-xs text-muted-foreground font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar body */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {view === 'month' && (
          <div className="pb-24">
            {monthsToShow.map(({ year, month }) => {
              const cells = buildMonthGrid(year, month, periodStart, cycleLength);
              return (
                <div key={`${year}-${month}`}>
                  {/* Month title */}
                  <div className="text-center py-4">
                    <span className="font-golos text-base font-semibold text-foreground">
                      {MONTH_NAMES_RU[month]}
                      {year !== currentYear ? ` ${year}` : ''}
                    </span>
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 px-2">
                    {cells.map((cell, idx) => {
                      const phase = getPhaseForDay(cell.cycleDay);
                      const phaseColor = PHASE_COLORS[phase];
                      const todayCell = isToday(cell.date);
                      const selectedCell = isSelected(cell.date);

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(cell.date)}
                          className={`relative flex flex-col items-center justify-center aspect-square transition-all duration-150
                            ${!cell.inMonth ? 'opacity-25' : ''}
                          `}
                        >
                          {/* День цикла — маленькие цифры сверху */}
                          {cell.inMonth && (
                            <span className={`absolute top-1 left-1/2 -translate-x-1/2 font-golos text-[9px] leading-none
                              ${todayCell || selectedCell ? 'text-white/80' : 'text-muted-foreground/60'}`}
                            >
                              {cell.cycleDay}
                            </span>
                          )}

                          {/* Фазовая полоска снизу ячейки */}
                          {cell.inMonth && (
                            <div className={`absolute bottom-1 left-1 right-1 h-0.5 rounded-full opacity-50 ${phaseColor.bg}`} />
                          )}

                          {/* Круг для сегодня / выбранного */}
                          <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center mt-2
                            ${selectedCell ? `${phaseColor.bg} shadow-md` : ''}
                            ${todayCell && !selectedCell ? 'ring-2 ring-primary ring-offset-1' : ''}
                            ${!todayCell && !selectedCell ? 'hover:bg-muted' : ''}
                          `}>
                            <span className={`font-golos text-base font-medium
                              ${selectedCell ? phaseColor.text : todayCell ? 'text-primary font-bold' : cell.inMonth ? 'text-foreground' : 'text-muted-foreground'}
                            `}>
                              {cell.date.getDate()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-px bg-border/20 mx-4 mt-2" />
                </div>
              );
            })}
          </div>
        )}

        {view === 'year' && (
          <div className="pb-24 px-4 pt-3">
            <div className="text-center mb-4">
              <span className="font-golos text-base font-semibold text-foreground">{currentYear}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {yearMonths.map(({ year, month }) => {
                const cells = buildMonthGrid(year, month, periodStart, cycleLength);
                const inMonthCells = cells.filter(c => c.inMonth);
                return (
                  <div key={month} className="card-soft rounded-2xl p-3">
                    <p className="font-golos text-xs font-semibold text-foreground text-center mb-2">
                      {MONTH_NAMES_RU[month]}
                    </p>
                    <div className="grid grid-cols-7 gap-0 mb-1">
                      {DAYS_HEADER.map((d, i) => (
                        <div key={i} className="text-center font-golos text-[7px] text-muted-foreground/60">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0">
                      {cells.map((cell, idx) => {
                        const phase = getPhaseForDay(cell.cycleDay);
                        const phaseColor = PHASE_COLORS[phase];
                        const todayCell = isToday(cell.date);
                        return (
                          <div
                            key={idx}
                            onClick={() => { setSelectedDate(cell.date); setView('month'); }}
                            className={`relative flex items-center justify-center aspect-square cursor-pointer rounded-full transition-all
                              ${!cell.inMonth ? 'opacity-0 pointer-events-none' : ''}
                              ${todayCell ? 'ring-1 ring-primary' : ''}
                            `}
                          >
                            {cell.inMonth && (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center
                                ${todayCell ? phaseColor.bg : ''}
                              `}>
                                <span className={`font-golos text-[8px] font-medium
                                  ${todayCell ? 'text-white' : 'text-foreground'}
                                `}>
                                  {cell.date.getDate()}
                                </span>
                              </div>
                            )}
                            {cell.inMonth && (
                              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full opacity-50 ${phaseColor.bg}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Кнопка "Изменить даты месячных" — fixed снизу */}
      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-8">
        <button
          onClick={() => setShowEdit(true)}
          className="w-full bg-primary text-white rounded-full py-3.5 font-golos text-base font-semibold shadow-lg hover:bg-primary/90 hover:scale-[1.02] transition-all"
        >
          Изменить даты месячных
        </button>
      </div>

      {/* Легенда фаз */}
      <div className="absolute top-[130px] left-0 right-0 bg-background/0 pointer-events-none" />

      {showEdit && (
        <EditPeriodsModal
          periodStart={periodStart}
          onSave={onChangePeriodStart}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
};

export default CycleCalendar;
