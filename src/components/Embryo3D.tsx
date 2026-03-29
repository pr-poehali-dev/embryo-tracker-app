import React, { useEffect, useRef } from 'react';

interface Embryo3DProps {
  week: number;
}

const embryoData: Record<number, { size: number; color: string; description: string; fruit: string }> = {
  4:  { size: 0.05, color: '#f4c2c2', description: 'Крошечный эмбрион', fruit: '🫐 мак' },
  5:  { size: 0.07, color: '#f4c2c2', description: 'Размером с семя кунжута', fruit: '🌱 кунжут' },
  6:  { size: 0.09, color: '#f4b8b8', description: 'Размером с горошину', fruit: '🫛 горошина' },
  7:  { size: 0.12, color: '#f4b0b0', description: 'Размером с чернику', fruit: '🫐 черника' },
  8:  { size: 0.16, color: '#f0a8a8', description: 'Размером с малину', fruit: '🍓 малина' },
  9:  { size: 0.21, color: '#eda8a8', description: 'Размером с вишню', fruit: '🍒 вишня' },
  10: { size: 0.27, color: '#eaa0a0', description: 'Размером с клубнику', fruit: '🍓 клубника' },
  11: { size: 0.34, color: '#e89898', description: 'Размером с финик', fruit: '🌰 финик' },
  12: { size: 0.42, color: '#e59090', description: 'Размером со сливу', fruit: '🍑 слива' },
  13: { size: 0.50, color: '#e28888', description: 'Размером с персик', fruit: '🍑 персик' },
  14: { size: 0.57, color: '#df8080', description: 'Размером с лимон', fruit: '🍋 лимон' },
  15: { size: 0.64, color: '#dc7878', description: 'Размером с яблоко', fruit: '🍏 яблоко' },
  16: { size: 0.70, color: '#d97070', description: 'Размером с авокадо', fruit: '🥑 авокадо' },
  17: { size: 0.75, color: '#d66868', description: 'Размером с грушу', fruit: '🍐 груша' },
  18: { size: 0.80, color: '#d36060', description: 'Размером с перцем', fruit: '🌶️ перец' },
  19: { size: 0.84, color: '#d05858', description: 'Размером с манго', fruit: '🥭 манго' },
  20: { size: 0.88, color: '#cd5050', description: 'Размером с бананом', fruit: '🍌 банан' },
  24: { size: 0.92, color: '#ca4848', description: 'Размером с кукурузой', fruit: '🌽 кукуруза' },
  28: { size: 0.95, color: '#c74040', description: 'Размером с баклажаном', fruit: '🍆 баклажан' },
  32: { size: 0.97, color: '#c43838', description: 'Размером с кабачком', fruit: '🥒 кабачок' },
  36: { size: 0.99, color: '#c13030', description: 'Размером с дыней', fruit: '🍈 дыня' },
  40: { size: 1.00, color: '#be2828', description: 'Готов к появлению на свет!', fruit: '🎀 малыш' },
};

function getEmbryoForWeek(week: number) {
  const weeks = Object.keys(embryoData).map(Number).sort((a, b) => a - b);
  let closest = weeks[0];
  for (const w of weeks) {
    if (w <= week) closest = w;
  }
  return embryoData[closest];
}

