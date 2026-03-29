import React from 'react';
import Icon from '@/components/ui/icon';

interface WeekInfoProps {
  week: number;
}

const weekData: Record<number, {
  title: string;
  babyDesc: string;
  momDesc: string;
  tips: string[];
  size: string;
  weight: string;
  development: string[];
}> = {
  4:  {
    title: 'Первые клеточки',
    babyDesc: 'Эмбрион крошечный — всего 0.4 мм, но уже начинает формироваться!',
    momDesc: 'Возможна задержка менструации и первые признаки беременности.',
    tips: ['Начни принимать фолиевую кислоту', 'Откажись от алкоголя и табака'],
    size: '0.4 мм', weight: '< 1 г',
    development: ['Нейральная трубка', 'Сердечный зачаток', 'Плацента формируется'],
  },
  6:  {
    title: 'Сердечко бьётся',
    babyDesc: 'Размером с горошину. Сердечко уже бьётся — 100–160 ударов в минуту!',
    momDesc: 'Тошнота по утрам, чувствительность груди, усталость — всё нормально.',
    tips: ['Ешь небольшими порциями при тошноте', 'Отдыхай больше обычного'],
    size: '6 мм', weight: '< 1 г',
    development: ['Сердце сформировано', 'Зачатки ручек и ножек', 'Формируется мозг'],
  },
  8:  {
    title: 'Черты лица',
    babyDesc: 'Размером с малину. Уже есть все основные органы, начинается развитие черт лица.',
    momDesc: 'Грудь увеличивается, настроение скачет — гормоны работают.',
    tips: ['Запишись к гинекологу', 'Сдай первые анализы'],
    size: '16 мм', weight: '1 г',
    development: ['Веки формируются', 'Пальчики появляются', 'Все органы заложены'],
  },
  10: {
    title: 'Малыш двигается',
    babyDesc: 'Размером со сливой. Эмбрион активно двигается, хотя ты ещё не чувствуешь.',
    momDesc: 'Тошнота может начать уменьшаться. Живот пока почти не заметен.',
    tips: ['Первый скрининг в 10–13 нед', 'Начни думать о питании'],
    size: '3 см', weight: '4 г',
    development: ['Ноготки растут', 'Рефлексы появляются', 'Половые органы формируются'],
  },
  12: {
    title: 'Конец I триместра',
    babyDesc: 'Размером со сливой! Первый триместр завершается. Риск выкидыша снижается.',
    momDesc: 'Самочувствие улучшается у большинства мам. Тошнота уходит.',
    tips: ['Первый скрининг УЗИ', 'Расскажи близким!'],
    size: '6 см', weight: '14 г',
    development: ['Мозг активно растёт', 'Слух развивается', 'Мимика есть'],
  },
  16: {
    title: 'II триместр',
    babyDesc: 'Размером с авокадо. Малыш слышит твой голос и реагирует на звуки.',
    momDesc: 'Живот округляется, самочувствие улучшается — золотой период!',
    tips: ['Начни разговаривать с малышом', 'Делай специальную гимнастику'],
    size: '12 см', weight: '100 г',
    development: ['Слух сформирован', 'Кости крепнут', 'Мимика развита'],
  },
  20: {
    title: 'Половина пути!',
    babyDesc: 'Размером с бананом. Ты чувствуешь первые шевеления — это незабываемо!',
    momDesc: '20 недель — ровно половина пути. Живот хорошо заметен.',
    tips: ['Второй скрининг УЗИ', 'Начни фото-дневник'],
    size: '25 см', weight: '300 г',
    development: ['Шевеления ощутимы', 'Режим сна-бодрствования', 'Глотание развито'],
  },
  24: {
    title: 'Малыш слышит',
    babyDesc: 'Размером с кукурузой. Реагирует на музыку, голос папы и мамы.',
    momDesc: 'Могут появиться отёки ног, изжога. Спи на боку.',
    tips: ['Включай классическую музыку', 'Следи за давлением'],
    size: '30 см', weight: '600 г',
    development: ['Лёгкие развиваются', 'Жировая ткань копится', 'Хватательный рефлекс'],
  },
  28: {
    title: 'III триместр',
    babyDesc: 'Размером с баклажаном. Шевеления активные, малыш хорошо слышит.',
    momDesc: 'Спина болит, тяжело спать. Осталось около 3 месяцев!',
    tips: ['Курсы подготовки к родам', 'Начни собирать сумку в роддом'],
    size: '38 см', weight: '1 кг',
    development: ['Глаза открываются', 'Иммунитет формируется', 'Лёгкие почти готовы'],
  },
  32: {
    title: 'Готовимся к встрече',
    babyDesc: 'Поворачивается головой вниз. Ещё 2 месяца и встреча!',
    momDesc: 'Ложные схватки Брекстона-Хикса — тренировка матки. Норма.',
    tips: ['Собери сумку в роддом', 'Обсуди план родов с врачом'],
    size: '42 см', weight: '1.7 кг',
    development: ['Кости полностью сформированы', 'Иммунитет передаётся', 'Координация движений'],
  },
  36: {
    title: 'Совсем скоро!',
    babyDesc: 'Практически готов! Лёгкие зрелые, жировые отложения накоплены.',
    momDesc: 'Живот опускается. Дышать легче, но давление на таз усилилось.',
    tips: ['Проверь сумку в роддом', 'Изучи признаки начала родов'],
    size: '47 см', weight: '2.7 кг',
    development: ['Всё готово к рождению', 'Сосательный рефлекс силён', 'Ногти выросли'],
  },
  40: {
    title: 'Долгожданная встреча',
    babyDesc: 'Твой малыш полностью готов к появлению на свет! Это чудо рядом.',
    momDesc: 'Каждый день — это день рождения! Доверься своему телу.',
    tips: ['Прислушивайся к своему телу', 'Доверяй врачам'],
    size: '51 см', weight: '3.4 кг',
    development: ['Готов к жизни вне утробы', 'Всё развито', '💕'],
  },
};

