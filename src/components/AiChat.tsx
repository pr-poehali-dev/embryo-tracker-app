import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { detectLang } from '@/i18n';

const lang = detectLang();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatProps {
  cycleDay?: number;
  phase?: string;
  pregnancyWeek?: number;
  mode?: 'cycle' | 'pregnancy';
}

const QUICK_QUESTIONS_RU = [
  { emoji: '🌹', text: 'Как облегчить боль при месячных?' },
  { emoji: '✨', text: 'Как определить день овуляции?' },
  { emoji: '🥗', text: 'Что есть во время беременности?' },
  { emoji: '😔', text: 'Как справиться с ПМС?' },
  { emoji: '💊', text: 'Какие витамины при планировании?' },
  { emoji: '🧘‍♀️', text: 'Какие упражнения при беременности?' },
];

const QUICK_QUESTIONS_EN = [
  { emoji: '🌹', text: 'How to relieve period pain?' },
  { emoji: '✨', text: 'How to detect ovulation?' },
  { emoji: '🥗', text: 'What to eat during pregnancy?' },
  { emoji: '😔', text: 'How to deal with PMS?' },
  { emoji: '💊', text: 'What vitamins for conception planning?' },
  { emoji: '🧘‍♀️', text: 'What exercises are safe in pregnancy?' },
];

const QUICK_QUESTIONS = lang === 'ru' ? QUICK_QUESTIONS_RU : QUICK_QUESTIONS_EN;

const WELCOME_RU = `Привет! 🌸 Я твой личный помощник по женскому здоровью.

Могу рассказать о:
• Фазах цикла и их влиянии на самочувствие
• Беременности и развитии малыша
• Питании, витаминах и образе жизни
• Симптомах и когда стоит обратиться к врачу

Спроси что тебя интересует или выбери быстрый вопрос ниже 👇`;

const WELCOME_EN = `Hi there! 🌸 I'm your personal women's health assistant.

I can help with:
• Cycle phases and how they affect your wellbeing
• Pregnancy and baby development
• Nutrition, vitamins and lifestyle
• Symptoms and when to see a doctor

Ask me anything or pick a quick question below 👇`;

const AI_URL = 'https://functions.poehali.dev/b76f7a57-da92-4094-8c58-c546c51eb15d';

const AiChat: React.FC<AiChatProps> = ({ cycleDay, phase, pregnancyWeek, mode }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: lang === 'ru' ? WELCOME_RU : WELCOME_EN }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== 'assistant' || newMessages.indexOf(m) > 0).slice(-20),
          lang,
          context: { cycleDay, phase, pregnancyWeek, mode },
        }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || '...' }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'ru'
          ? 'Извини, произошла ошибка. Попробуй ещё раз 🌸'
          : 'Sorry, something went wrong. Please try again 🌸'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Контекстная плашка */}
      {(cycleDay || pregnancyWeek) && (
        <div className="px-4 py-2 bg-primary/8 border-b border-primary/20 flex items-center gap-2">
          <span className="text-sm">{mode === 'pregnancy' ? '🤰' : '🌙'}</span>
          <p className="font-golos text-xs text-primary font-medium">
            {mode === 'cycle' && cycleDay
              ? lang === 'ru' ? `День цикла ${cycleDay} · ${phase ? ({
                menstrual: 'Менструальная фаза',
                follicular: 'Фолликулярная фаза',
                ovulation: 'Овуляция',
                luteal: 'Лютеиновая фаза'
              } as Record<string,string>)[phase] : ''} — расскажу подробнее!` : `Cycle day ${cycleDay}`
              : lang === 'ru' ? `Неделя беременности ${pregnancyWeek}` : `Pregnancy week ${pregnancyWeek}`}
          </p>
        </div>
      )}

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'none' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blush to-lavender flex items-center justify-center mr-2 flex-shrink-0 mt-auto">
                <span className="text-sm">🌸</span>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 font-golos text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-card border border-border/40 text-foreground rounded-bl-sm'}`}
            >
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}

        {/* Индикатор загрузки */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blush to-lavender flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-sm">🌸</span>
            </div>
            <div className="bg-card border border-border/40 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Быстрые вопросы (только если мало сообщений) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q.text)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-card border border-border/50 rounded-full px-3 py-2 hover:bg-primary/8 hover:border-primary/30 transition-all">
                <span className="text-sm">{q.emoji}</span>
                <span className="font-golos text-xs text-foreground whitespace-nowrap">{q.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Поле ввода */}
      <div className="px-4 pb-4 pt-2 border-t border-border/20">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={lang === 'ru' ? 'Задай вопрос о здоровье...' : 'Ask a health question...'}
            className="flex-1 bg-card border border-border/60 rounded-2xl px-4 py-3 font-golos text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 flex-shrink-0"
          >
            <Icon name="Send" size={18} className="text-white" />
          </button>
        </form>
        <p className="font-golos text-[10px] text-muted-foreground/60 text-center mt-2">
          {lang === 'ru' ? 'Не заменяет консультацию врача' : 'Not a substitute for medical advice'}
        </p>
      </div>
    </div>
  );
};

export default AiChat;