const Embryo3D: React.FC<Embryo3DProps> = ({ week }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const data = getEmbryoForWeek(week);
  const scale = 0.3 + data.size * 0.7;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    function drawEmbryoFrame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const floatY = Math.sin(t * 0.8) * 6;
      const floatX = Math.cos(t * 0.5) * 3;
      const rot = Math.sin(t * 0.6) * 0.08;
      const squish = 1 + Math.sin(t * 1.2) * 0.02;

      ctx.save();
      ctx.translate(cx + floatX, cy + floatY);
      ctx.rotate(rot);
      ctx.scale(scale * squish, scale / squish);

      // Амниотическая жидкость / пузырь
      const bubbleR = 90;
      const bubbleGrad = ctx.createRadialGradient(-10, -15, 5, 0, 0, bubbleR);
      bubbleGrad.addColorStop(0, 'rgba(255,240,248,0.5)');
      bubbleGrad.addColorStop(0.5, 'rgba(245,210,225,0.25)');
      bubbleGrad.addColorStop(1, 'rgba(230,180,205,0.12)');
      ctx.beginPath();
      ctx.arc(0, 0, bubbleR, 0, Math.PI * 2);
      ctx.fillStyle = bubbleGrad;
      ctx.fill();
      // Контур пузыря
      ctx.strokeStyle = 'rgba(220,170,195,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Блик на пузыре
      const glowGrad = ctx.createRadialGradient(-25, -30, 0, -25, -30, 30);
      glowGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
      glowGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(-25, -30, 30, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Тело эмбриона
      const bodySize = week < 10 ? 28 : week < 20 ? 35 : 42;
      const bodyGrad = ctx.createRadialGradient(-bodySize * 0.25, -bodySize * 0.3, 2, 0, 5, bodySize * 1.4);
      bodyGrad.addColorStop(0, '#fff0f3');
      bodyGrad.addColorStop(0.3, data.color + 'ee');
      bodyGrad.addColorStop(0.7, data.color + 'cc');
      bodyGrad.addColorStop(1, data.color + '88');

      // Форма тела — бобовидная
      ctx.save();
      ctx.beginPath();
      if (week < 8) {
        // Маленький шарик
        ctx.arc(0, 5, bodySize * 0.8, 0, Math.PI * 2);
      } else if (week < 16) {
        // Изогнутый эмбрион — буква С
        ctx.moveTo(0, -bodySize);
        ctx.bezierCurveTo(bodySize * 1.1, -bodySize * 0.5, bodySize * 1.2, bodySize * 0.5, bodySize * 0.5, bodySize);
        ctx.bezierCurveTo(bodySize * 0.1, bodySize * 1.1, -bodySize * 0.5, bodySize * 0.8, -bodySize * 0.7, bodySize * 0.2);
        ctx.bezierCurveTo(-bodySize * 0.9, -bodySize * 0.3, -bodySize * 0.6, -bodySize * 0.9, 0, -bodySize);
      } else {
        // Более вытянутый
        ctx.moveTo(0, -bodySize * 1.1);
        ctx.bezierCurveTo(bodySize * 1.2, -bodySize * 0.6, bodySize * 1.3, bodySize * 0.6, bodySize * 0.4, bodySize * 1.1);
        ctx.bezierCurveTo(-bodySize * 0.1, bodySize * 1.2, -bodySize * 0.7, bodySize * 0.9, -bodySize * 0.8, bodySize * 0.1);
        ctx.bezierCurveTo(-bodySize * 1.0, -bodySize * 0.5, -bodySize * 0.6, -bodySize * 1.0, 0, -bodySize * 1.1);
      }
      ctx.fillStyle = bodyGrad;
      ctx.shadowColor = data.color + '66';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Блик на теле
      const bodyHighlight = ctx.createRadialGradient(-bodySize * 0.3, -bodySize * 0.4, 0, -bodySize * 0.2, -bodySize * 0.3, bodySize * 0.6);
      bodyHighlight.addColorStop(0, 'rgba(255,255,255,0.55)');
      bodyHighlight.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = bodyHighlight;
      ctx.fill();
      ctx.restore();

      // Голова (если срок >= 8 нед)
      if (week >= 8) {
        const headR = week < 16 ? bodySize * 0.65 : bodySize * 0.55;
        const headX = week < 16 ? bodySize * 0.1 : bodySize * 0.05;
        const headY = week < 16 ? -bodySize * 0.6 : -bodySize * 0.75;

        const headGrad = ctx.createRadialGradient(headX - headR * 0.3, headY - headR * 0.3, 1, headX, headY, headR);
        headGrad.addColorStop(0, '#fff5f7');
        headGrad.addColorStop(0.4, data.color + 'dd');
        headGrad.addColorStop(1, data.color + '99');

        ctx.beginPath();
        ctx.arc(headX, headY, headR, 0, Math.PI * 2);
        ctx.fillStyle = headGrad;
        ctx.shadowColor = data.color + '55';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Блик на голове
        const headHighlight = ctx.createRadialGradient(headX - headR * 0.35, headY - headR * 0.35, 0, headX - headR * 0.2, headY - headR * 0.2, headR * 0.55);
        headHighlight.addColorStop(0, 'rgba(255,255,255,0.6)');
        headHighlight.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(headX, headY, headR, 0, Math.PI * 2);
        ctx.fillStyle = headHighlight;
        ctx.fill();

        // Глазки (с 10 нед)
        if (week >= 10) {
          const eyeSize = week < 16 ? 3 : 4;
          const eyeX1 = headX - headR * 0.25;
          const eyeX2 = headX + headR * 0.25;
          const eyeY = headY + headR * 0.05;

          [eyeX1, eyeX2].forEach(ex => {
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100,60,80,0.6)';
            ctx.fill();
            // Блик глаза
            ctx.beginPath();
            ctx.arc(ex - 1, eyeY - 1, 1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fill();
          });
        }
      }

      // Конечности (с 12 нед)
      if (week >= 12) {
        ctx.strokeStyle = data.color + 'bb';
        ctx.lineWidth = week < 20 ? 4 : 5;
        ctx.lineCap = 'round';

        // Ручки
        ctx.beginPath();
        ctx.moveTo(bodySize * 0.5, -bodySize * 0.1);
        ctx.quadraticCurveTo(bodySize * 0.9 + Math.sin(t * 1.5) * 5, -bodySize * 0.2, bodySize * 0.7, -bodySize * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-bodySize * 0.5, bodySize * 0.1);
        ctx.quadraticCurveTo(-bodySize * 0.85 + Math.cos(t * 1.3) * 5, bodySize * 0.0, -bodySize * 0.65, -bodySize * 0.35);
        ctx.stroke();

        // Ножки (с 16 нед)
        if (week >= 16) {
          ctx.beginPath();
          ctx.moveTo(bodySize * 0.25, bodySize * 0.9 + Math.sin(t * 0.9) * 4);
          ctx.quadraticCurveTo(bodySize * 0.5, bodySize * 1.2, bodySize * 0.2, bodySize * 1.35);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(-bodySize * 0.15, bodySize * 0.95 + Math.cos(t * 1.1) * 4);
          ctx.quadraticCurveTo(-bodySize * 0.4, bodySize * 1.25, -bodySize * 0.15, bodySize * 1.4);
          ctx.stroke();
        }
      }

      // Пуповина (с 8 нед)
      if (week >= 8) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(220,160,180,0.5)';
        ctx.lineWidth = 2;
        const puvX = week < 16 ? bodySize * 0.3 : bodySize * 0.2;
        const puvY = week < 16 ? bodySize * 0.5 : bodySize * 0.7;
        ctx.moveTo(puvX, puvY);
        ctx.bezierCurveTo(puvX + 20, puvY + 30 + Math.sin(t * 0.7) * 5, puvX - 10, puvY + 55, puvX, bubbleR - 5);
        ctx.stroke();
      }

      ctx.restore();

      // Сердечко (пульсирует)
      if (week >= 6) {
        const heartPulse = 1 + Math.sin(t * 3.5) * 0.15;
        ctx.save();
        ctx.translate(cx + 52, cy - 52);
        ctx.scale(heartPulse, heartPulse);
        ctx.font = '18px serif';
        ctx.fillText('❤️', -9, 9);
        ctx.restore();
      }
    }

    let start: number | null = null;
    function animate(timestamp: number) {
      if (!start) start = timestamp;
      timeRef.current = (timestamp - start) / 1000;
      drawEmbryoFrame(timeRef.current);
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [week, scale, data]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={240}
          height={240}
          className="drop-shadow-lg"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="text-center">
        <p className="font-cormorant text-lg text-foreground/70 italic">{data.description}</p>
        <p className="font-golos text-sm text-muted-foreground mt-0.5">{data.fruit}</p>
      </div>
    </div>
  );
};

export default Embryo3D;
