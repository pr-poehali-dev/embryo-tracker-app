import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

interface WellbeingTrackerProps {
  week: number;
}

interface DayEntry {
  mood: number;
  symptoms: string[];
  note: string;
  weight?: string;
  pressure?: string;
}

const MOODS = [
  { value: 1, emoji: '😔', label: 'Тяжело' },
  { value: 2, emoji: '😕', label: 'Не очень' },
  { value: 3, emoji: '😊', label: 'Хорошо' },
  { value: 4, emoji: '😄', label: 'Отлично' },
  { value: 5, emoji: '🥰', label: 'Прекрасно' },
];

const SYMPTOMS_LIST = [
  { id: 'nausea', label: 'Тошнота', icon: '🤢' },
  { id: 'fatigue', label: 'Усталость', icon: '😴' },
  { id: 'back', label: 'Спина', icon: '🔙' },
  { id: 'swelling', label: 'Отёки', icon: '💧' },
  { id: 'heartburn', label: 'Изжога', icon: '🔥' },
  { id: 'movements', label: 'Шевеления', icon: '🤲' },
  { id: 'headache', label: 'Голова', icon: '🤕' },
  { id: 'appetite', label: 'Аппетит', icon: '🍽️' },
];

const WellbeingTracker: React.FC<WellbeingTrackerProps> = ({ week }) => {
  const [entry, setEntry] = useState<DayEntry>({
    mood: 3,
    symptoms: [],
    note: '',
    weight: '',
    pressure: '',
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'mood' | 'symptoms' | 'measures'>('mood');

  const toggleSymptom = (id: string) => {
    setEntry(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(id)
        ? prev.symptoms.filter(s => s !== id)
        : [...prev.symptoms, id],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'mood' as const, label: 'Настроение', icon: 'Heart' },
    { id: 'symptoms' as const, label: 'Симптомы', icon: 'Activity' },
    { id: 'measures' as const, label: 'Показатели', icon: 'TrendingUp' },
  ];

  return (
    <div className="card-soft rounded-3xl p-5 w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-lavender flex items-center justify-center">
          <Icon name="Heart" size={16} className="text-accent-foreground" />
        </div>
        <div>
          <h3 className="font-cormorant text-lg font-semibold text-foreground">Самочувствие сегодня</h3>
          <p className="font-golos text-xs text-muted-foreground">{week} неделя беременности</p>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 mb-4 bg-muted rounded-2xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-2 rounded-xl font-golos text-xs font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Настроение */}
      {activeTab === 'mood' && (
        <div className="animate-fade-in-up">
          <p className="font-golos text-sm text-muted-foreground mb-3">Как ты себя чувствуешь?</p>
          <div className="flex justify-between gap-2 mb-4">
            {MOODS.map(mood => (
              <button
                key={mood.value}
                onClick={() => { setEntry(prev => ({ ...prev, mood: mood.value })); setSaved(false); }}
                className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all duration-200
                  ${entry.mood === mood.value
                    ? 'bg-primary/15 scale-110 shadow-sm'
                    : 'hover:bg-muted hover:scale-105'}`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className={`font-golos text-[10px] mt-1 ${entry.mood === mood.value ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          {/* Заметка */}
          <div>
            <label className="font-golos text-xs text-muted-foreground mb-1.5 block">Заметка дня</label>
            <textarea
              value={entry.note}
              onChange={e => { setEntry(prev => ({ ...prev, note: e.target.value })); setSaved(false); }}
              placeholder="Запиши мысли, ощущения, пожелания себе..."
              className="w-full rounded-2xl border border-border/60 bg-white/60 px-3 py-2.5 font-golos text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Симптомы */}
      {activeTab === 'symptoms' && (
        <div className="animate-fade-in-up">
          <p className="font-golos text-sm text-muted-foreground mb-3">Отметь, что беспокоит сегодня</p>
          <div className="grid grid-cols-4 gap-2">
            {SYMPTOMS_LIST.map(sym => (
              <button
                key={sym.id}
                onClick={() => toggleSymptom(sym.id)}
                className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all duration-200
                  ${entry.symptoms.includes(sym.id)
                    ? 'bg-primary/15 scale-105 shadow-sm border border-primary/20'
                    : 'bg-white/50 hover:bg-muted border border-border/30 hover:scale-105'}`}
              >
                <span className="text-xl mb-1">{sym.icon}</span>
                <span className={`font-golos text-[10px] text-center leading-tight
                  ${entry.symptoms.includes(sym.id) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {sym.label}
                </span>
              </button>
            ))}
          </div>
          {entry.symptoms.length > 0 && (
            <p className="font-golos text-xs text-muted-foreground mt-3 text-center">
              Отмечено: {entry.symptoms.length} симптом{entry.symptoms.length !== 1 ? 'а' : ''}
            </p>
          )}
        </div>
      )}

      {/* Показатели */}
      {activeTab === 'measures' && (
        <div className="animate-fade-in-up space-y-3">
          <p className="font-golos text-sm text-muted-foreground mb-1">Физические показатели</p>

          <div>
            <label className="font-golos text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <span>⚖️</span> Вес (кг)
            </label>
            <input
              type="number"
              value={entry.weight}
              onChange={e => { setEntry(prev => ({ ...prev, weight: e.target.value })); setSaved(false); }}
              placeholder="65.5"
              className="w-full rounded-xl border border-border/60 bg-white/60 px-3 py-2 font-golos text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label className="font-golos text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <span>❤️</span> Давление (мм рт. ст.)
            </label>
            <input
              type="text"
              value={entry.pressure}
              onChange={e => { setEntry(prev => ({ ...prev, pressure: e.target.value })); setSaved(false); }}
              placeholder="120/80"
              className="w-full rounded-xl border border-border/60 bg-white/60 px-3 py-2 font-golos text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div className="bg-blush/40 rounded-2xl p-3">
            <p className="font-golos text-xs text-muted-foreground">💡 Норма давления при беременности: 90–140 / 60–90 мм рт. ст.</p>
          </div>
        </div>
      )}

      {/* Кнопка сохранить */}
      <button
        onClick={handleSave}
        className={`w-full mt-4 py-2.5 rounded-2xl font-golos text-sm font-medium transition-all duration-300
          ${saved
            ? 'bg-mint text-foreground'
            : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:scale-[1.02]'}`}
      >
        {saved ? '✓ Сохранено!' : 'Сохранить запись'}
      </button>
    </div>
  );
};

export default WellbeingTracker;