function getWeekData(week: number) {
  const weeks = Object.keys(weekData).map(Number).sort((a, b) => a - b);
  let closest = weeks[0];
  for (const w of weeks) {
    if (w <= week) closest = w;
  }
  return weekData[closest];
}

const WeekInfo: React.FC<WeekInfoProps> = ({ week }) => {
  const data = getWeekData(week);
  const progress = (week / 40) * 100;

  const trimester = week <= 13 ? 'I триместр' : week <= 26 ? 'II триместр' : 'III триместр';
  const trimesterColor = week <= 13 ? 'bg-peach text-orange-700' : week <= 26 ? 'bg-mint text-green-700' : 'bg-lavender text-purple-700';

  return (
    <div className="space-y-3">
      {/* Заголовок недели */}
      <div className="card-soft rounded-3xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-golos text-xs px-2.5 py-0.5 rounded-full font-medium ${trimesterColor}`}>
                {trimester}
              </span>
            </div>
            <h2 className="font-cormorant text-2xl font-semibold text-foreground">{data.title}</h2>
          </div>
          <div className="text-right">
            <span className="font-cormorant text-4xl font-light shimmer-text">{week}</span>
            <p className="font-golos text-xs text-muted-foreground">неделя</p>
          </div>
        </div>

        {/* Прогресс */}
        <div className="mb-1">
          <div className="flex justify-between font-golos text-xs text-muted-foreground mb-1">
            <span>Прогресс беременности</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="week-progress h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          <div className="flex-1 bg-blush/50 rounded-2xl p-2.5 text-center">
            <p className="font-golos text-xs text-muted-foreground">Размер</p>
            <p className="font-cormorant text-base font-semibold text-foreground">{data.size}</p>
          </div>
          <div className="flex-1 bg-peach/50 rounded-2xl p-2.5 text-center">
            <p className="font-golos text-xs text-muted-foreground">Вес</p>
            <p className="font-cormorant text-base font-semibold text-foreground">{data.weight}</p>
          </div>
          <div className="flex-1 bg-lavender/50 rounded-2xl p-2.5 text-center">
            <p className="font-golos text-xs text-muted-foreground">Осталось</p>
            <p className="font-cormorant text-base font-semibold text-foreground">{40 - week} нед</p>
          </div>
        </div>
      </div>

      {/* О малыше */}
      <div className="card-soft rounded-3xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🫀</span>
          <h4 className="font-cormorant text-base font-semibold text-foreground">О малыше</h4>
        </div>
        <p className="font-golos text-sm text-muted-foreground leading-relaxed">{data.babyDesc}</p>

        <div className="mt-3 space-y-1.5">
          {data.development.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="font-golos text-sm text-foreground/80">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* О маме */}
      <div className="card-soft rounded-3xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🌸</span>
          <h4 className="font-cormorant text-base font-semibold text-foreground">Что чувствует мама</h4>
        </div>
        <p className="font-golos text-sm text-muted-foreground leading-relaxed">{data.momDesc}</p>
      </div>

      {/* Советы */}
      <div className="card-soft rounded-3xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💡</span>
          <h4 className="font-cormorant text-base font-semibold text-foreground">Советы недели</h4>
        </div>
        <div className="space-y-2">
          {data.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-blush/30 rounded-xl p-2.5">
              <Icon name="Star" size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="font-golos text-sm text-foreground/80">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekInfo;
