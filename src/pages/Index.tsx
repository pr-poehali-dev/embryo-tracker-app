import React, { useState, useEffect } from 'react';
import Embryo3D from '@/components/Embryo3D';
import WeekInfo from '@/components/WeekInfo';
import WellbeingTracker from '@/components/WellbeingTracker';
import CycleTracker from '@/components/CycleTracker';
import Icon from '@/components/ui/icon';

type AppMode = 'pregnancy' | 'cycle';
type Tab = 'home' | 'embryo' | 'development' | 'tips' | 'profile';

const PREGNANCY_START = new Date(2025, 5, 15);
const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getCurrentWeek(start: Date): number {
  const diff = new Date().getTime() - start.getTime();
  const days = Math.floor(diff / 86400000);
  return Math.min(40, Math.max(1, Math.floor(days / 7) + 1));
}
function getCurrentDay(start: Date): number {
  const diff = new Date().getTime() - start.getTime();
  return (Math.floor(diff / 86400000) % 7) + 1;
}
function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const TIPS = [
  { week: '1–13', title: 'I триместр', icon: '🌱', color: 'bg-peach/60', items: ['Принимай фолиевую кислоту 400 мкг/день', 'Откажись от алкоголя и сигарет', 'Первый визит к гинекологу до 12 нед', 'Имбирный чай помогает при тошноте'] },
  { week: '14–26', title: 'II триместр', icon: '🌸', color: 'bg-blush/60', items: ['Второй скрининг на 18–21 нед', 'Начни разговаривать с малышом', 'Гимнастика для беременных', 'Сон на левом боку'] },
  { week: '27–40', title: 'III триместр', icon: '🎀', color: 'bg-lavender/60', items: ['Курсы подготовки к родам', 'Следи за шевелениями ежедневно', 'Собери сумку в роддом заранее', 'Отдыхай и береги себя'] },
  { week: 'Всегда', title: 'Питание', icon: '🥗', color: 'bg-mint/60', items: ['Белок: мясо, рыба, яйца, бобовые', 'Кальций: молочные продукты', 'Железо: говядина, шпинат, гранат', 'Избегай сырой рыбы и мягких сыров'] },
];

