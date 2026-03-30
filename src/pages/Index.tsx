import React, { useState, useEffect } from 'react';
import Embryo3D from '@/components/Embryo3D';
import WeekInfo from '@/components/WeekInfo';
import WellbeingTracker from '@/components/WellbeingTracker';
import CycleTracker from '@/components/CycleTracker';
import PregnancyCalendar from '@/components/PregnancyCalendar';
import Icon from '@/components/ui/icon';
import { detectLang, translations } from '@/i18n';

const lang = detectLang();
const t = translations[lang];

type AppMode = 'pregnancy' | 'cycle';
type Tab = 'home' | 'embryo' | 'development' | 'tips' | 'profile';

function getCurrentWeek(start: Date): number {
  const diff = new Date().getTime() - start.getTime();
  const days = Math.floor(diff / 86400000);
  return Math.min(40, Math.max(1, Math.floor(days / 7) + 1));
}
function getCurrentDay(start: Date): number {
  const diff = new Date().getTime() - start.getTime();
  return (Math.floor(diff / 86400000) % 7) + 1;
}
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}
function getWeekDates(baseMonday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    return d;
  });
}

const TIPS_DATA = () => [
  { week: '1–13', title: lang === 'ru' ? 'I триместр' : 'I Trimester', icon: '🌱', color: 'bg-peach/60', items: lang === 'ru'
    ? ['Принимай фолиевую кислоту 400 мкг/день', 'Откажись от алкоголя и сигарет', 'Первый визит к гинекологу до 12 нед', 'Имбирный чай помогает при тошноте']
    : ['Take folic acid 400 mcg/day', 'Avoid alcohol and cigarettes', 'First OB visit before 12 weeks', 'Ginger tea helps with nausea'] },
  { week: '14–26', title: lang === 'ru' ? 'II триместр' : 'II Trimester', icon: '🌸', color: 'bg-blush/60', items: lang === 'ru'
    ? ['Второй скрининг на 18–21 нед', 'Начни разговаривать с малышом', 'Гимнастика для беременных', 'Сон на левом боку']
    : ['Second screening at 18–21 weeks', 'Start talking to your baby', 'Prenatal gymnastics', 'Sleep on your left side'] },
  { week: '27–40', title: lang === 'ru' ? 'III триместр' : 'III Trimester', icon: '🎀', color: 'bg-lavender/60', items: lang === 'ru'
    ? ['Курсы подготовки к родам', 'Следи за шевелениями ежедневно', 'Собери сумку в роддом заранее', 'Отдыхай и береги себя']
    : ['Childbirth prep classes', 'Track baby movements daily', 'Pack your hospital bag', 'Rest and take care of yourself'] },
  { week: lang === 'ru' ? 'Всегда' : 'Always', title: lang === 'ru' ? 'Питание' : 'Nutrition', icon: '🥗', color: 'bg-mint/60', items: lang === 'ru'
    ? ['Белок: мясо, рыба, яйца, бобовые', 'Кальций: молочные продукты', 'Железо: говядина, шпинат, гранат', 'Избегай сырой рыбы и мягких сыров']
    : ['Protein: meat, fish, eggs, legumes', 'Calcium: dairy products', 'Iron: beef, spinach, pomegranate', 'Avoid raw fish and soft cheeses'] },
];

