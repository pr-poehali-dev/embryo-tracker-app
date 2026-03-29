import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

interface PhaseInfo {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  tip: string;
}

const PHASES: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: 'Менструальная фаза',
    emoji: '🌹',
    color: 'text-rose-500',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    description: 'Дни 1–5 цикла. Матка обновляется.',
    tip: 'Отдыхай, пей больше воды, грелка поможет с болью.',
  },
  follicular: {
    name: 'Фолликулярная фаза',
    emoji: '🌸',
    color: 'text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    description: 'Дни 6–13 цикла. Созревание яйцеклетки.',
    tip: 'Уровень энергии растёт — хорошее время для активности.',
  },
  ovulation: {
    name: 'Овуляция',
    emoji: '✨',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    description: 'Дни 14–16 цикла. Выход яйцеклетки.',
    tip: 'Самый фертильный период. Либидо на пике.',
  },
  luteal: {
    name: 'Лютеиновая фаза',
    emoji: '🌙',
    color: 'text-violet-500',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    description: 'Дни 17–28 цикла. Подготовка к новому циклу.',
    tip: 'Возможны перепады настроения. Магний и шоколад помогут.',
  },
};

function getPhaseForDay(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

function getFertilityChance(cycleDay: number): { level: 'low' | 'medium' | 'high'; label: string; color: string; percent: number } {
  if (cycleDay >= 11 && cycleDay <= 16) return { level: 'high', label: 'Высокая вероятность забеременеть', color: 'text-emerald-600', percent: 85 };
  if ((cycleDay >= 8 && cycleDay <= 10) || (cycleDay >= 17 && cycleDay <= 19)) return { level: 'medium', label: 'Средняя вероятность забеременеть', color: 'text-orange-500', percent: 40 };
  return { level: 'low', label: 'Низкая вероятность забеременеть', color: 'text-muted-foreground', percent: 10 };
}

const SYMPTOMS_CYCLE = [
  { id: 'cramps', label: 'Спазмы', emoji: '😖' },
  { id: 'bloating', label: 'Вздутие', emoji: '💧' },
  { id: 'mood', label: 'Настроение', emoji: '😔' },
  { id: 'headache', label: 'Головная боль', emoji: '🤕' },
  { id: 'acne', label: 'Акне', emoji: '😤' },
  { id: 'discharge', label: 'Выделения', emoji: '💧' },
  { id: 'spotting', label: 'Мажущие', emoji: '🩸' },
  { id: 'tender', label: 'Грудь', emoji: '💗' },
];

const DAILY_TIPS = [
  { title: 'Вероятность забеременеть', subtitle: 'сегодня', emoji: '🔮', border: true },
  { title: 'Гормональный фон', subtitle: 'этой недели', emoji: '📊', border: true },
  { title: 'Советы по питанию', subtitle: 'для фазы', emoji: '🥗', border: false },
  { title: 'Тренировки', subtitle: 'рекомендации', emoji: '🧘‍♀️', border: false },
];

interface CycleTrackerProps {
  onSwitchMode: () => void;
}

const CycleTracker: React.FC<CycleTrackerProps> = ({ onSwitchMode }) => {
  const [cycleLength] = useState(28);
  const [lastPeriodStart] = useState(new Date(2026, 2, 5)); // 5 марта 2026
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'today' | 'tips' | 'messages' | 'partner'>('today');
  const [showMarkPeriod, setShowMarkPeriod] = useState(false);
  const [markedDays, setMarkedDays] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showPhaseInfo, setShowPhaseInfo] = useState(false);

  const today = new Date();
  const weekDates = getWeekDates(weekOffset);

  const getCycleDay = (date: Date): number => {
    const diff = date.getTime() - lastPeriodStart.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return ((days % cycleLength) + cycleLength) % cycleLength + 1;
  };

  const selectedCycleDay = getCycleDay(selectedDate);
  const todayCycleDay = getCycleDay(today);
  const phase = getPhaseForDay(selectedCycleDay);
  const phaseInfo = PHASES[phase];
  const fertility = getFertilityChance(selectedCycleDay);

  const daysUntilPeriod = (() => {
    const nextPeriod = new Date(lastPeriodStart);
    nextPeriod.setDate(lastPeriodStart.getDate() + cycleLength);
    while (nextPeriod < today) {
      nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    }
    return Math.round((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => d.toDateString() === selectedDate.toDateString();
  const isMarked = (d: Date) => markedDays.includes(d.toDateString());

  const getDayPhase = (d: Date): CyclePhase => getPhaseForDay(getCycleDay(d));

  const getDayColor = (d: Date) => {
    const p = getDayPhase(d);
    const colors: Record<CyclePhase, string> = {
      menstrual: 'bg-rose-400',
      follicular: 'bg-orange-300',
      ovulation: 'bg-emerald-400',
      luteal: 'bg-violet-300',
    };
    return colors[p];
  };

  const toggleSymptom = (id: string) => {
    setSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleMarkPeriod = () => {
    const key = selectedDate.toDateString();
    setMarkedDays(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    setShowMarkPeriod(false);
  };

  const currentMonthName = weekDates[3].toLocaleDateString('ru', { month: 'long', year: 'numeric' });

  const navItems = [
    { id: 'today' as const, icon: 'Calendar', label: 'Сегодня' },
    { id: 'tips' as const, icon: 'Lightbulb', label: 'Советы' },
    { id: 'messages' as const, icon: 'MessageCircle', label: 'Дневник' },
    { id: 'partner' as const, icon: 'Users', label: 'Партнёр' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="bg-bubbles">
        <div className="bubble w-64 h-64" style={{ background: 'hsl(340 50% 85%)', top: '-5%', right: '-10%', animationDelay: '0s' }} />
        <div className="bubble w-48 h-48" style={{ background: 'hsl(270 30% 85%)', bottom: '20%', left: '-8%', animationDelay: '5s' }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto pb-28">

        {/* ===== СЕГОДНЯ ===== */}
        {activeTab === 'today' && (
          <div className="animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-10 pb-3">
              <button className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                <span className="text-xl">🐱</span>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-400 rounded-full border-2 border-background" />
              </button>

              <div className="flex flex-col items-center">
                <span className="font-golos text-base font-semibold text-foreground capitalize">
                  {today.toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
                </span>
              </div>

              <button className="w-10 h-10 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-all">
                <Icon name="Calendar" size={20} className="text-foreground" />
              </button>
            </div>

            {/* Горизонтальный календарь */}
            <div className="px-4 mb-1">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setWeekOffset(o => o - 1)} className="p-1.5 rounded-full hover:bg-muted transition-all">
                  <Icon name="ChevronLeft" size={15} className="text-muted-foreground" />
                </button>
                <span className="font-golos text-xs text-muted-foreground capitalize">{currentMonthName}</span>
                <button onClick={() => setWeekOffset(o => o + 1)} className="p-1.5 rounded-full hover:bg-muted transition-all">
                  <Icon name="ChevronRight" size={15} className="text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {DAYS_SHORT.map((d, i) => (
                  <div key={d} className="flex flex-col items-center gap-1">
                    <span className={`font-golos text-[11px] font-medium ${
                      isSelected(weekDates[i]) ? 'text-primary' : 'text-muted-foreground'
                    }`}>{d}</span>
                    <button
                      onClick={() => setSelectedDate(weekDates[i])}
                      className="relative flex flex-col items-center gap-0.5"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 font-golos text-sm font-medium
                        ${isSelected(weekDates[i])
                          ? 'bg-foreground text-background shadow-lg'
                          : isToday(weekDates[i])
                          ? 'bg-muted text-foreground font-bold'
                          : isMarked(weekDates[i])
                          ? 'bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                          : 'text-foreground hover:bg-muted'}`}
                      >
                        {weekDates[i].getDate()}
                      </div>
                      {/* Фазовая точка */}
                      <div className={`w-1.5 h-1.5 rounded-full ${getDayColor(weekDates[i])} ${isSelected(weekDates[i]) ? 'opacity-0' : 'opacity-70'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Легенда фаз */}
            <div className="px-5 flex gap-3 overflow-x-auto pb-1 mt-1" style={{ scrollbarWidth: 'none' }}>
              {(Object.entries(PHASES) as [CyclePhase, PhaseInfo][]).map(([key, p]) => (
                <div key={key} className="flex items-center gap-1 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full phase-${key}`} />
                  <span className="font-golos text-[10px] text-muted-foreground">{p.emoji}</span>
                </div>
              ))}
            </div>

            {/* Главный блок — обратный отсчёт */}
            <div className="px-5 py-6 text-center">
              <p className="font-golos text-base text-foreground/70 mb-1">Месячные через</p>
              <p className="font-cormorant text-7xl font-bold text-foreground leading-none mb-1">
                {daysUntilPeriod}
              </p>
              <p className="font-cormorant text-3xl text-foreground/80 mb-4">
                {daysUntilPeriod === 1 ? 'день' : daysUntilPeriod < 5 ? 'дня' : 'дней'}
              </p>

              {/* Фаза цикла */}
              <button
                onClick={() => setShowPhaseInfo(!showPhaseInfo)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3 ${phaseInfo.bgColor} transition-all hover:scale-105`}
              >
                <span className="text-base">{phaseInfo.emoji}</span>
                <span className={`font-golos text-sm font-medium ${phaseInfo.color}`}>{phaseInfo.name}</span>
                <Icon name="Info" size={14} className={phaseInfo.color} />
              </button>

              {showPhaseInfo && (
                <div className={`mx-auto max-w-xs ${phaseInfo.bgColor} rounded-2xl p-3 mb-3 animate-bounce-in text-left`}>
                  <p className="font-golos text-sm text-foreground/80 mb-1">{phaseInfo.description}</p>
                  <p className="font-golos text-xs text-muted-foreground">💡 {phaseInfo.tip}</p>
                </div>
              )}

              {/* Вероятность забеременеть */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className={`font-golos text-sm ${fertility.color}`}>{fertility.label}</span>
                <button className="w-5 h-5 rounded-full border border-muted-foreground/40 flex items-center justify-center">
                  <Icon name="Info" size={11} className="text-muted-foreground" />
                </button>
              </div>

              {/* Индикатор вероятности */}
              <div className="mx-auto max-w-xs mb-5">
                <div className="flex justify-between font-golos text-xs text-muted-foreground mb-1">
                  <span>Низкая</span>
                  <span>Высокая</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${fertility.percent}%`,
                      background: fertility.level === 'high'
                        ? 'hsl(160 50% 55%)'
                        : fertility.level === 'medium'
                        ? 'hsl(30 80% 65%)'
                        : 'hsl(340 45% 72%)',
                    }}
                  />
                </div>
              </div>

              {/* Кнопка отметить месячные */}
              <button
                onClick={() => setShowMarkPeriod(!showMarkPeriod)}
                className="w-full max-w-xs bg-primary text-white font-golos text-base font-semibold py-3.5 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                Отметить месячные
              </button>

              {showMarkPeriod && (
                <div className="mt-3 max-w-xs mx-auto card-soft rounded-2xl p-4 animate-bounce-in">
                  <p className="font-golos text-sm font-semibold text-foreground mb-2">
                    {selectedDate.toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
                  </p>
                  <p className="font-golos text-xs text-muted-foreground mb-3">Отметить этот день как начало менструации?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkPeriod}
                      className="flex-1 bg-primary text-white rounded-xl py-2 font-golos text-sm hover:bg-primary/90 transition-all"
                    >
                      {isMarked(selectedDate) ? 'Убрать отметку' : 'Да, отметить'}
                    </button>
                    <button
                      onClick={() => setShowMarkPeriod(false)}
                      className="flex-1 bg-muted text-foreground rounded-xl py-2 font-golos text-sm hover:bg-muted/70 transition-all"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Советы на каждый день */}
            <div className="px-5">
              <h2 className="font-cormorant text-2xl font-semibold text-foreground mb-3">Советы на каждый день</h2>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {/* Отметить симптомы */}
                <div className="flex-shrink-0 w-[130px]">
                  <button
                    onClick={() => setShowSymptoms(!showSymptoms)}
                    className="w-full bg-card rounded-2xl p-4 h-[140px] flex flex-col justify-between border border-border/40 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] text-left"
                  >
                    <p className="font-golos text-sm font-medium text-foreground leading-tight">Отметьте свои симптомы</p>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Icon name="Plus" size={20} className="text-white" />
                    </div>
                  </button>
                </div>

                {/* Вероятность сегодня */}
                <div className="flex-shrink-0 w-[130px]">
                  <div className="rounded-2xl p-4 h-[140px] flex flex-col justify-between border-2 border-primary/40 bg-card shadow-sm">
                    <div>
                      <p className="font-golos text-[10px] text-primary font-medium">Вероятность</p>
                      <p className="font-golos text-sm font-medium text-foreground leading-tight mt-0.5">забеременеть сегодня</p>
                    </div>
                    <div className="relative w-12 h-12">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                          strokeDasharray={`${(fertility.percent / 100) * 94} 94`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-golos text-[10px] font-bold text-primary">
                        {fertility.percent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Фаза */}
                <div className="flex-shrink-0 w-[130px]">
                  <div className={`rounded-2xl p-4 h-[140px] flex flex-col justify-between border border-border/40 ${phaseInfo.bgColor} shadow-sm`}>
                    <p className="font-golos text-sm font-medium text-foreground leading-tight">{phaseInfo.name}</p>
                    <span className="text-3xl">{phaseInfo.emoji}</span>
                  </div>
                </div>

                {/* День цикла */}
                <div className="flex-shrink-0 w-[130px]">
                  <div className="rounded-2xl p-4 h-[140px] flex flex-col justify-between border border-border/40 bg-card shadow-sm">
                    <p className="font-golos text-sm font-medium text-foreground leading-tight">День цикла</p>
                    <div>
                      <p className="font-cormorant text-4xl font-bold text-primary">{todayCycleDay}</p>
                      <p className="font-golos text-xs text-muted-foreground">из {cycleLength}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Симптомы (раскрывается) */}
            {showSymptoms && (
              <div className="px-5 mt-3 animate-fade-in-up">
                <div className="card-soft rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-cormorant text-lg font-semibold text-foreground">Симптомы сегодня</h3>
                    <button onClick={() => setShowSymptoms(false)}>
                      <Icon name="X" size={18} className="text-muted-foreground" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {SYMPTOMS_CYCLE.map(s => (
                      <button
                        key={s.id}
                        onClick={() => toggleSymptom(s.id)}
                        className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all duration-200
                          ${symptoms.includes(s.id)
                            ? 'bg-primary/15 scale-105 border border-primary/30'
                            : 'bg-card border border-border/30 hover:scale-105'}`}
                      >
                        <span className="text-xl mb-1">{s.emoji}</span>
                        <span className={`font-golos text-[10px] text-center leading-tight ${symptoms.includes(s.id) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {symptoms.length > 0 && (
                    <button className="w-full mt-3 bg-primary text-white rounded-2xl py-2.5 font-golos text-sm font-medium hover:bg-primary/90 transition-all">
                      Сохранить ({symptoms.length})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Статистика цикла */}
            <div className="px-5 mt-4 grid grid-cols-3 gap-3">
              {[
                { emoji: '📅', label: 'Длина цикла', value: `${cycleLength} дней` },
                { emoji: '🩸', label: 'День цикла', value: `${todayCycleDay}` },
                { emoji: '⏱️', label: 'До месячных', value: `${daysUntilPeriod} дн` },
              ].map((s, i) => (
                <div key={i} className="card-soft rounded-2xl p-3 text-center">
                  <span className="text-xl">{s.emoji}</span>
                  <p className="font-golos text-[10px] text-muted-foreground mt-1">{s.label}</p>
                  <p className="font-cormorant text-base font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Переключатель на режим беременности */}
            <div className="px-5 mt-4">
              <button
                onClick={onSwitchMode}
                className="w-full card-soft rounded-2xl py-3.5 flex items-center justify-center gap-3 hover:bg-primary/5 transition-all group"
              >
                <span className="text-xl">🤰</span>
                <span className="font-golos text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Перейти в режим беременности
                </span>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* ===== СОВЕТЫ ===== */}
        {activeTab === 'tips' && (
          <div className="px-5 pt-10 animate-fade-in-up space-y-4">
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-2">Советы по фазам</h1>
            {(Object.entries(PHASES) as [CyclePhase, PhaseInfo][]).map(([key, p]) => (
              <div key={key} className={`card-soft rounded-3xl p-5 ${p.bgColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <div>
                    <h3 className={`font-cormorant text-xl font-semibold ${p.color}`}>{p.name}</h3>
                    <p className="font-golos text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/40 dark:bg-black/20 rounded-xl p-2.5">
                  <Icon name="Star" size={14} className={`${p.color} mt-0.5 flex-shrink-0`} />
                  <p className="font-golos text-sm text-foreground/80">{p.tip}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== ДНЕВНИК ===== */}
        {activeTab === 'messages' && (
          <div className="px-5 pt-10 animate-fade-in-up">
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-4">Дневник</h1>
            <div className="card-soft rounded-3xl p-5 mb-4">
              <p className="font-golos text-sm text-muted-foreground mb-3">
                {today.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <textarea
                placeholder="Запиши, как себя чувствуешь сегодня..."
                className="w-full rounded-2xl border border-border/60 bg-white/60 dark:bg-white/5 px-3 py-2.5 font-golos text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={4}
              />
              <button className="w-full mt-3 bg-primary text-white rounded-2xl py-2.5 font-golos text-sm font-medium hover:bg-primary/90 transition-all">
                Сохранить запись
              </button>
            </div>
            <div className="space-y-3">
              {[
                { date: '28 марта', text: 'Лёгкий дискомфорт, настроение хорошее', phase: 'Лютеиновая' },
                { date: '27 марта', text: 'Много энергии, занялась спортом 🏃‍♀️', phase: 'Лютеиновая' },
              ].map((entry, i) => (
                <div key={i} className="card-soft rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-golos text-xs text-muted-foreground">{entry.date}</span>
                    <span className="font-golos text-[10px] bg-blush dark:bg-blush/30 text-primary px-2 py-0.5 rounded-full">{entry.phase}</span>
                  </div>
                  <p className="font-golos text-sm text-foreground/80">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ПАРТНЁР ===== */}
        {activeTab === 'partner' && (
          <div className="px-5 pt-10 animate-fade-in-up text-center">
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-2">Партнёр</h1>
            <div className="card-soft rounded-3xl p-8 mt-4">
              <span className="text-6xl mb-4 block">👫</span>
              <p className="font-cormorant text-2xl font-semibold text-foreground mb-2">Пригласи партнёра</p>
              <p className="font-golos text-sm text-muted-foreground mb-5">
                Поделись своим циклом с партнёром, чтобы он лучше понимал твоё состояние
              </p>
              <button className="w-full bg-primary text-white rounded-2xl py-3 font-golos text-sm font-medium hover:bg-primary/90 transition-all">
                Отправить приглашение
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="card-soft rounded-3xl px-2 py-2 flex items-center justify-around">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200
                  ${activeTab === item.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  className={activeTab === item.id ? 'text-primary' : 'text-muted-foreground'}
                />
                {item.id === 'messages' && (
                  <div className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-primary rounded-full" />
                )}
                <span className={`font-golos text-[10px] font-medium ${activeTab === item.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CycleTracker;
