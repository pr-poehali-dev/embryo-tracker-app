import React from 'react';

interface Embryo3DProps {
  week: number;
  day?: number;
  onDetails?: () => void;
}

const EMBRYO_IMAGES: { minWeek: number; src: string }[] = [
  { minWeek: 1,  src: 'https://cdn.poehali.dev/projects/609c2d4d-c6fd-4eb5-b029-ad3e283353bb/files/4092693e-ebea-475d-8b08-9d62df871860.jpg' },
  { minWeek: 13, src: 'https://cdn.poehali.dev/projects/609c2d4d-c6fd-4eb5-b029-ad3e283353bb/files/641dc6e8-d057-461d-8a6b-277ba549d26f.jpg' },
  { minWeek: 27, src: 'https://cdn.poehali.dev/projects/609c2d4d-c6fd-4eb5-b029-ad3e283353bb/files/50702534-99b5-4dde-9981-426472cbedb7.jpg' },
];

function getEmbryoImage(week: number) {
  let img = EMBRYO_IMAGES[0].src;
  for (const entry of EMBRYO_IMAGES) {
    if (week >= entry.minWeek) img = entry.src;
  }
  return img;
}

function getEmbryoScale(week: number) {
  return 0.45 + (week / 40) * 0.55;
}

const Embryo3D: React.FC<Embryo3DProps> = ({ week, day = 0, onDetails }) => {
  const imgSrc = getEmbryoImage(week);
  const scale = getEmbryoScale(week);

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative w-[300px] h-[300px] rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #fce8d5 0%, #f0c9a6 40%, #e8b88a 70%, #dda878 100%)',
          boxShadow: '0 8px 60px rgba(220,170,130,0.3), inset 0 -20px 60px rgba(200,140,80,0.15)',
        }}
      >
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8), transparent)' }}
        />

        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
          <p className="font-cormorant text-[22px] font-semibold text-white/90 leading-none drop-shadow-sm">
            {week} {week === 1 ? 'неделя' : week < 5 ? 'недели' : 'недель'}
          </p>
          {day > 0 && (
            <p className="font-golos text-sm text-white/70 mt-0.5 drop-shadow-sm">
              {day} {day === 1 ? 'день' : day < 5 ? 'дня' : 'дней'}
            </p>
          )}
        </div>

        <div
          className="relative z-[1] mt-4 animate-embryo-float"
          style={{ width: `${scale * 190}px`, height: `${scale * 190}px` }}
        >
          <img
            src={imgSrc}
            alt={`Эмбрион на ${week} неделе`}
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 6px 24px rgba(180,120,80,0.4))',
              borderRadius: '50%',
            }}
          />
        </div>

        <button
          onClick={onDetails}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm px-6 py-1.5 rounded-full font-golos text-sm text-foreground/80 shadow-md hover:bg-white hover:shadow-lg transition-all hover:scale-105"
        >
          Подробнее
        </button>
      </div>
    </div>
  );
};

export default Embryo3D;
