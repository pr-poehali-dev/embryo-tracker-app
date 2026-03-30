import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import { detectLang, translations } from '@/i18n';

const lang = detectLang();
const t = translations[lang];

type CalView = 'month' | 'week' | 'year';

function buildMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Date[] = [];
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) cells.push(new Date(year, month - 1, prevDays - i));
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  const rem = 7 - (cells.length % 7);
  if (rem < 7) for (let d = 1; d <= rem; d++) cells.push(new Date(year, month + 1, d));
  return cells;
}

function buildWeekDates(baseMonday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    return d;
  });
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

function getPregnancyDay(date: Date, pregnancyStart: Date): number {
  return Math.floor((date.getTime() - pregnancyStart.getTime()) / 86400000) + 1;
}

function getPregnancyWeek(pDay: number): number {
  return Math.max(1, Math.min(40, Math.ceil(pDay / 7)));
}

function getTrimesterColor(pDay: number): { bg: string; text: string; dot: string } {
  if (pDay < 1) return { bg: '', text: 'text-muted-foreground', dot: 'bg-muted' };
  if (pDay <= 91)  return { bg: 'bg-emerald-400', text: 'text-white', dot: 'bg-emerald-400' };
  if (pDay <= 182) return { bg: 'bg-orange-300', text: 'text-white', dot: 'bg-orange-300' };
  if (pDay <= 280) return { bg: 'bg-violet-400', text: 'text-white', dot: 'bg-violet-400' };
  return { bg: '', text: 'text-muted-foreground', dot: 'bg-muted' };
}

// --- Модалка настройки начала беременности ---
type StartMode = 'lmp' | 'conception' | 'due';

interface SetupModalProps {
  onSave: (pregnancyStart: Date, dueDate: Date) => void;
  onClose: () => void;
  currentStart: Date;
  lang: string;
}

