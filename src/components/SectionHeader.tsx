import { useEffect, useRef, useState } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({ title, subtitle, centered = true }: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`mb-12 transition-all duration-700 ${centered ? 'text-center' : ''} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      <h2 className="text-3xl md:text-[42px] font-extrabold text-[var(--charcoal)] mb-3">{title}</h2>
      {subtitle && <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
}
