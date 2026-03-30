import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

interface SettingItem {
  icon: string;
  label: string;
  sublabel?: string;
  action?: () => void;
  danger?: boolean;
}

interface CycleSettingsProps {
  onClose: () => void;
  cycleLength: number;
  onCycleLengthChange: (n: number) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

const CycleSettings: React.FC<CycleSettingsProps> = ({
  onClose, cycleLength, onCycleLengthChange, darkMode, onDarkModeToggle,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [reminders, setReminders] = useState({ period: true, ovulation: false, pill: false });
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [hideContent, setHideContent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInvite = () => {
    navigator.clipboard?.writeText('Попробуй это приложение для трекинга цикла!').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sections: { items: SettingItem[] }[] = [
    {
      items: [
        {
          icon: 'ClipboardList',
          label: 'Отчет для врача',
          action: () => setActiveSection('report'),
        },
        {
          icon: 'Gift',
          label: 'Пригласить друзей',
          action: handleInvite,
        },
      ],
    },
    {
      items: [
        { icon: 'EyeOff', label: 'Скрыть контент', action: () => setActiveSection('hide') },
        { icon: 'Lock', label: 'Блокировка приложения', action: () => setActiveSection('lock') },
        { icon: 'TrendingUp', label: 'Графики и отчеты', action: () => setActiveSection('charts') },
        { icon: 'RefreshCw', label: 'Цикл и овуляция', action: () => setActiveSection('cycle') },
        { icon: 'Settings', label: 'Настройки приложения', action: () => setActiveSection('app') },
        { icon: 'ShieldCheck', label: 'Настройки конфиденциальности', action: () => setActiveSection('privacy') },
        { icon: 'Bell', label: 'Напоминания', action: () => setActiveSection('reminders') },
        { icon: 'HelpCircle', label: 'Помощь', action: () => setActiveSection('help') },
      ],
    },
  ];

  // --- Подэкраны ---

  if (activeSection === 'report') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Отчет для врача">
        <div className="px-5 py-4 space-y-4">
          <div className="card-soft rounded-2xl p-5">
            <p className="font-golos text-sm text-foreground/80 mb-4">
              Сформируй отчёт о своём цикле за последние 3 месяца и покажи врачу.
            </p>
            {[
              { label: 'Средняя длина цикла', value: `${cycleLength} дней` },
              { label: 'Регулярность', value: 'Регулярный' },
              { label: 'Отмечено симптомов', value: '12' },
              { label: 'Период наблюдений', value: '3 месяца' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border/30 last:border-0">
                <span className="font-golos text-sm text-muted-foreground">{row.label}</span>
                <span className="font-golos text-sm font-semibold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
          <button className="w-full bg-primary text-white rounded-2xl py-3.5 font-golos text-sm font-semibold hover:bg-primary/90 transition-all">
            Скачать PDF отчёт
          </button>
        </div>
      </SettingsShell>
    );
  }

  if (activeSection === 'cycle') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Цикл и овуляция">
        <div className="px-5 py-4 space-y-4">
          <div className="card-soft rounded-2xl p-5">
            <p className="font-golos text-xs text-muted-foreground mb-3">Длина цикла</p>
            <div className="flex items-center gap-4">
              <button onClick={() => onCycleLengthChange(Math.max(21, cycleLength - 1))}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-all">
                <Icon name="Minus" size={18} className="text-foreground" />
              </button>
              <div className="flex-1 text-center">
                <span className="font-cormorant text-4xl font-bold text-primary">{cycleLength}</span>
                <p className="font-golos text-xs text-muted-foreground">дней</p>
              </div>
              <button onClick={() => onCycleLengthChange(Math.min(35, cycleLength + 1))}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-all">
                <Icon name="Plus" size={18} className="text-foreground" />
              </button>
            </div>
            <input type="range" min={21} max={35} value={cycleLength}
              onChange={e => onCycleLengthChange(Number(e.target.value))}
              className="w-full mt-4" style={{ accentColor: 'hsl(340, 65%, 62%)' }} />
            <div className="flex justify-between font-golos text-xs text-muted-foreground mt-1">
              <span>21</span><span>35</span>
            </div>
          </div>
          <div className="card-soft rounded-2xl p-5 space-y-3">
            <p className="font-golos text-xs text-muted-foreground">Фазы цикла</p>
            {[
              { phase: 'Менструальная', days: '1–5', color: 'bg-rose-400' },
              { phase: 'Фолликулярная', days: '6–13', color: 'bg-orange-300' },
              { phase: 'Овуляция', days: '14–16', color: 'bg-emerald-400' },
              { phase: 'Лютеиновая', days: '17–28', color: 'bg-violet-300' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${p.color}`} />
                <span className="font-golos text-sm text-foreground flex-1">{p.phase}</span>
                <span className="font-golos text-xs text-muted-foreground">Дни {p.days}</span>
              </div>
            ))}
          </div>
        </div>
      </SettingsShell>
    );
  }

  if (activeSection === 'reminders') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Напоминания">
        <div className="px-5 py-4 space-y-3">
          {[
            { key: 'period' as const, label: 'Начало месячных', emoji: '🩸', desc: 'За 2 дня до начала' },
            { key: 'ovulation' as const, label: 'Овуляция', emoji: '✨', desc: 'В день овуляции' },
            { key: 'pill' as const, label: 'Приём таблетки', emoji: '💊', desc: 'Ежедневно в 9:00' },
          ].map(r => (
            <div key={r.key} className="card-soft rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <div className="flex-1">
                <p className="font-golos text-sm font-semibold text-foreground">{r.label}</p>
                <p className="font-golos text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <button onClick={() => setReminders(prev => ({ ...prev, [r.key]: !prev[r.key] }))}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${reminders[r.key] ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${reminders[r.key] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </SettingsShell>
    );
  }

  if (activeSection === 'lock') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Блокировка приложения">
        <div className="px-5 py-4 space-y-4">
          <div className="card-soft rounded-2xl p-4 flex items-center gap-3">
            <Icon name="Lock" size={20} className="text-foreground" />
            <div className="flex-1">
              <p className="font-golos text-sm font-semibold text-foreground">PIN-код</p>
              <p className="font-golos text-xs text-muted-foreground">Защити приложение паролем</p>
            </div>
            <button onClick={() => setPinEnabled(!pinEnabled)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${pinEnabled ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${pinEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          {pinEnabled && (
            <div className="card-soft rounded-2xl p-4">
              <p className="font-golos text-xs text-muted-foreground mb-2">Введи 4-значный PIN</p>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-golos text-xl
                    ${i < pin.length ? 'border-primary bg-primary/10' : 'border-border/60'}`}>
                    {i < pin.length ? '●' : ''}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                  <button key={i} onClick={() => {
                    if (k === '⌫') setPin(p => p.slice(0, -1));
                    else if (k !== '' && pin.length < 4) setPin(p => p + k);
                  }} className={`h-12 rounded-2xl font-golos text-lg font-medium transition-all
                    ${k === '' ? '' : 'bg-muted hover:bg-primary/20 active:scale-95'}`}>
                    {k}
                  </button>
                ))}
              </div>
              {pin.length === 4 && (
                <button className="w-full mt-3 bg-primary text-white rounded-2xl py-2.5 font-golos text-sm font-semibold" onClick={() => setPin('')}>
                  Сохранить PIN
                </button>
              )}
            </div>
          )}
        </div>
      </SettingsShell>
    );
  }

