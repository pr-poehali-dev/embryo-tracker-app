import React, { useState } from 'react';
import Embryo3D from '@/components/Embryo3D';
import WeekCalendar from '@/components/WeekCalendar';
import WellbeingTracker from '@/components/WellbeingTracker';
import WeekInfo from '@/components/WeekInfo';
import Icon from '@/components/ui/icon';

type Tab = 'home' | 'embryo' | 'development' | 'tips' | 'profile';

const PREGNANCY_START = new Date(2025, 5, 15);

function getCurrentWeek(start: Date): number {
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.min(40, Math.max(1, Math.floor(days / 7) + 1));
}

const TIPS = [
  { week: '1–13', title: 'I триместр', icon: '🌱', color: 'bg-peach/60', items: ['Принимай фолиевую кислоту 400 мкг/день', 'Откажись от алкоголя и сигарет', 'Первый визит к гинекологу до 12 нед', 'Имбирный чай помогает при тошноте'] },
  { week: '14–26', title: 'II триместр', icon: '🌸', color: 'bg-blush/60', items: ['Второй скрининг на 18–21 нед', 'Начни разговаривать с малышом', 'Гимнастика для беременных', 'Сон на левом боку'] },
  { week: '27–40', title: 'III триместр', icon: '🎀', color: 'bg-lavender/60', items: ['Курсы подготовки к родам', 'Следи за шевелениями ежедневно', 'Собери сумку в роддом заранее', 'Отдыхай и береги себя'] },
  { week: 'Питание', title: 'Питание', icon: '🥗', color: 'bg-mint/60', items: ['Белок: мясо, рыба, яйца, бобовые', 'Кальций: молочные продукты', 'Железо: говядина, шпинат, гранат', 'Избегай сырой рыбы и мягких сыров'] },
];

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeek(PREGNANCY_START));
  const [profileName, setProfileName] = useState('Мама');
  const [dueDate, setDueDate] = useState('2026-03-08');
  const [editingProfile, setEditingProfile] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const daysLeft = Math.max(0, Math.round(
    (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ));

  const handleWeekChange = (week: number) => {
    setCurrentWeek(week);
    setAnimKey(k => k + 1);
  };

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'embryo', icon: 'Baby', label: 'Малыш' },
    { id: 'development', icon: 'BookOpen', label: 'Развитие' },
    { id: 'tips', icon: 'Lightbulb', label: 'Советы' },
    { id: 'profile', icon: 'User', label: 'Профиль' },
  ];

  const pageTitle: Record<Tab, string> = {
    home: 'Твой дневник',
    embryo: 'Наш малыш',
    development: 'Развитие',
    tips: 'Советы',
    profile: 'Профиль',
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Декоративные пузыри фона */}
      <div className="bg-bubbles">
        <div className="bubble w-64 h-64 bg-blush" style={{ top: '-5%', left: '-10%', animationDelay: '0s' }} />
        <div className="bubble w-48 h-48 bg-lavender" style={{ top: '15%', right: '-8%', animationDelay: '3s' }} />
        <div className="bubble w-80 h-80 bg-peach" style={{ bottom: '10%', left: '-15%', animationDelay: '6s' }} />
        <div className="bubble w-56 h-56 bg-mint" style={{ bottom: '25%', right: '-10%', animationDelay: '9s' }} />
        <div className="bubble w-32 h-32 bg-blush" style={{ top: '45%', left: '45%', animationDelay: '12s' }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto pb-28">

        {/* Шапка */}
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-golos text-sm text-muted-foreground">Привет, {profileName} 🌸</p>
              <h1 className="font-cormorant text-3xl font-semibold text-foreground leading-tight">
                {pageTitle[activeTab]}
              </h1>
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blush to-lavender flex items-center justify-center shadow-md">
                <span className="font-cormorant text-2xl font-semibold text-primary">{currentWeek}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                <span className="font-golos text-[8px] text-primary font-medium">нед</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ГЛАВНАЯ ===== */}
        {activeTab === 'home' && (
          <div className="px-5 space-y-4 animate-fade-in-up">

            {/* Баннер */}
            <div className="card-soft rounded-3xl p-5 bg-gradient-to-br from-white/80 to-blush/30">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-24 h-24">
                  <Embryo3D week={currentWeek} />
                </div>
                <div>
                  <p className="font-golos text-xs text-muted-foreground uppercase tracking-wide mb-1">До встречи</p>
                  <p className="font-cormorant text-5xl font-light shimmer-text">{daysLeft}</p>
                  <p className="font-golos text-sm text-muted-foreground">дней осталось</p>
                </div>
              </div>
            </div>

            {/* Переключатель недели */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWeekChange(Math.max(1, currentWeek - 1))}
                className="w-10 h-10 rounded-full bg-white/80 border border-border/40 flex items-center justify-center hover:bg-blush transition-all hover:scale-110 shadow-sm"
              >
                <Icon name="ChevronLeft" size={18} className="text-primary" />
              </button>
              <div key={animKey} className="flex-1 text-center animate-week-change">
                <p className="font-cormorant text-xl font-medium text-foreground">{currentWeek} неделя</p>
                <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <div className="week-progress h-full" style={{ width: `${(currentWeek / 40) * 100}%` }} />
                </div>
              </div>
              <button
                onClick={() => handleWeekChange(Math.min(40, currentWeek + 1))}
                className="w-10 h-10 rounded-full bg-white/80 border border-border/40 flex items-center justify-center hover:bg-blush transition-all hover:scale-110 shadow-sm"
              >
                <Icon name="ChevronRight" size={18} className="text-primary" />
              </button>
            </div>

            {/* Календарь */}
            <WeekCalendar
              currentWeek={currentWeek}
              onWeekChange={handleWeekChange}
              startDate={PREGNANCY_START}
            />

            {/* Трекер */}
            <WellbeingTracker week={currentWeek} />

            {/* Быстрый статус */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🎀', label: 'Пол', value: 'Тайна' },
                { icon: '❤️', label: 'Сердце', value: 'Стучит' },
                { icon: '📅', label: 'Роды', value: new Date(dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' }) },
              ].map((s, i) => (
                <div key={i} className="card-soft rounded-2xl p-3 text-center">
                  <span className="text-2xl">{s.icon}</span>
                  <p className="font-golos text-xs text-muted-foreground mt-1">{s.label}</p>
                  <p className="font-cormorant text-sm font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== МАЛЫШ (3D) ===== */}
        {activeTab === 'embryo' && (
          <div className="px-5 space-y-4 animate-fade-in-up">
            <div className="card-soft rounded-3xl p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <button
                  onClick={() => handleWeekChange(Math.max(1, currentWeek - 1))}
                  className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110"
                >
                  <Icon name="ChevronLeft" size={18} className="text-primary" />
                </button>
                <span className="font-cormorant text-2xl font-semibold text-foreground">{currentWeek} неделя</span>
                <button
                  onClick={() => handleWeekChange(Math.min(40, currentWeek + 1))}
                  className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110"
                >
                  <Icon name="ChevronRight" size={18} className="text-primary" />
                </button>
              </div>

              <div key={animKey} className="flex justify-center animate-week-change">
                <Embryo3D week={currentWeek} />
              </div>
            </div>

            {/* Слайдер */}
            <div className="card-soft rounded-3xl p-5">
              <p className="font-golos text-xs text-muted-foreground mb-3">Перемести, чтобы увидеть малыша на разных неделях</p>
              <input
                type="range"
                min={1}
                max={40}
                value={currentWeek}
                onChange={e => handleWeekChange(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'hsl(340, 45%, 72%)' }}
              />
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
          <div className="px-5 space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => handleWeekChange(Math.max(1, currentWeek - 1))}
                className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all"
              >
                <Icon name="ChevronLeft" size={18} className="text-primary" />
              </button>
              <div className="flex-1 text-center">
                <p className="font-cormorant text-xl font-semibold text-foreground">{currentWeek} неделя</p>
              </div>
              <button
                onClick={() => handleWeekChange(Math.min(40, currentWeek + 1))}
                className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-primary/20 transition-all"
              >
                <Icon name="ChevronRight" size={18} className="text-primary" />
              </button>
            </div>
            <div key={animKey} className="animate-week-change">
              <WeekInfo week={currentWeek} />
            </div>
          </div>
        )}

        {/* ===== СОВЕТЫ ===== */}
        {activeTab === 'tips' && (
          <div className="px-5 space-y-4 animate-fade-in-up">
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
                      <div className="w-5 h-5 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0 mt-0.5">
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
          <div className="px-5 space-y-4 animate-fade-in-up">
            <div className="card-soft rounded-3xl p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blush to-lavender mx-auto flex items-center justify-center mb-3 shadow-md">
                <span className="text-4xl">🌸</span>
              </div>
              {editingProfile ? (
                <div className="space-y-3 text-left mt-2">
                  <div>
                    <label className="font-golos text-xs text-muted-foreground mb-1 block">Имя</label>
                    <input
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-white/60 px-3 py-2 font-golos text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="font-golos text-xs text-muted-foreground mb-1 block">Предполагаемая дата родов</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-white/60 px-3 py-2 font-golos text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="w-full bg-primary text-white rounded-2xl py-2.5 font-golos text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    Сохранить
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-cormorant text-2xl font-semibold text-foreground">{profileName}</h2>
                  <p className="font-golos text-sm text-muted-foreground mt-1">{currentWeek} неделя беременности</p>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="mt-3 px-5 py-2 rounded-xl border border-primary/30 font-golos text-sm text-primary hover:bg-blush/50 transition-all"
                  >
                    Редактировать профиль
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Текущая неделя', value: `${currentWeek} нед`, emoji: '📅' },
                { label: 'До родов', value: `${daysLeft} дней`, emoji: '🎀' },
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
              <input
                type="range"
                min={1}
                max={40}
                value={currentWeek}
                onChange={e => handleWeekChange(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'hsl(340, 45%, 72%)' }}
              />
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
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200
                  ${activeTab === item.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  className={activeTab === item.id ? 'text-primary' : 'text-muted-foreground'}
                />
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
