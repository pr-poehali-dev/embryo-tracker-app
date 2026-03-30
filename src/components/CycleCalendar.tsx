import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import { detectLang, translations } from '@/i18n';

const lang = detectLang();
const t = translations[lang];

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
type CalView = 'month' | 'week' | 'year';

function getPhaseForDay(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

const PHASE_COLORS: Record<CyclePhase, { bg: string; text: string; dot: string; stripe: string }> = {
  menstrual:  { bg: 'bg-rose-400',    text: 'text-white', dot: 'bg-rose-400',    stripe: 'bg-rose-300/60' },
  follicular: { bg: 'bg-orange-300',  text: 'text-white', dot: 'bg-orange-300',  stripe: 'bg-orange-200/60' },
  ovulation:  { bg: 'bg-emerald-400', text: 'text-white', dot: 'bg-emerald-400', stripe: 'bg-emerald-200/60' },
  luteal:     { bg: 'bg-violet-300',  text: 'text-white', dot: 'bg-violet-300',  stripe: 'bg-violet-200/60' },
};

function buildMonthGrid(year: number, month: number, periodStart: Date, cycleLength: number) {
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; cycleDay: number }[] = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    const diff = Math.floor((d.getTime() - periodStart.getTime()) / 86400000);
    const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    cells.push({ date: d, cycleDay });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const diff = Math.floor((date.getTime() - periodStart.getTime()) / 86400000);
    const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    cells.push({ date, cycleDay });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      const diff = Math.floor((date.getTime() - periodStart.getTime()) / 86400000);
      const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
      cells.push({ date, cycleDay });
    }
  }
  return cells;
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}

function buildWeekDates(monday: Date, periodStart: Date, cycleLength: number) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const diff = Math.floor((d.getTime() - periodStart.getTime()) / 86400000);
    const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    return { date: d, cycleDay };
  });
}

// --- Модалка редактирования дат ---
interface EditModalProps {
  periodStart: Date;
  onSave: (d: Date) => void;
  onClose: () => void;
}
const EditModal: React.FC<EditModalProps> = ({ periodStart, onSave, onClose }) => {
  const [val, setVal] = useState(periodStart.toISOString().slice(0, 10));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-background rounded-t-3xl w-full max-w-md p-6 pb-10 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
        <h3 className="font-cormorant text-2xl font-semibold text-foreground mb-4 text-center">{t.editPeriodDates}</h3>
        <p className="font-golos text-sm text-muted-foreground text-center mb-5">{t.lastPeriodDate}</p>
        <input type="date" value={val} onChange={e => setVal(e.target.value)}
          className="w-full rounded-2xl border border-border/60 bg-card px-4 py-3 font-golos text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4" />
        <button onClick={() => { onSave(new Date(val)); onClose(); }}
          className="w-full bg-primary text-white rounded-full py-3.5 font-golos text-base font-semibold hover:bg-primary/90 transition-all">
          {t.save}
        </button>
        <button onClick={onClose} className="w-full mt-2 py-2 font-golos text-sm text-muted-foreground">{t.cancel}</button>
      </div>
    </div>
  );
};

// --- Основной компонент ---
interface CycleCalendarProps {
  periodStart: Date;
  cycleLength: number;
  onClose: () => void;
  onChangePeriodStart: (d: Date) => void;
}