const Index: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('pregnancy');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Беременность — старт и ПДР
  const [pregnancyStart, setPregnancyStart] = useState(new Date(2025, 5, 15));
  const [dueDateState, setDueDateState] = useState(() => {
    const d = new Date(2025, 5, 15);
    d.setDate(d.getDate() + 280);
    return d;
  });

  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeek(new Date(2025, 5, 15)));
  const [currentDay, setCurrentDay] = useState(() => getCurrentDay(new Date(2025, 5, 15)));

  // Навигация по неделям (горизонтальный календарь главной)
  const [weekBase, setWeekBase] = useState<Date>(getMondayOf(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [profileName, setProfileName] = useState(lang === 'ru' ? 'Мама' : 'Mom');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPregnancyCalendar, setShowPregnancyCalendar] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const today = new Date();
  const daysLeft = Math.max(0, Math.round((dueDateState.getTime() - today.getTime()) / 86400000));

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => d.toDateString() === selectedDate.toDateString();

  const weekDates = getWeekDates(weekBase);
  const currentMonthName = weekDates[3].toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long' });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const days = Math.floor((date.getTime() - pregnancyStart.getTime()) / 86400000);
    setCurrentWeek(Math.min(40, Math.max(1, Math.floor(days / 7) + 1)));
    setCurrentDay((days % 7) + 1);
  };

  const handlePregnancySave = (start: Date, due: Date) => {
    setPregnancyStart(start);
    setDueDateState(due);
    setCurrentWeek(getCurrentWeek(start));
    setCurrentDay(getCurrentDay(start));
    setShowPregnancyCalendar(false);
  };

  const handleWeekChange = (w: number) => setCurrentWeek(Math.max(1, Math.min(40, w)));

  // Получаем день беременности для выбранной даты в горизонтальном каландаре
  const getPregnancyDayForDate = (date: Date) => {
    const d = Math.floor((date.getTime() - pregnancyStart.getTime()) / 86400000) + 1;
    return d >= 1 && d <= 280 ? d : null;
  };

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'Home', label: t.navHome },
    { id: 'embryo', icon: 'Baby', label: t.navBaby },
    { id: 'development', icon: 'BookOpen', label: t.navDevelopment },
    { id: 'tips', icon: 'Lightbulb', label: t.navTips },
    { id: 'profile', icon: 'User', label: t.navProfile },
  ];

  const ModeSwitcherDropdown = () => (
    <div className="mx-5 bg-card rounded-2xl border border-border/60 shadow-xl overflow-hidden animate-bounce-in">
      <button onClick={() => { setAppMode('pregnancy'); setShowModeSwitcher(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${appMode === 'pregnancy' ? 'bg-primary/8' : 'hover:bg-muted'}`}>
        <span className="text-xl">🤰</span>
        <div>
          <p className={`font-golos text-sm font-semibold ${appMode === 'pregnancy' ? 'text-primary' : 'text-foreground'}`}>{t.pregnancyMode}</p>
          <p className="font-golos text-xs text-muted-foreground">{lang === 'ru' ? 'Следи за развитием малыша' : 'Track baby development'}</p>
        </div>
        {appMode === 'pregnancy' && <Icon name="Check" size={14} className="text-primary ml-auto" />}
      </button>
      <div className="h-px bg-border mx-4" />
      <button onClick={() => { setAppMode('cycle'); setShowModeSwitcher(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${appMode === 'cycle' ? 'bg-primary/8' : 'hover:bg-muted'}`}>
        <span className="text-xl">🌙</span>
        <div>
          <p className={`font-golos text-sm font-semibold ${appMode === 'cycle' ? 'text-primary' : 'text-foreground'}`}>{t.cycleMode}</p>
          <p className="font-golos text-xs text-muted-foreground">{lang === 'ru' ? 'Отслеживай цикл' : 'Track your cycle'}</p>
        </div>
        {appMode === 'cycle' && <Icon name="Check" size={14} className="text-primary ml-auto" />}
      </button>
    </div>
  );

  // ===== РЕЖИМ ЦИКЛА =====
  if (appMode === 'cycle') {
    return (
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 z-30 max-w-md mx-auto">
          <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-background/80 backdrop-blur-md">
            <button onClick={() => setShowModeSwitcher(!showModeSwitcher)}
              className="flex items-center gap-2 bg-card rounded-2xl px-3 py-1.5 border border-border/60 shadow-sm hover:shadow-md transition-all">
              <span className="text-base">🌙</span>
              <span className="font-golos text-xs font-medium text-foreground">{t.cycleMode}</span>
              <Icon name="ChevronDown" size={13} className="text-muted-foreground" />
            </button>
            <button onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110">
              <Icon name={darkMode ? 'Sun' : 'Moon'} size={17} className="text-foreground" />
            </button>
          </div>
          {showModeSwitcher && <ModeSwitcherDropdown />}
        </div>
        <div className="pt-16">
          <CycleTracker onSwitchMode={() => { setAppMode('pregnancy'); setActiveTab('home'); }} />
        </div>
      </div>
    );
  }

  // ===== РЕЖИМ БЕРЕМЕННОСТИ =====
  const TIPS = TIPS_DATA();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="bg-bubbles">
        <div className="bubble w-72 h-72 bg-blush" style={{ top: '-8%', right: '-15%', animationDelay: '0s' }} />
        <div className="bubble w-56 h-56 bg-peach" style={{ top: '20%', left: '-12%', animationDelay: '4s' }} />
        <div className="bubble w-40 h-40 bg-lavender" style={{ bottom: '30%', right: '-8%', animationDelay: '8s' }} />
      </div>

      {/* Верхняя панель */}
      <div className="fixed top-0 left-0 right-0 z-30 max-w-md mx-auto">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-background/80 backdrop-blur-md">
          <button onClick={() => setShowModeSwitcher(!showModeSwitcher)}
            className="flex items-center gap-2 bg-card rounded-2xl px-3 py-1.5 border border-border/60 shadow-sm hover:shadow-md transition-all">
            <span className="text-base">🤰</span>
            <span className="font-golos text-xs font-medium text-foreground">{t.pregnancyMode}</span>
            <Icon name="ChevronDown" size={13} className="text-muted-foreground" />
          </button>
          <button onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110">
            <Icon name={darkMode ? 'Sun' : 'Moon'} size={17} className="text-foreground" />
          </button>
        </div>
        {showModeSwitcher && <ModeSwitcherDropdown />}
      </div>

      <div className="relative z-10 max-w-md mx-auto pb-28 pt-16">

        {/* ===== ГЛАВНАЯ ===== */}
        {activeTab === 'home' && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <p className="font-golos text-sm text-muted-foreground">{t.hi(profileName)}</p>
                <h1 className="font-cormorant text-2xl font-semibold text-foreground">{t.myDiary}</h1>
              </div>
              <div className="relative">
                <button onClick={() => setShowPregnancyCalendar(true)}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-blush to-lavender flex items-center justify-center shadow-md hover:scale-105 transition-all">
                  <span className="font-cormorant text-xl font-semibold text-primary">{currentWeek}</span>
                </button>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                  <span className="font-golos text-[7px] text-primary font-bold">{t.weekShort}</span>
                </div>
              </div>
            </div>

            {/* Горизонтальный календарь с навигацией */}
            <div className="px-4 mb-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); }}
                  className="p-1.5 rounded-full hover:bg-muted transition-all">
                  <Icon name="ChevronLeft" size={15} className="text-muted-foreground" />
                </button>
                <span className="font-golos text-xs text-muted-foreground capitalize">{currentMonthName}</span>
                <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); }}
                  className="p-1.5 rounded-full hover:bg-muted transition-all">
                  <Icon name="ChevronRight" size={15} className="text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {t.daysShort.map((d, i) => (
                  <div key={d} className="flex flex-col items-center gap-1">
                    <span className={`font-golos text-[11px] font-medium ${isSelected(weekDates[i]) ? 'text-primary' : 'text-muted-foreground'}`}>{d}</span>
                    <button onClick={() => handleDateClick(weekDates[i])} className="flex flex-col items-center gap-0.5 relative">
                      {/* День беременности над числом */}
                      {(() => {
                        const pd = getPregnancyDayForDate(weekDates[i]);
                        return pd ? (
                          <span className={`font-golos text-[8px] leading-none ${isSelected(weekDates[i]) ? 'text-primary' : 'text-primary/40'}`}>{pd}</span>
                        ) : <span className="text-[8px] opacity-0">0</span>;
                      })()}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 font-golos text-sm font-medium
                        ${isSelected(weekDates[i]) ? 'bg-foreground text-background shadow-lg'
                          : isToday(weekDates[i]) ? 'bg-muted text-foreground font-bold'
                          : 'text-foreground hover:bg-muted'}`}>
                        {weekDates[i].getDate()}
                      </div>
                      {/* Полоска триместра */}
                      {(() => {
                        const pd = getPregnancyDayForDate(weekDates[i]);
                        if (!pd) return null;
                        const dotColor = pd <= 91 ? 'bg-emerald-400' : pd <= 182 ? 'bg-orange-300' : 'bg-violet-400';
                        return <div className={`w-1.5 h-1.5 rounded-full ${dotColor} opacity-70`} />;
                      })()}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Круг эмбриона */}
            <div className="flex justify-center py-3">
              <Embryo3D week={currentWeek} day={currentDay} onDetails={() => setShowDetails(!showDetails)} />
            </div>
            {showDetails && (
              <div className="px-5 mb-4 animate-fade-in-up">
                <WeekInfo week={currentWeek} />
              </div>
            )}

            {/* Карточки */}
            <div className="px-5 mt-1">
              <h2 className="font-cormorant text-2xl font-semibold text-foreground mb-3">{t.myDiary}</h2>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                <div className="flex-shrink-0 w-[130px]">
                  <button onClick={() => setActiveTab('development')}
                    className="w-full bg-card rounded-2xl p-4 h-[140px] flex flex-col justify-between border border-border/40 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left">
                    <p className="font-golos text-sm font-medium text-foreground leading-tight">
                      {lang === 'ru' ? 'Записать симптомы' : 'Log symptoms'}
                    </p>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Icon name="Plus" size={20} className="text-white" />
                    </div>
                  </button>
                </div>
                {/* Кнопка настройки беременности */}
                <div className="flex-shrink-0 w-[130px]">
                  <button onClick={() => setShowPregnancyCalendar(true)}
                    className="w-full rounded-2xl p-4 h-[140px] flex flex-col justify-between border-2 border-primary/40 bg-card shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left">
                    <div>
                      <p className="font-golos text-[10px] text-primary font-medium">{lang === 'ru' ? 'Настройка' : 'Setup'}</p>
                      <p className="font-golos text-sm font-medium text-foreground leading-tight mt-0.5">{t.setPregnancyStart}</p>
                    </div>
                    <span className="text-3xl self-end">📅</span>
                  </button>
                </div>
                <div className="flex-shrink-0 w-[130px]">
                  <button onClick={() => setActiveTab('tips')}
                    className="w-full rounded-2xl p-4 h-[140px] flex flex-col justify-between border-2 border-primary/40 bg-card shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left">
                    <div>
                      <p className="font-golos text-[10px] text-primary font-medium">{lang === 'ru' ? 'Питание' : 'Nutrition'}</p>
                      <p className="font-golos text-sm font-medium text-foreground leading-tight mt-0.5">
                        {lang === 'ru' ? `Что есть на ${currentWeek} нед` : `Week ${currentWeek} nutrition`}
                      </p>
                    </div>
                    <span className="text-3xl self-end">🥗</span>
                  </button>
                </div>
                <div className="flex-shrink-0 w-[130px]">
                  <button onClick={() => setActiveTab('tips')}
                    className="w-full rounded-2xl p-4 h-[140px] flex flex-col justify-between border border-border/40 bg-card shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left">
                    <div>
                      <p className="font-golos text-[10px] text-muted-foreground font-medium">{lang === 'ru' ? 'Активность' : 'Activity'}</p>
                      <p className="font-golos text-sm font-medium text-foreground leading-tight mt-0.5">
                        {lang === 'ru' ? 'Упражнения для мамы' : 'Exercises for moms'}
                      </p>
                    </div>
                    <span className="text-3xl self-end">🧘‍♀️</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 mt-3">
              <WellbeingTracker week={currentWeek} />
            </div>

            {/* Статистика */}
            <div className="px-5 mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: '🎀', label: t.trimester, value: currentWeek <= 13 ? 'I' : currentWeek <= 26 ? 'II' : 'III' },
                { icon: '❤️', label: t.untilBirth, value: `${daysLeft} ${t.days(daysLeft)}` },
                { icon: '📅', label: t.dueDate, value: dueDateState.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' }) },
              ].map((s, i) => (
                <div key={i} className="card-soft rounded-2xl p-3 text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="font-golos text-[10px] text-muted-foreground mt-1">{s.label}</p>
                  <p className="font-cormorant text-base font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="px-5 mt-4">
              <button onClick={() => setAppMode('cycle')}
                className="w-full card-soft rounded-2xl py-3.5 flex items-center justify-center gap-3 hover:bg-primary/5 transition-all group">
                <span className="text-xl">🌙</span>
                <span className="font-golos text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t.switchToCycle}</span>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* ===== МАЛЫШ ===== */}
        {activeTab === 'embryo' && (
          <div className="px-5 pt-4 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-cormorant text-3xl font-semibold text-foreground">{lang === 'ru' ? 'Наш малыш' : 'Our Baby'}</h1>
            </div>
            <div className="card-soft rounded-3xl p-5">
              <div className="flex items-center justify-center gap-3 mb-4">
                <button onClick={() => handleWeekChange(currentWeek - 1)}
                  className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all">
                  <Icon name="ChevronLeft" size={18} className="text-primary" />
                </button>
                <span className="font-cormorant text-2xl font-semibold text-foreground">{currentWeek} {t.weekLabel}</span>
                <button onClick={() => handleWeekChange(currentWeek + 1)}
                  className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all">
                  <Icon name="ChevronRight" size={18} className="text-primary" />
                </button>
              </div>
              <div className="flex justify-center">
                <Embryo3D week={currentWeek} day={currentDay} />
              </div>
            </div>
            <div className="card-soft rounded-3xl p-5">
              <p className="font-golos text-xs text-muted-foreground mb-3">
                {lang === 'ru' ? 'Посмотри малыша на разных сроках' : 'View baby at different stages'}
              </p>
              <input type="range" min={1} max={40} value={currentWeek}
                onChange={e => handleWeekChange(Number(e.target.value))}
                className="w-full" style={{ accentColor: 'hsl(340, 65%, 62%)' }} />
              <div className="flex justify-between font-golos text-xs text-muted-foreground mt-1.5">
                <span>1 {t.weekShort}</span>
                <span className="text-primary font-semibold">{currentWeek} {t.weekShort}</span>
                <span>40 {t.weekShort}</span>
              </div>
            </div>
            <WeekInfo week={currentWeek} />
          </div>
        )}

        {/* ===== РАЗВИТИЕ ===== */}
        {activeTab === 'development' && (
          <div className="px-5 pt-4 space-y-4 animate-fade-in-up">
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-2">{t.navDevelopment}</h1>
            <div className="flex items-center gap-3">
              <button onClick={() => handleWeekChange(currentWeek - 1)} className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all">
                <Icon name="ChevronLeft" size={18} className="text-primary" />
              </button>
              <div className="flex-1 text-center">
                <p className="font-cormorant text-xl font-semibold text-foreground">{currentWeek} {t.weekLabel}</p>
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
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-2">{t.navTips}</h1>
            {TIPS.map((tip, i) => (
              <div key={i} className={`card-soft rounded-3xl p-5 ${tip.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <h3 className="font-cormorant text-xl font-semibold text-foreground">{tip.title}</h3>
                    <p className="font-golos text-xs text-muted-foreground">{lang === 'ru' ? 'Недели' : 'Weeks'} {tip.week}</p>
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
            <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-2">{t.navProfile}</h1>
            <div className="card-soft rounded-3xl p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blush to-lavender mx-auto flex items-center justify-center mb-3 shadow-md">
                <span className="text-4xl">🌸</span>
              </div>
              {editingProfile ? (
                <div className="space-y-3 text-left mt-2">
                  <div>
                    <label className="font-golos text-xs text-muted-foreground mb-1 block">{lang === 'ru' ? 'Имя' : 'Name'}</label>
                    <input value={profileName} onChange={e => setProfileName(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-white/60 dark:bg-white/5 px-3 py-2 font-golos text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <button onClick={() => setEditingProfile(false)}
                    className="w-full bg-primary text-white rounded-2xl py-2.5 font-golos text-sm font-medium hover:bg-primary/90 transition-all">
                    {t.save}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-cormorant text-2xl font-semibold text-foreground">{profileName}</h2>
                  <p className="font-golos text-sm text-muted-foreground mt-1">{currentWeek} {t.weekLabel} {lang === 'ru' ? 'беременности' : 'of pregnancy'}</p>
                  <button onClick={() => setEditingProfile(true)}
                    className="mt-3 px-5 py-2 rounded-xl border border-primary/30 font-golos text-sm text-primary hover:bg-blush/50 transition-all">
                    {t.edit}
                  </button>
                </>
              )}
            </div>

            {/* Настройка беременности */}
            <button onClick={() => setShowPregnancyCalendar(true)}
              className="w-full card-soft rounded-2xl p-4 flex items-center gap-3 hover:bg-primary/5 transition-all group">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">📅</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-golos text-sm font-medium text-foreground group-hover:text-primary">{t.setPregnancyStart}</p>
                <p className="font-golos text-xs text-muted-foreground">
                  {lang === 'ru' ? 'От ПМЦ, дня зачатия или ПДР' : 'From LMP, conception or due date'}
                </p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary" />
            </button>

            {/* Тема */}
            <div className="card-soft rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Icon name={darkMode ? 'Moon' : 'Sun'} size={18} className="text-foreground" />
                </div>
                <div>
                  <p className="font-golos text-sm font-medium text-foreground">{t.theme}</p>
                  <p className="font-golos text-xs text-muted-foreground">{darkMode ? t.themeDark : t.themeLight}</p>
                </div>
              </div>
              <button onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${darkMode ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${darkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Режим */}
            <div className="card-soft rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg">{appMode === 'pregnancy' ? '🤰' : '🌙'}</span>
                </div>
                <div>
                  <p className="font-golos text-sm font-medium text-foreground">{t.mode}</p>
                  <p className="font-golos text-xs text-muted-foreground">{appMode === 'pregnancy' ? t.pregnancyMode : t.cycleMode}</p>
                </div>
              </div>
              <button onClick={() => setAppMode(appMode === 'pregnancy' ? 'cycle' : 'pregnancy')}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${appMode === 'cycle' ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${appMode === 'cycle' ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t.weekLabel, value: `${currentWeek}`, emoji: '📅' },
                { label: t.untilBirth, value: `${daysLeft} ${t.days(daysLeft)}`, emoji: '🎀' },
                { label: t.trimester, value: currentWeek <= 13 ? lang === 'ru' ? 'Первый' : 'First' : currentWeek <= 26 ? lang === 'ru' ? 'Второй' : 'Second' : lang === 'ru' ? 'Третий' : 'Third', emoji: '🌸' },
                { label: t.dueDate, value: dueDateState.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' }), emoji: '💕' },
              ].map((stat, i) => (
                <div key={i} className="card-soft rounded-2xl p-4">
                  <span className="text-2xl">{stat.emoji}</span>
                  <p className="font-golos text-xs text-muted-foreground mt-2">{stat.label}</p>
                  <p className="font-cormorant text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="card-soft rounded-3xl p-5">
              <p className="font-cormorant text-lg font-semibold text-foreground mb-2">
                {lang === 'ru' ? 'Настроить неделю' : 'Adjust week'}
              </p>
              <input type="range" min={1} max={40} value={currentWeek}
                onChange={e => handleWeekChange(Number(e.target.value))}
                className="w-full" style={{ accentColor: 'hsl(340, 65%, 62%)' }} />
              <div className="flex justify-between font-golos text-xs text-muted-foreground mt-1.5">
                <span>1</span>
                <span className="text-primary font-semibold">{currentWeek} {t.weekShort}</span>
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

      {/* Полный календарь беременности */}
      {showPregnancyCalendar && (
        <PregnancyCalendar
          pregnancyStart={pregnancyStart}
          dueDate={dueDateState}
          onClose={() => setShowPregnancyCalendar(false)}
          onSave={handlePregnancySave}
          onSelectDate={(date) => {
            handleDateClick(date);
            setShowPregnancyCalendar(false);
          }}
        />
      )}
    </div>
  );
};

export default Index;