const Index: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('pregnancy');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeek(PREGNANCY_START));
  const [currentDay, setCurrentDay] = useState(() => getCurrentDay(PREGNANCY_START));
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [profileName, setProfileName] = useState('Мама');
  const [dueDate, setDueDate] = useState('2026-03-08');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date();
  const daysLeft = Math.max(0, Math.round((new Date(dueDate).getTime() - today.getTime()) / 86400000));
  const currentMonthName = weekDates[3].toLocaleDateString('ru', { month: 'long' });

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => d.toDateString() === selectedDate.toDateString();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const days = Math.floor((date.getTime() - PREGNANCY_START.getTime()) / 86400000);
    setCurrentWeek(Math.min(40, Math.max(1, Math.floor(days / 7) + 1)));
    setCurrentDay((days % 7) + 1);
  };

  const handleWeekChange = (w: number) => setCurrentWeek(Math.max(1, Math.min(40, w)));

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'embryo', icon: 'Baby', label: 'Малыш' },
    { id: 'development', icon: 'BookOpen', label: 'Развитие' },
    { id: 'tips', icon: 'Lightbulb', label: 'Советы' },
    { id: 'profile', icon: 'User', label: 'Профиль' },
  ];

  // Режим трекера цикла
  if (appMode === 'cycle') {
    return (
      <div className="relative">
        {/* Верхняя панель переключения */}
        <div className="fixed top-0 left-0 right-0 z-30 max-w-md mx-auto">
          <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-background/80 backdrop-blur-md">
            {/* Переключатель режимов */}
            <button
              onClick={() => setShowModeSwitcher(!showModeSwitcher)}
              className="flex items-center gap-2 bg-card rounded-2xl px-3 py-1.5 border border-border/60 shadow-sm hover:shadow-md transition-all"
            >
              <span className="text-base">🔄</span>
              <span className="font-golos text-xs font-medium text-foreground">Цикл</span>
              <Icon name="ChevronDown" size={13} className="text-muted-foreground" />
            </button>

            {/* Смена темы */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
            >
              <Icon name={darkMode ? 'Sun' : 'Moon'} size={17} className="text-foreground" />
            </button>
          </div>

          {/* Дропдаун переключателя */}
          {showModeSwitcher && (
            <div className="mx-5 bg-card rounded-2xl border border-border/60 shadow-xl overflow-hidden animate-bounce-in">
              <button
                onClick={() => { setAppMode('pregnancy'); setShowModeSwitcher(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-all text-left"
              >
                <span className="text-xl">🤰</span>
                <div>
                  <p className="font-golos text-sm font-semibold text-foreground">Режим беременности</p>
                  <p className="font-golos text-xs text-muted-foreground">Следи за развитием малыша</p>
                </div>
              </button>
              <div className="h-px bg-border mx-4" />
              <button
                onClick={() => { setAppMode('cycle'); setShowModeSwitcher(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-primary/8 text-left"
              >
                <span className="text-xl">🌙</span>
                <div>
                  <p className="font-golos text-sm font-semibold text-primary">Трекер цикла</p>
                  <p className="font-golos text-xs text-muted-foreground">Текущий режим</p>
                </div>
                <Icon name="Check" size={14} className="text-primary ml-auto" />
              </button>
            </div>
          )}
        </div>

        <div className="pt-16">
          <CycleTracker onSwitchMode={() => { setAppMode('pregnancy'); setActiveTab('home'); }} />
        </div>
      </div>
    );
  }

  // Режим беременности
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="bg-bubbles">
        <div className="bubble w-72 h-72 bg-blush" style={{ top: '-8%', right: '-15%', animationDelay: '0s' }} />
        <div className="bubble w-56 h-56 bg-peach" style={{ top: '20%', left: '-12%', animationDelay: '4s' }} />
        <div className="bubble w-40 h-40 bg-lavender" style={{ bottom: '30%', right: '-8%', animationDelay: '8s' }} />
      </div>

      {/* Верхняя панель — переключатель режима + тема */}
      <div className="fixed top-0 left-0 right-0 z-30 max-w-md mx-auto">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-background/80 backdrop-blur-md">
          <button
            onClick={() => setShowModeSwitcher(!showModeSwitcher)}
            className="flex items-center gap-2 bg-card rounded-2xl px-3 py-1.5 border border-border/60 shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-base">🤰</span>
            <span className="font-golos text-xs font-medium text-foreground">Беременность</span>
            <Icon name="ChevronDown" size={13} className="text-muted-foreground" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
          >
            <Icon name={darkMode ? 'Sun' : 'Moon'} size={17} className="text-foreground" />
          </button>
        </div>

        {showModeSwitcher && (
          <div className="mx-5 bg-card rounded-2xl border border-border/60 shadow-xl overflow-hidden animate-bounce-in">
            <button
              onClick={() => { setAppMode('pregnancy'); setShowModeSwitcher(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-primary/8 text-left"
            >
              <span className="text-xl">🤰</span>
              <div>
                <p className="font-golos text-sm font-semibold text-primary">Режим беременности</p>
                <p className="font-golos text-xs text-muted-foreground">Текущий режим</p>
              </div>
              <Icon name="Check" size={14} className="text-primary ml-auto" />
            </button>
            <div className="h-px bg-border mx-4" />
            <button
              onClick={() => { setAppMode('cycle'); setShowModeSwitcher(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-all text-left"
            >
              <span className="text-xl">🌙</span>
              <div>
                <p className="font-golos text-sm font-semibold text-foreground">Трекер цикла</p>
                <p className="font-golos text-xs text-muted-foreground">Отслеживай цикл</p>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-md mx-auto pb-28 pt-16">

        {/* ===== ГЛАВНАЯ ===== */}
        {activeTab === 'home' && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <p className="font-golos text-sm text-muted-foreground">Привет, {profileName} 🌸</p>
                <h1 className="font-cormorant text-2xl font-semibold text-foreground leading-tight">Мой дневник</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blush to-lavender flex items-center justify-center shadow-md">
                    <span className="font-cormorant text-xl font-semibold text-primary">{currentWeek}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                    <span className="font-golos text-[7px] text-primary font-bold">нед</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Горизонтальный календарь */}
            <div className="px-4 mb-1">
              <div className="flex items-center justify-between mb-2 px-1">
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
                    <span className={`font-golos text-[11px] font-medium ${isSelected(weekDates[i]) ? 'text-primary' : 'text-muted-foreground'}`}>{d}</span>
                    <button onClick={() => handleDateClick(weekDates[i])} className="relative flex flex-col items-center gap-0.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 font-golos text-sm font-medium
                        ${isSelected(weekDates[i]) ? 'bg-foreground text-background shadow-lg'
                          : isToday(weekDates[i]) ? 'bg-muted text-foreground font-bold'
                          : 'text-foreground hover:bg-muted'}`}>
                        {weekDates[i].getDate()}
                      </div>
                      {isSelected(weekDates[i]) && (
                        <div className="w-1 h-3 bg-muted-foreground/30 rounded-full" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Большой круг эмбриона */}
            <div className="flex justify-center py-3">
              <Embryo3D week={currentWeek} day={currentDay} onDetails={() => setShowDetails(!showDetails)} />
            </div>

            {showDetails && (
              <div className="px-5 mb-4 animate-fade-in-up">
                <WeekInfo week={currentWeek} />
              </div>
            )}

            {/* Карточки дневника */}
            <div className="px-5 mt-1">
              <h2 className="font-cormorant text-2xl font-semibold text-foreground mb-3">Мой дневник</h2>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                <div className="flex-shrink-0 w-[130px]">
                  <button
                    onClick={() => setActiveTab('development')}
                    className="w-full bg-card rounded-2xl p-4 h-[140px] flex flex-col justify-between border border-border/40 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left"
                  >
                    <p className="font-golos text-sm font-medium text-foreground leading-tight">Записать симптомы</p>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Icon name="Plus" size={20} className="text-white" />
                    </div>
                  </button>
                </div>
                <div className="flex-shrink-0 w-[130px]">
                  <button
                    onClick={() => setActiveTab('embryo')}
                    className="w-full rounded-2xl p-4 h-[140px] flex flex-col justify-between border-2 border-primary/40 bg-card shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left"
                  >
                    <p className="font-golos text-sm font-semibold text-primary leading-tight">Беременность сегодня</p>
                    <span className="text-3xl self-end">🤰</span>
                  </button>
                </div>
                <div className="flex-shrink-0 w-[130px]">
                  <button
                    onClick={() => setActiveTab('tips')}
                    className="w-full rounded-2xl p-4 h-[140px] flex flex-col justify-between border-2 border-primary/40 bg-card shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left"
                  >
                    <div>
                      <p className="font-golos text-[10px] text-primary font-medium">Питание</p>
                      <p className="font-golos text-sm font-medium text-foreground leading-tight mt-0.5">Что есть на {currentWeek} нед</p>
                    </div>
                    <span className="text-3xl self-end">🥗</span>
                  </button>
                </div>
                <div className="flex-shrink-0 w-[130px]">
                  <button
                    onClick={() => setActiveTab('tips')}
                    className="w-full rounded-2xl p-4 h-[140px] flex flex-col justify-between border border-border/40 bg-card shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left"
                  >
                    <div>
                      <p className="font-golos text-[10px] text-muted-foreground font-medium">Активность</p>
                      <p className="font-golos text-sm font-medium text-foreground leading-tight mt-0.5">Упражнения для мамы</p>
                    </div>
                    <span className="text-3xl self-end">🧘‍♀️</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Трекер самочувствия */}
            <div className="px-5 mt-3">
              <WellbeingTracker week={currentWeek} />
            </div>

            {/* Быстрая статистика */}
            <div className="px-5 mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: '🎀', label: 'Триместр', value: currentWeek <= 13 ? 'I' : currentWeek <= 26 ? 'II' : 'III' },
                { icon: '❤️', label: 'До родов', value: `${daysLeft} дн` },
                { icon: '📅', label: 'ПДР', value: new Date(dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' }) },
              ].map((s, i) => (
                <div key={i} className="card-soft rounded-2xl p-3 text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="font-golos text-[10px] text-muted-foreground mt-1">{s.label}</p>
                  <p className="font-cormorant text-base font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Кнопка переключения на цикл */}
            <div className="px-5 mt-4">
              <button
                onClick={() => setAppMode('cycle')}
                className="w-full card-soft rounded-2xl py-3.5 flex items-center justify-center gap-3 hover:bg-primary/5 transition-all group"
              >
                <span className="text-xl">🌙</span>
                <span className="font-golos text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Перейти к трекеру цикла
                </span>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* ===== МАЛЫШ ===== */}
        {activeTab === 'embryo' && (
          <div className="px-5 pt-4 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-cormorant text-3xl font-semibold text-foreground">Наш малыш</h1>
            </div>
            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center justify-center gap-3 mb-4">
                <button onClick={() => handleWeekChange(currentWeek - 1)} className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110">
                  <Icon name="ChevronLeft" size={18} className="text-primary" />
                </button>
                <span className="font-cormorant text-2xl font-semibold text-foreground">{currentWeek} неделя</span>
                <button onClick={() => handleWeekChange(currentWeek + 1)} className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110">
                  <Icon name="ChevronRight" size={18} className="text-primary" />
                </button>
              </div>
              <div className="flex justify-center">
                <Embryo3D week={currentWeek} day={currentDay} />
              </div>
            </div>
            <div className="card-soft rounded-3xl p-5">
              <p className="font-golos text-xs text-muted-foreground mb-3">Посмотри малыша на разных сроках</p>
              <input type="range" min={1} max={40} value={currentWeek}
                onChange={e => handleWeekChange(Number(e.target.value))}
                className="w-full" style={{ accentColor: 'hsl(340, 65%, 62%)' }} />
              <div className="flex justify-between font-golos text-xs text-muted-foreground mt-1.5">
                <span>1 нед</span>
                <span className="text-primary font-semibold">{currentWeek} нед</span>
                <span>40 нед</span>
              </div>
            </div>
            <WeekInfo week={currentWeek} />
          </div>
        )}

        {/* ===== РАЗВИТИЕ ===== */}
        {activeTab === 'development' && (
          <div className="px-5 pt-4 space-y-4 animate-fade-in-up">
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-2">Развитие</h1>
            <div className="flex items-center gap-3">
              <button onClick={() => handleWeekChange(currentWeek - 1)} className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all">
                <Icon name="ChevronLeft" size={18} className="text-primary" />
              </button>
              <div className="flex-1 text-center">
                <p className="font-cormorant text-xl font-semibold text-foreground">{currentWeek} неделя</p>
              </div>
              <button onClick={() => handleWeekChange(currentWeek + 1)} className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all">
                <Icon name="ChevronRight" size={18} className="text-primary" />
              </button>
            </div>
            <WeekInfo week={currentWeek} />
            <WellbeingTracker week={currentWeek} />
          </div>
        )}

        {/* ===== СОВЕТЫ ===== */}
        {activeTab === 'tips' && (
          <div className="px-5 pt-4 space-y-4 animate-fade-in-up">
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-2">Советы</h1>
            {TIPS.map((tip, i) => (
              <div key={i} className={`card-soft rounded-3xl p-5 ${tip.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <h3 className="font-cormorant text-xl font-semibold text-foreground">{tip.title}</h3>
                    <p className="font-golos text-xs text-muted-foreground">Недели {tip.week}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {tip.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/70 dark:bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon name="Check" size={11} className="text-primary" />
                      </div>
                      <span className="font-golos text-sm text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== ПРОФИЛЬ ===== */}
        {activeTab === 'profile' && (
          <div className="px-5 pt-4 space-y-4 animate-fade-in-up">
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-2">Профиль</h1>

            <div className="card-soft rounded-3xl p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blush to-lavender mx-auto flex items-center justify-center mb-3 shadow-md">
                <span className="text-4xl">🌸</span>
              </div>
              {editingProfile ? (
                <div className="space-y-3 text-left mt-2">
                  <div>
                    <label className="font-golos text-xs text-muted-foreground mb-1 block">Имя</label>
                    <input value={profileName} onChange={e => setProfileName(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-white/60 dark:bg-white/5 px-3 py-2 font-golos text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="font-golos text-xs text-muted-foreground mb-1 block">Предполагаемая дата родов</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-white/60 dark:bg-white/5 px-3 py-2 font-golos text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <button onClick={() => setEditingProfile(false)}
                    className="w-full bg-primary text-white rounded-2xl py-2.5 font-golos text-sm font-medium hover:bg-primary/90 transition-all">
                    Сохранить
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-cormorant text-2xl font-semibold text-foreground">{profileName}</h2>
                  <p className="font-golos text-sm text-muted-foreground mt-1">{currentWeek} неделя беременности</p>
                  <button onClick={() => setEditingProfile(true)}
                    className="mt-3 px-5 py-2 rounded-xl border border-primary/30 font-golos text-sm text-primary hover:bg-blush/50 transition-all">
                    Редактировать
                  </button>
                </>
              )}
            </div>

            {/* Смена темы в профиле */}
            <div className="card-soft rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Icon name={darkMode ? 'Moon' : 'Sun'} size={18} className="text-foreground" />
                </div>
                <div>
                  <p className="font-golos text-sm font-medium text-foreground">Тема оформления</p>
                  <p className="font-golos text-xs text-muted-foreground">{darkMode ? 'Тёмная' : 'Светлая'}</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${darkMode ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${darkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Переключатель режима */}
            <div className="card-soft rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg">{appMode === 'pregnancy' ? '🤰' : '🌙'}</span>
                </div>
                <div>
                  <p className="font-golos text-sm font-medium text-foreground">Режим</p>
                  <p className="font-golos text-xs text-muted-foreground">{appMode === 'pregnancy' ? 'Беременность' : 'Цикл'}</p>
                </div>
              </div>
              <button
                onClick={() => setAppMode(appMode === 'pregnancy' ? 'cycle' : 'pregnancy')}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${appMode === 'cycle' ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${appMode === 'cycle' ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Неделя', value: `${currentWeek}`, emoji: '📅' },
                { label: 'До родов', value: `${daysLeft} дн`, emoji: '🎀' },
                { label: 'Триместр', value: currentWeek <= 13 ? 'Первый' : currentWeek <= 26 ? 'Второй' : 'Третий', emoji: '🌸' },
                { label: 'ПДР', value: new Date(dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'long' }), emoji: '💕' },
              ].map((stat, i) => (
                <div key={i} className="card-soft rounded-2xl p-4">
                  <span className="text-2xl">{stat.emoji}</span>
                  <p className="font-golos text-xs text-muted-foreground mt-2">{stat.label}</p>
                  <p className="font-cormorant text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="card-soft rounded-3xl p-5">
              <p className="font-cormorant text-lg font-semibold text-foreground mb-2">Настроить неделю</p>
              <input type="range" min={1} max={40} value={currentWeek}
                onChange={e => handleWeekChange(Number(e.target.value))}
                className="w-full" style={{ accentColor: 'hsl(340, 65%, 62%)' }} />
              <div className="flex justify-between font-golos text-xs text-muted-foreground mt-1.5">
                <span>1</span>
                <span className="text-primary font-semibold">{currentWeek} нед</span>
                <span>40</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="card-soft rounded-3xl px-2 py-2 flex items-center justify-around">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200
                  ${activeTab === item.id ? 'bg-primary/10' : 'hover:bg-muted'}`}>
                <Icon name={item.icon} size={20}
                  className={activeTab === item.id ? 'text-primary' : 'text-muted-foreground'} />
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

export default Index;
