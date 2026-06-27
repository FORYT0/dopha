import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  connections: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PARTICLE_COUNT = 60;
    const SPEED_SCALE = 0.25;
    const CONNECTION_DISTANCE = 100;
    const MOUSE_CONNECTION_DISTANCE = 120;
    const MAX_CONNECTIONS_PER_PARTICLE = 3;
    const MAX_MOUSE_CONNECTIONS = 3;
    const MIN_RADIUS = 1.5;
    const MAX_RADIUS = 3.5;

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    function createParticle(w: number, h: number): Particle {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * SPEED_SCALE + 0.1;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS,
        alpha: Math.random() * 0.5 + 0.3,
        connections: 0,
      };
    }

    function init() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const w = rect.width;
      const h = rect.height;
      const existing = particlesRef.current;
      if (existing.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          existing.push(createParticle(w, h));
        }
      } else {
        for (let i = existing.length - 1; i >= 0; i--) {
          if (existing[i].x > w || existing[i].y > h) {
            existing.splice(i, 1);
          }
        }
        while (existing.length < PARTICLE_COUNT) {
          existing.push(createParticle(w, h));
        }
      }
    }

    function draw() {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const w = rect.width;
      const h = rect.height;
      const dpr = window.devicePixelRatio || 1;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        p.vx *= 0.99;
        p.vy *= 0.99;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.1) {
          const angle = Math.random() * Math.PI * 2;
          p.vx = Math.cos(angle) * (Math.random() * SPEED_SCALE + 0.1);
          p.vy = Math.sin(angle) * (Math.random() * SPEED_SCALE + 0.1);
        }
        p.connections = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];
          if (pi.connections >= MAX_CONNECTIONS_PER_PARTICLE || pj.connections >= MAX_CONNECTIONS_PER_PARTICLE) continue;
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * 0.25;
            ctx!.beginPath();
            ctx!.moveTo(pi.x, pi.y);
            ctx!.lineTo(pj.x, pj.y);
            ctx!.strokeStyle = `rgba(13, 148, 136, ${lineOpacity})`;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
            pi.connections++;
            pj.connections++;
          }
        }
      }

      const mouse = mouseRef.current;
      if (mouse.x > 0 && mouse.y > 0) {
        const sorted = particles
          .filter(p => p.connections < MAX_CONNECTIONS_PER_PARTICLE)
          .map(p => ({
            p,
            dist: Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2),
          }))
          .filter(item => item.dist < MOUSE_CONNECTION_DISTANCE)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, MAX_MOUSE_CONNECTIONS);

        for (const item of sorted) {
          const lineOpacity = (1 - item.dist / MOUSE_CONNECTION_DISTANCE) * 0.3;
          ctx!.beginPath();
          ctx!.moveTo(item.p.x, item.p.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.strokeStyle = `rgba(13, 148, 136, ${lineOpacity})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }

      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(13, 148, 136, ${p.alpha})`;
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        init();
      }, 200);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg border border-[var(--medium-gray)] bg-gradient-to-br from-[var(--light-gray)] to-white">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