  if (activeSection === 'hide') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Скрыть контент">
        <div className="px-5 py-4 space-y-3">
          <p className="font-golos text-sm text-muted-foreground">
            Скрой чувствительные данные от посторонних глаз
          </p>
          <div className="card-soft rounded-2xl p-4 flex items-center gap-3">
            <Icon name="EyeOff" size={20} className="text-foreground" />
            <div className="flex-1">
              <p className="font-golos text-sm font-semibold text-foreground">Скрыть данные</p>
              <p className="font-golos text-xs text-muted-foreground">Заменить цифры на «–»</p>
            </div>
            <button onClick={() => setHideContent(!hideContent)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${hideContent ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${hideContent ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </SettingsShell>
    );
  }

  if (activeSection === 'charts') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Графики и отчеты">
        <div className="px-5 py-4 space-y-3">
          {[
            { emoji: '📊', label: 'График цикла', desc: 'Визуализация последних 6 циклов' },
            { emoji: '🌡️', label: 'Базальная температура', desc: 'График ББТ' },
            { emoji: '😊', label: 'Настроение', desc: 'Динамика настроения по фазам' },
            { emoji: '💧', label: 'Симптомы', desc: 'Частота симптомов' },
          ].map((item, i) => (
            <div key={i} className="card-soft rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="font-golos text-sm font-semibold text-foreground">{item.label}</p>
                <p className="font-golos text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          ))}
        </div>
      </SettingsShell>
    );
  }

  if (activeSection === 'app') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Настройки приложения">
        <div className="px-5 py-4 space-y-3">
          <div className="card-soft rounded-2xl p-4 flex items-center gap-3">
            <Icon name={darkMode ? 'Moon' : 'Sun'} size={20} className="text-foreground" />
            <div className="flex-1">
              <p className="font-golos text-sm font-semibold text-foreground">Тёмная тема</p>
              <p className="font-golos text-xs text-muted-foreground">{darkMode ? 'Включена' : 'Выключена'}</p>
            </div>
            <button onClick={onDarkModeToggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${darkMode ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${darkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="card-soft rounded-2xl overflow-hidden">
            {[
              { label: 'Язык', value: 'Русский' },
              { label: 'Единицы температуры', value: '°C' },
              { label: 'Первый день недели', value: 'Понедельник' },
            ].map((s, i, arr) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-border/30' : ''}`}>
                <span className="font-golos text-sm text-foreground">{s.label}</span>
                <div className="flex items-center gap-1">
                  <span className="font-golos text-sm text-muted-foreground">{s.value}</span>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingsShell>
    );
  }

  if (activeSection === 'privacy') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Конфиденциальность">
        <div className="px-5 py-4 space-y-3">
          {[
            { label: 'Политика конфиденциальности', icon: 'FileText' },
            { label: 'Условия использования', icon: 'FileCheck' },
            { label: 'Удалить данные', icon: 'Trash2', danger: true },
          ].map((item, i) => (
            <button key={i} className={`w-full card-soft rounded-2xl p-4 flex items-center gap-3 hover:bg-muted transition-all text-left
              ${item.danger ? 'border border-rose-200 dark:border-rose-900/40' : ''}`}>
              <Icon name={item.icon} size={20} className={item.danger ? 'text-rose-500' : 'text-foreground'} />
              <span className={`font-golos text-sm font-medium flex-1 ${item.danger ? 'text-rose-500' : 'text-foreground'}`}>{item.label}</span>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </SettingsShell>
    );
  }

  if (activeSection === 'help') {
    return (
      <SettingsShell onClose={onClose} onBack={() => setActiveSection(null)} title="Помощь">
        <div className="px-5 py-4 space-y-3">
          {[
            { q: 'Как работает трекер цикла?', a: 'Трекер рассчитывает фазы на основе первого дня последних месячных и длины цикла.' },
            { q: 'Насколько точны предсказания?', a: 'Точность растёт с каждым введённым циклом. Приложение учитывает историю.' },
            { q: 'Можно ли использовать для контрацепции?', a: 'Приложение не является методом контрацепции. Проконсультируйся с врачом.' },
          ].map((item, i) => (
            <div key={i} className="card-soft rounded-2xl p-4">
              <p className="font-golos text-sm font-semibold text-foreground mb-1">{item.q}</p>
              <p className="font-golos text-xs text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
          <a href="https://poehali.dev/help" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-3 font-golos text-sm font-semibold hover:bg-primary/90 transition-all">
            <Icon name="MessageCircle" size={16} className="text-white" />
            Написать в поддержку
          </a>
        </div>
      </SettingsShell>
    );
  }

  // Главный экран настроек
  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-4 border-b border-border/40">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blush to-lavender flex items-center justify-center shadow-md">
          <span className="text-2xl">🐱</span>
        </div>
        <div className="flex-1">
          <h1 className="font-cormorant text-2xl font-semibold text-foreground">Меню</h1>
          <p className="font-golos text-xs text-muted-foreground">Настройки и данные</p>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-all">
          <Icon name="X" size={20} className="text-foreground" />
        </button>
      </div>

      {/* Уведомление о копировании */}
      {copied && (
        <div className="mx-5 mt-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl px-4 py-2 flex items-center gap-2">
          <Icon name="Check" size={14} className="text-emerald-600" />
          <span className="font-golos text-sm text-emerald-700 dark:text-emerald-400">Ссылка скопирована!</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3" style={{ scrollbarWidth: 'none' }}>
        {sections.map((section, si) => (
          <div key={si} className="card-soft rounded-2xl overflow-hidden">
            {section.items.map((item, ii) => (
              <button
                key={ii}
                onClick={item.action}
                className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/60 transition-all text-left
                  ${ii < section.items.length - 1 ? 'border-b border-border/30' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon} size={18} className={item.danger ? 'text-rose-500' : 'text-foreground'} />
                </div>
                <span className={`font-golos text-sm font-medium flex-1 leading-snug ${item.danger ? 'text-rose-500' : 'text-foreground'}`}>
                  {item.label}
                  {item.sublabel && <span className="block text-xs text-muted-foreground font-normal">{item.sublabel}</span>}
                </span>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        ))}

        {/* Версия */}
        <p className="text-center font-golos text-xs text-muted-foreground/50 py-2">Версия 1.0.0</p>
      </div>
    </div>
  );
};

// Переиспользуемая оболочка подэкрана
const SettingsShell: React.FC<{
  title: string;
  onClose: () => void;
  onBack: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, onBack, children }) => (
  <div className="fixed inset-0 z-40 bg-background flex flex-col max-w-md mx-auto">
    <div className="flex items-center gap-3 px-5 pt-10 pb-4 border-b border-border/40">
      <button onClick={onBack} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-all">
        <Icon name="ChevronLeft" size={20} className="text-foreground" />
      </button>
      <h1 className="font-cormorant text-2xl font-semibold text-foreground flex-1">{title}</h1>
      <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-all">
        <Icon name="X" size={20} className="text-foreground" />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {children}
    </div>
  </div>
);

export default CycleSettings;