const SetupModal: React.FC<SetupModalProps> = ({ onSave, onClose, currentStart }) => {
  const [mode, setMode] = useState<StartMode>('lmp');
  const [dateVal, setDateVal] = useState(currentStart.toISOString().slice(0, 10));

  const handleCalculate = () => {
    const d = new Date(dateVal);
    let pregnancyStart: Date;
    let dueDate: Date;
    if (mode === 'lmp') {
      pregnancyStart = new Date(d);
      dueDate = new Date(d);
      dueDate.setDate(d.getDate() + 280);
    } else if (mode === 'conception') {
      // Отсчёт от зачатия — беременность считается от 2 недель до зачатия
      pregnancyStart = new Date(d);
      pregnancyStart.setDate(d.getDate() - 14);
      dueDate = new Date(pregnancyStart);
      dueDate.setDate(pregnancyStart.getDate() + 280);
    } else {
      // Обратный отсчёт от ПДР
      dueDate = new Date(d);
      pregnancyStart = new Date(d);
      pregnancyStart.setDate(d.getDate() - 280);
    }
    onSave(pregnancyStart, dueDate);
  };

  const modes: { id: StartMode; label: string; emoji: string }[] = [
    { id: 'lmp', label: t.fromLMP, emoji: '🩸' },
    { id: 'conception', label: t.fromConception, emoji: '✨' },
    { id: 'due', label: t.fromDueDate, emoji: '🎀' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-background rounded-t-3xl w-full max-w-md p-6 pb-10 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
        <h3 className="font-cormorant text-2xl font-semibold text-foreground mb-1 text-center">{t.setPregnancyStart}</h3>
        <p className="font-golos text-sm text-muted-foreground text-center mb-5">{t.pregnancyStartMode}</p>
        <div className="space-y-2 mb-5">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left
                ${mode === m.id ? 'border-primary bg-primary/8' : 'border-border/40 bg-card hover:bg-muted'}`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className={`font-golos text-sm font-medium ${mode === m.id ? 'text-primary' : 'text-foreground'}`}>{m.label}</span>
              {mode === m.id && <Icon name="Check" size={16} className="text-primary ml-auto" />}
            </button>
          ))}
        </div>
        <label className="font-golos text-xs text-muted-foreground mb-1 block">{t.enterDate}</label>
        <input
          type="date"
          value={dateVal}
          onChange={e => setDateVal(e.target.value)}
          className="w-full rounded-2xl border border-border/60 bg-card px-4 py-3 font-golos text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
        />
        <button
          onClick={handleCalculate}
          className="w-full bg-primary text-white rounded-full py-3.5 font-golos text-base font-semibold hover:bg-primary/90 transition-all"
        >
          {t.calculate}
        </button>
        <button onClick={onClose} className="w-full mt-2 py-2 font-golos text-sm text-muted-foreground">{t.cancel}</button>
      </div>
    </div>
  );
};

// --- Основной компонент ---
interface PregnancyCalendarProps {
  pregnancyStart: Date;
  dueDate: Date;
  onClose: () => void;
  onSave: (pregnancyStart: Date, dueDate: Date) => void;
  onSelectDate: (date: Date) => void;
}

const PregnancyCalendar: React.FC<PregnancyCalendarProps> = ({
  pregnancyStart, dueDate, onClose, onSave, onSelectDate,
}) => {
  const today = new Date();
  const [view, setView] = useState<CalView>('month');
  const [showSetup, setShowSetup] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Месяц/год навигация
  const [navYear, setNavYear] = useState(today.getFullYear());
  const [navMonth, setNavMonth] = useState(today.getMonth());
  // Неделя навигация
  const [weekBase, setWeekBase] = useState<Date>(getMondayOf(today));

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => d.toDateString() === selectedDate.toDateString();
  const isInMonth = (d: Date) => d.getMonth() === navMonth && d.getFullYear() === navYear;
  const isDueDate = (d: Date) => d.toDateString() === dueDate.toDateString();

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
    onSelectDate(d);
  };

  const pDaySelected = getPregnancyDay(selectedDate, pregnancyStart);
  const pWeekSelected = getPregnancyWeek(pDaySelected);

  // Список месяцев для скроллируемого месячного вида
  const monthsToShow: { year: number; month: number }[] = [];
  for (let offset = -3; offset <= 9; offset++) {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    monthsToShow.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const renderDayCell = (date: Date, inCurrentMonth: boolean) => {
    const pDay = getPregnancyDay(date, pregnancyStart);
    const isPregnancy = pDay >= 1 && pDay <= 280;
    const colors = getTrimesterColor(pDay);
    const todayCell = isToday(date);
    const selectedCell = isSelected(date);
    const dueDateCell = isDueDate(date);

    return (
      <button
        key={date.toDateString()}
        onClick={() => handleSelectDate(date)}
        className={`relative flex flex-col items-center justify-center aspect-square transition-all duration-150
          ${!inCurrentMonth ? 'opacity-20' : ''}
        `}
      >
        {/* День беременности — маленькие цифры сверху */}
        {inCurrentMonth && isPregnancy && (
          <span className={`absolute top-0.5 left-1/2 -translate-x-1/2 font-golos text-[9px] leading-none font-medium
            ${selectedCell ? 'text-white/80' : 'text-primary/60'}`}>
            {pDay}
          </span>
        )}

        {/* Полоска триместра снизу */}
        {inCurrentMonth && isPregnancy && (
          <div className={`absolute bottom-0.5 left-1 right-1 h-0.5 rounded-full opacity-60 ${colors.dot}`} />
        )}

        {/* ПДР звёздочка */}
        {dueDateCell && inCurrentMonth && (
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-400 rounded-full" />
        )}

        <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center mt-1.5
          ${selectedCell && isPregnancy ? `${colors.bg} shadow-md` : ''}
          ${selectedCell && !isPregnancy ? 'bg-foreground shadow-md' : ''}
          ${todayCell && !selectedCell ? 'ring-2 ring-primary ring-offset-1' : ''}
          ${dueDateCell && !selectedCell ? 'ring-2 ring-rose-400 ring-offset-1' : ''}
          ${!todayCell && !selectedCell ? 'hover:bg-muted' : ''}
        `}>
          <span className={`font-golos text-sm font-medium
            ${selectedCell ? (isPregnancy ? colors.text : 'text-background') : ''}
            ${!selectedCell && todayCell ? 'text-primary font-bold' : ''}
            ${!selectedCell && !todayCell && inCurrentMonth ? 'text-foreground' : ''}
          `}>
            {date.getDate()}
          </span>
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
        <button onClick={() => { setSelectedDate(today); setWeekBase(getMondayOf(today)); setNavMonth(today.getMonth()); setNavYear(today.getFullYear()); }}
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
      {pDaySelected >= 1 && pDaySelected <= 280 && (
        <div className="px-4 py-2 bg-primary/8 border-b border-primary/20">
          <p className="font-golos text-xs text-center text-primary font-medium">
            {selectedDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' })}
            {' — '}{t.pregnancyDayOf(pDaySelected, pWeekSelected)}
          </p>
        </div>
      )}

      {/* Тело календаря */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {/* ===== МЕСЯЦ (скроллируемый) ===== */}
        {view === 'month' && (
          <div className="pb-24">
            {monthsToShow.map(({ year, month }) => {
              const cells = buildMonthGrid(year, month);
              return (
                <div key={`${year}-${month}`}>
                  <div className="text-center py-4">
                    <span className="font-golos text-base font-semibold text-foreground">
                      {t.monthNames[month]}{year !== today.getFullYear() ? ` ${year}` : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 px-2">
                    {cells.map(date => renderDayCell(date, date.getMonth() === month))}
                  </div>
                  <div className="h-px bg-border/20 mx-4 mt-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* ===== НЕДЕЛЯ ===== */}
        {view === 'week' && (
          <div className="pb-24">
            {/* Навигация по неделям */}
            <div className="flex items-center justify-between px-5 py-3">
              <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); }}
                className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-all">
                <Icon name="ChevronLeft" size={18} className="text-foreground" />
              </button>
              <span className="font-golos text-sm font-semibold text-foreground">
                {weekBase.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' })}
                {' – '}
                {(() => { const end = new Date(weekBase); end.setDate(weekBase.getDate() + 6); return end.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' }); })()}
              </span>
              <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); }}
                className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-all">
                <Icon name="ChevronRight" size={18} className="text-foreground" />
              </button>
            </div>

            {/* Ячейки дней — большие */}
            <div className="grid grid-cols-7 px-2 mb-4">
              {buildWeekDates(weekBase).map((date) => {
                const pDay = getPregnancyDay(date, pregnancyStart);
                const isPregnancy = pDay >= 1 && pDay <= 280;
                const colors = getTrimesterColor(pDay);
                const todayCell = isToday(date);
                const selectedCell = isSelected(date);
                const dueDateCell = isDueDate(date);
                return (
                  <button
                    key={date.toDateString()}
                    onClick={() => handleSelectDate(date)}
                    className="relative flex flex-col items-center py-2 rounded-2xl transition-all hover:bg-muted"
                  >
                    {/* День беременности */}
                    {isPregnancy && (
                      <span className={`font-golos text-[9px] leading-none mb-1 font-semibold ${selectedCell ? 'text-primary' : 'text-primary/50'}`}>
                        {pDay}
                      </span>
                    )}
                    {!isPregnancy && <span className="text-[9px] mb-1 opacity-0">0</span>}

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${selectedCell && isPregnancy ? `${colors.bg} shadow-md` : ''}
                      ${selectedCell && !isPregnancy ? 'bg-foreground shadow-md' : ''}
                      ${todayCell && !selectedCell ? 'ring-2 ring-primary ring-offset-1' : ''}
                      ${dueDateCell && !selectedCell ? 'ring-2 ring-rose-400 ring-offset-1' : ''}
                    `}>
                      <span className={`font-golos text-base font-semibold
                        ${selectedCell ? (isPregnancy ? colors.text : 'text-background') : todayCell ? 'text-primary' : 'text-foreground'}
                      `}>{date.getDate()}</span>
                    </div>

                    {/* Название месяца под числом */}
                    <span className="font-golos text-[9px] text-muted-foreground mt-1">
                      {t.monthNames[date.getMonth()].slice(0, 3)}
                    </span>

                    {/* Полоска триместра */}
                    {isPregnancy && (
                      <div className={`mt-1 w-8 h-1.5 rounded-full opacity-70 ${colors.dot}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Детали выбранного дня */}
            {pDaySelected >= 1 && pDaySelected <= 280 && (
              <div className="mx-4 card-soft rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl ${getTrimesterColor(pDaySelected).bg} flex items-center justify-center`}>
                    <span className="font-cormorant text-lg font-bold text-white">{pWeekSelected}</span>
                  </div>
                  <div>
                    <p className="font-cormorant text-xl font-semibold text-foreground">
                      {pWeekSelected} {t.weekLabel}
                    </p>
                    <p className="font-golos text-sm text-muted-foreground">
                      {pDaySelected} {lang === 'ru' ? 'день' : 'day'} {lang === 'ru' ? 'беременности' : 'of pregnancy'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: lang === 'ru' ? 'День' : 'Day', value: String(pDaySelected) },
                    { label: lang === 'ru' ? 'Неделя' : 'Week', value: String(pWeekSelected) },
                    { label: lang === 'ru' ? 'Триместр' : 'Trimester', value: pDaySelected <= 91 ? 'I' : pDaySelected <= 182 ? 'II' : 'III' },
                  ].map((s, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-2 text-center">
                      <p className="font-golos text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="font-cormorant text-xl font-bold text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ГОД ===== */}
        {view === 'year' && (
          <div className="pb-24 px-4 pt-3">
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
                const cells = buildMonthGrid(navYear, i);
                return (
                  <div key={i} className="card-soft rounded-2xl p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => { setNavMonth(i); setNavYear(navYear); setView('month'); }}>
                    <p className="font-golos text-xs font-semibold text-foreground text-center mb-2">{t.monthNames[i]}</p>
                    <div className="grid grid-cols-7 gap-0 mb-1">
                      {t.daysHeader.map((d, j) => (
                        <div key={j} className="text-center font-golos text-[7px] text-muted-foreground/60">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0">
                      {cells.map((date, idx) => {
                        const pDay = getPregnancyDay(date, pregnancyStart);
                        const isPregnancy = pDay >= 1 && pDay <= 280;
                        const colors = getTrimesterColor(pDay);
                        const todayCell = isToday(date);
                        const inM = date.getMonth() === i;
                        return (
                          <div key={idx} className={`relative flex items-center justify-center aspect-square ${!inM ? 'opacity-0 pointer-events-none' : ''}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center
                              ${todayCell ? colors.bg || 'bg-primary' : ''}
                            `}>
                              <span className={`font-golos text-[8px] ${todayCell ? 'text-white font-bold' : 'text-foreground'}`}>
                                {date.getDate()}
                              </span>
                            </div>
                            {isPregnancy && inM && (
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

      {/* Легенда */}
      <div className="px-5 pb-2 pt-2 border-t border-border/20 flex gap-4 justify-center">
        {[
          { color: 'bg-emerald-400', label: lang === 'ru' ? 'I триместр' : 'I trimester' },
          { color: 'bg-orange-300', label: lang === 'ru' ? 'II триместр' : 'II trimester' },
          { color: 'bg-violet-400', label: lang === 'ru' ? 'III триместр' : 'III trimester' },
          { color: 'bg-rose-400', label: lang === 'ru' ? 'ПДР' : 'Due' },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span className="font-golos text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Кнопка настройки */}
      <div className="px-5 pb-6 pt-2">
        <button
          onClick={() => setShowSetup(true)}
          className="w-full bg-primary text-white rounded-full py-3.5 font-golos text-base font-semibold shadow-lg hover:bg-primary/90 transition-all"
        >
          {t.setPregnancyStart}
        </button>
      </div>

      {showSetup && (
        <SetupModal
          currentStart={pregnancyStart}
          lang={lang}
          onSave={(start, due) => { onSave(start, due); setShowSetup(false); }}
          onClose={() => setShowSetup(false)}
        />
      )}
    </div>
  );
};

export default PregnancyCalendar;