const CycleCalendar: React.FC<CycleCalendarProps> = ({ periodStart, cycleLength, onClose, onChangePeriodStart }) => {
  const today = new Date();
  const [view, setView] = useState<CalView>('month');
  const [showEdit, setShowEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Навигация по неделям
  const [weekBase, setWeekBase] = useState<Date>(getMondayOf(today));

  // Для года
  const [navYear, setNavYear] = useState(today.getFullYear());

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => d.toDateString() === selectedDate.toDateString();

  // Прокручиваемый список месяцев
  const monthsToShow: { year: number; month: number }[] = [];
  for (let offset = -3; offset <= 9; offset++) {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    monthsToShow.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const selectedCycleDay = (() => {
    const diff = Math.floor((selectedDate.getTime() - periodStart.getTime()) / 86400000);
    return ((diff % cycleLength) + cycleLength) % cycleLength + 1;
  })();
  const selectedPhase = getPhaseForDay(selectedCycleDay);

  const renderDayCell = (date: Date, cycleDay: number, inCurrentMonth: boolean) => {
    const phase = getPhaseForDay(cycleDay);
    const colors = PHASE_COLORS[phase];
    const todayCell = isToday(date);
    const selectedCell = isSelected(date);
    const isMenstrual = cycleDay <= 5;

    return (
      <button
        key={date.toDateString()}
        onClick={() => setSelectedDate(date)}
        className={`relative flex flex-col items-center justify-center aspect-square transition-all duration-150
          ${!inCurrentMonth ? 'opacity-20' : ''}
          ${inCurrentMonth && isMenstrual ? colors.stripe + ' rounded-sm' : ''}
        `}
      >
        {/* День цикла — маленькие цифры сверху */}
        {inCurrentMonth && (
          <span className={`absolute top-0.5 left-1/2 -translate-x-1/2 font-golos text-[9px] leading-none
            ${selectedCell ? 'text-white/80' : 'text-muted-foreground/60'}`}>
            {cycleDay}
          </span>
        )}
        {/* Полоска фазы снизу */}
        {inCurrentMonth && (
          <div className={`absolute bottom-0.5 left-1 right-1 h-0.5 rounded-full opacity-50 ${colors.dot}`} />
        )}
        <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center mt-1.5
          ${selectedCell ? `${colors.bg} shadow-md` : ''}
          ${todayCell && !selectedCell ? 'ring-2 ring-primary ring-offset-1' : ''}
          ${!todayCell && !selectedCell ? 'hover:bg-muted' : ''}
        `}>
          <span className={`font-golos text-sm font-medium
            ${selectedCell ? colors.text : todayCell ? 'text-primary font-bold' : inCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
          `}>{date.getDate()}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col max-w-md mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-3 border-b border-border/40">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-all">
          <Icon name="X" size={20} className="text-foreground" />
        </button>
        <div className="flex bg-muted rounded-full p-0.5 gap-0.5">
          {(['month', 'week', 'year'] as CalView[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full font-golos text-xs font-medium transition-all duration-200
                ${view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {v === 'month' ? t.month : v === 'week' ? t.week : t.year}
            </button>
          ))}
        </div>
        <button onClick={() => { setSelectedDate(today); setWeekBase(getMondayOf(today)); }}
          className="font-golos text-sm font-medium text-primary">{t.today}</button>
      </div>

      {/* Дни недели шапка */}
      {view !== 'year' && (
        <div className="grid grid-cols-7 px-3 py-2 border-b border-border/20">
          {t.daysHeader.map((d, i) => (
            <div key={i} className="text-center font-golos text-xs text-muted-foreground font-medium">{d}</div>
          ))}
        </div>
      )}

      {/* Инфо о выбранном дне */}
      <div className={`px-4 py-2 border-b border-border/20 ${PHASE_COLORS[selectedPhase].stripe}`}>
        <p className="font-golos text-xs text-center font-medium text-foreground/80">
          {selectedDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' })}
          {' — '}{t.cycleDay} {selectedCycleDay}
          {' · '}{t.phaseNames[selectedPhase]}
        </p>
      </div>

      {/* Тело */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {/* ===== МЕСЯЦ (прокрутка) ===== */}
        {view === 'month' && (
          <div className="pb-28">
            {monthsToShow.map(({ year, month }) => {
              const cells = buildMonthGrid(year, month, periodStart, cycleLength);
              return (
                <div key={`${year}-${month}`}>
                  <div className="text-center py-4">
                    <span className="font-golos text-base font-semibold text-foreground">
                      {t.monthNames[month]}{year !== today.getFullYear() ? ` ${year}` : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 px-2">
                    {cells.map(({ date, cycleDay }) =>
                      renderDayCell(date, cycleDay, date.getMonth() === month)
                    )}
                  </div>
                  <div className="h-px bg-border/20 mx-4 mt-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* ===== НЕДЕЛЯ ===== */}
        {view === 'week' && (
          <div className="pb-28">
            {/* Навигация по неделям */}
            <div className="flex items-center justify-between px-5 py-3">
              <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); }}
                className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center">
                <Icon name="ChevronLeft" size={18} className="text-foreground" />
              </button>
              <span className="font-golos text-sm font-semibold text-foreground">
                {weekBase.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' })}
                {' – '}
                {(() => { const e = new Date(weekBase); e.setDate(weekBase.getDate() + 6); return e.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' }); })()}
              </span>
              <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); }}
                className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center">
                <Icon name="ChevronRight" size={18} className="text-foreground" />
              </button>
            </div>

            {/* Большие ячейки */}
            <div className="grid grid-cols-7 px-2 mb-4">
              {buildWeekDates(weekBase, periodStart, cycleLength).map(({ date, cycleDay }) => {
                const phase = getPhaseForDay(cycleDay);
                const colors = PHASE_COLORS[phase];
                const todayCell = isToday(date);
                const selectedCell = isSelected(date);
                const isMenstrual = cycleDay <= 5;
                return (
                  <button
                    key={date.toDateString()}
                    onClick={() => setSelectedDate(date)}
                    className={`relative flex flex-col items-center py-2 rounded-2xl transition-all
                      ${isMenstrual ? colors.stripe : 'hover:bg-muted'}
                    `}
                  >
                    {/* День цикла */}
                    <span className={`font-golos text-[9px] leading-none mb-1 font-semibold
                      ${selectedCell ? 'text-primary' : 'text-muted-foreground/60'}`}>
                      {cycleDay}
                    </span>

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${selectedCell ? `${colors.bg} shadow-md` : ''}
                      ${todayCell && !selectedCell ? 'ring-2 ring-primary ring-offset-1' : ''}
                    `}>
                      <span className={`font-golos text-base font-semibold
                        ${selectedCell ? colors.text : todayCell ? 'text-primary' : 'text-foreground'}`}>
                        {date.getDate()}
                      </span>
                    </div>

                    <span className="font-golos text-[9px] text-muted-foreground mt-1">
                      {t.monthNames[date.getMonth()].slice(0, 3)}
                    </span>

                    {/* Цветная полоска фазы */}
                    <div className={`mt-1 w-8 h-1.5 rounded-full opacity-70 ${colors.dot}`} />
                  </button>
                );
              })}
            </div>

            {/* Детали выбранного дня */}
            <div className="mx-4 card-soft rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-2xl ${PHASE_COLORS[selectedPhase].bg} flex items-center justify-center`}>
                  <span className="font-cormorant text-2xl font-bold text-white">{selectedCycleDay}</span>
                </div>
                <div>
                  <p className="font-cormorant text-xl font-semibold text-foreground">
                    {t.phaseNames[selectedPhase]}
                  </p>
                  <p className="font-golos text-sm text-muted-foreground">
                    {t.cycleDay} {selectedCycleDay} {lang === 'ru' ? 'из' : 'of'} {cycleLength}
                  </p>
                </div>
              </div>
              <p className="font-golos text-sm text-foreground/70 mb-2">{t.phaseDescriptions[selectedPhase]}</p>
              <div className="flex items-start gap-2 bg-muted/50 rounded-xl p-2.5">
                <Icon name="Star" size={14} className={`${PHASE_COLORS[selectedPhase].dot.replace('bg-', 'text-')} mt-0.5`} fallback="Star" />
                <p className="font-golos text-xs text-foreground/70">{t.phaseTips[selectedPhase]}</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== ГОД ===== */}
        {view === 'year' && (
          <div className="pb-28 px-4 pt-3">
            <div className="flex items-center justify-between mb-4 px-1">
              <button onClick={() => setNavYear(y => y - 1)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <Icon name="ChevronLeft" size={16} className="text-foreground" />
              </button>
              <span className="font-golos text-base font-semibold text-foreground">{navYear}</span>
              <button onClick={() => setNavYear(y => y + 1)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <Icon name="ChevronRight" size={16} className="text-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 12 }, (_, i) => {
                const cells = buildMonthGrid(navYear, i, periodStart, cycleLength);
                return (
                  <div key={i} className="card-soft rounded-2xl p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setView('month')}>
                    <p className="font-golos text-xs font-semibold text-foreground text-center mb-2">{t.monthNames[i]}</p>
                    <div className="grid grid-cols-7 mb-1">
                      {t.daysHeader.map((d, j) => (
                        <div key={j} className="text-center font-golos text-[7px] text-muted-foreground/60">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {cells.map(({ date, cycleDay }, idx) => {
                        const phase = getPhaseForDay(cycleDay);
                        const colors = PHASE_COLORS[phase];
                        const todayCell = isToday(date);
                        const inM = date.getMonth() === i;
                        return (
                          <div key={idx} className={`relative flex items-center justify-center aspect-square ${!inM ? 'opacity-0 pointer-events-none' : ''}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${todayCell ? colors.bg : ''}`}>
                              <span className={`font-golos text-[8px] ${todayCell ? 'text-white font-bold' : 'text-foreground'}`}>
                                {date.getDate()}
                              </span>
                            </div>
                            {inM && (
                              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full opacity-50 ${colors.dot}`} />
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

      {/* Легенда фаз */}
      <div className="px-4 py-2 border-t border-border/20 flex gap-3 justify-center flex-wrap">
        {(['menstrual', 'follicular', 'ovulation', 'luteal'] as CyclePhase[]).map(ph => (
          <div key={ph} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${PHASE_COLORS[ph].dot}`} />
            <span className="font-golos text-[10px] text-muted-foreground">{t.phaseNames[ph]}</span>
          </div>
        ))}
      </div>

      {/* Кнопка изменить даты */}
      <div className="px-5 pb-6 pt-2">
        <button onClick={() => setShowEdit(true)}
          className="w-full bg-primary text-white rounded-full py-3.5 font-golos text-base font-semibold shadow-lg hover:bg-primary/90 transition-all">
          {t.editPeriodDates}
        </button>
      </div>

      {showEdit && (
        <EditModal
          periodStart={periodStart}
          onSave={onChangePeriodStart}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
};

export default CycleCalendar;
