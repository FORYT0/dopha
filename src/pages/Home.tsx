import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Microchip, Zap, Activity, Thermometer, Battery,
  Wrench, Cable, Monitor, Wifi, Cog, ChevronRight, BookOpen, FileText,
  Users, Percent, Presentation, Truck, Lightbulb, LayoutGrid, List,
} from 'lucide-react';
import type { ViewMode } from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import ProductCard from '../components/ProductCard';
import InlineEdit from '../components/InlineEdit';
import { categories } from '../data/products';
import { useStaff } from '../context/StaffContext';

const categoryIcons: Record<string, React.ReactNode> = {
  Cpu: <Microchip size={24} />, Zap: <Zap size={24} />, Activity: <Activity size={24} />,
  Thermometer: <Thermometer size={24} />, Battery: <Battery size={24} />, Wrench: <Wrench size={24} />,
  Cable: <Cable size={24} />, Monitor: <Monitor size={24} />, Wifi: <Wifi size={24} />, Cog: <Cog size={24} />,
};

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'microcontrollers', label: 'Arduino & MCUs' },
  { key: 'sensors', label: 'Sensors' },
  { key: 'passive', label: 'Passive Components' },
  { key: 'tools', label: 'Tools' },
  { key: 'motors', label: 'Motors' },
  { key: 'wireless', label: 'IoT & Wireless' },
];

const resources = [
  { icon: <BookOpen size={28} />, title: 'Project Tutorials', desc: 'Step-by-step guides for Arduino, sensor interfacing, PCB design, and IoT projects tailored to TUM coursework.' },
  { icon: <FileText size={28} />, title: 'Component Datasheets', desc: 'Downloadable datasheets for all major components we stock. Organized by course module for easy reference.' },
  { icon: <Users size={28} />, title: 'TUM Student Community', desc: 'Join our WhatsApp group and Discord server to connect with fellow TUM engineering students.' },
  { icon: <Percent size={28} />, title: 'Student Discount Program', desc: 'Verify your TUM student ID and get 10% off all components. Bulk order discounts for class projects.' },
  { icon: <Presentation size={28} />, title: 'Workshop & Training', desc: 'Monthly hands-on workshops in Mombasa covering soldering, PCB design, Arduino programming, and more.' },
  { icon: <Truck size={28} />, title: 'Fast Campus Delivery', desc: 'Same-day delivery to TUM Main Campus and surrounding areas. Free delivery on orders over KSh 3,000.' },
];

const tumCourses = [
  'BSc Electrical & Electronic Engineering', 'BTech Electrical & Electronic Engineering',
  'Diploma in Electronic Engineering', 'Diploma in Technology (Electronics & Automation)',
  'Diploma in Computer & Network Engineering', 'Diploma in Instrumentation & Control',
  'Diploma in Telecommunication Engineering', 'Mechatronic & Robotic Engineering',
  'Certificate in Electronic Engineering', 'Higher Diploma in Electronics & Automation',
  'MSc Electrical & Electronic Engineering', 'MTech Mechatronics',
];

const testimonials = [
  { text: 'Dopha Electronics saved my final year project! I needed an Arduino Uno R4 WiFi and multiple sensors at the last minute. They delivered to TUM campus the same day with a student discount.', initials: 'JM', name: 'James Mwenda', course: 'BSc Electrical & Electronic Engineering, TUM' },
  { text: 'As a diploma student in Electronics & Automation, finding affordable components was tough. Dopha has everything I need at prices that fit a student budget. Their tutorials are incredibly helpful!', initials: 'AO', name: 'Amina Omar', course: 'Diploma in Technology (Electronics & Automation), TUM' },
  { text: 'I run the TUM Robotics Club and we order all our components from Dopha. Their bulk pricing for student projects is unmatched. The quality is consistent and their support team understands electronics.', initials: 'DK', name: 'David Kimani', course: 'MTech Mechatronics, TUM Robotics Club Lead' },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="text-4xl font-extrabold text-[var(--teal)] leading-none">{count.toLocaleString()}{suffix}</div>;
}

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const { products, siteContent, updateContent } = useStaff();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const filteredProducts = activeTab === 'all'
    ? products.slice(0, 12)
    : products.filter(p => p.category === activeTab).slice(0, 12);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-[5%] w-full py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-[var(--charcoal)] leading-tight mb-5">
                <InlineEdit
                  value={siteContent.heroTitle}
                  onSave={v => updateContent({ heroTitle: v })}
                  className="text-[var(--charcoal)]"
                />{' '}
                <InlineEdit
                  value={siteContent.heroHighlight}
                  onSave={v => updateContent({ heroHighlight: v })}
                  className="text-[var(--teal)]"
                />
              </h1>
              <p className="text-lg text-[var(--text-muted)] max-w-lg mb-8 leading-relaxed">
                <InlineEdit
                  value={siteContent.heroSubtitle}
                  onSave={v => updateContent({ heroSubtitle: v })}
                  multiline
                  className="text-[var(--text-muted)]"
                />
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[var(--teal)]/20"
                >
                  <Microchip size={18} />
                  <InlineEdit
                    value={siteContent.heroCta1}
                    onSave={v => updateContent({ heroCta1: v })}
                    className="text-white"
                  />
                </Link>
                <Link
                  to="/project-lab"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-[var(--medium-gray)] text-[var(--charcoal)] font-semibold rounded-xl hover:border-[var(--teal)] hover:bg-[var(--teal-light)] transition-all"
                >
                  <Lightbulb size={18} />
                  <InlineEdit
                    value={siteContent.heroCta2}
                    onSave={v => updateContent({ heroCta2: v })}
                    className="text-[var(--charcoal)]"
                  />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-[var(--medium-gray)]">
                <img
                  src="/images/hero-components.jpg"
                  alt="Electronic components collection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--teal)]/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-t border-b border-[var(--medium-gray)] bg-[var(--light-gray)] py-10">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <AnimatedCounter target={2500} suffix="+" />
              <div className="text-sm text-[var(--text-muted)] mt-2 uppercase tracking-wider font-medium">Products</div>
            </div>
            <div className="text-center">
              <AnimatedCounter target={5000} suffix="+" />
              <div className="text-sm text-[var(--text-muted)] mt-2 uppercase tracking-wider font-medium">TUM Students Served</div>
            </div>
            <div className="text-center">
              <AnimatedCounter target={15} />
              <div className="text-sm text-[var(--text-muted)] mt-2 uppercase tracking-wider font-medium">Engineering Programs</div>
            </div>
            <div className="text-center">
              <AnimatedCounter target={99} suffix="%" />
              <div className="text-sm text-[var(--text-muted)] mt-2 uppercase tracking-wider font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* TUM Banner */}
      <div className="bg-gradient-to-r from-[var(--teal-light)]/50 to-[var(--amber-light)]/50 py-16">
        <div className="max-w-[1280px] mx-auto px-[5%] text-center">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--charcoal)] mb-3">
              Built for TUM Engineers
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
              We stock components aligned with the curriculum of the School of Engineering & Technology at Technical University of Mombasa — from Certificate to Master's level programs.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
              {tumCourses.map(course => (
                <span key={course} className="bg-white/80 border border-[var(--medium-gray)] rounded-full px-4 py-2 text-sm text-[var(--text-muted)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-all cursor-default">
                  {course}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <SectionHeader
            title="Shop by Category"
            subtitle="Everything you need for your electronics projects, labs, and coursework"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <ScrollReveal key={cat.id} className={`transition-delay-${Math.min(i * 100, 500)}`}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="block bg-white border border-[var(--medium-gray)] rounded-2xl p-8 text-center hover:border-[var(--teal)] hover:-translate-y-2 hover:shadow-lg transition-all duration-300 group no-underline"
                >
                  <div className="w-14 h-14 bg-[var(--teal-light)] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[var(--teal)] group-hover:scale-110 transition-transform">
                    {categoryIcons[cat.icon]}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--charcoal)] mb-2">{cat.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">{cat.description}</p>
                  <span className="inline-block bg-[var(--teal-light)] text-[var(--teal)] px-3.5 py-1 rounded-full text-xs font-semibold">
                    {cat.count}+ Products
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[var(--light-gray)]">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <SectionHeader
            title="Featured Components"
            subtitle="Hand-picked for TUM engineering coursework"
          />
          <ScrollReveal>
            {/* Tabs + view toggle */}
            <div className="flex flex-wrap items-center gap-2.5 mb-10">
              <div className="flex flex-wrap gap-2.5 flex-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-[var(--teal)] text-white' : 'bg-white border border-[var(--medium-gray)] text-[var(--text-muted)] hover:border-[var(--teal)] hover:text-[var(--teal)]'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* View mode toggle */}
              <div className="flex rounded-xl border border-[var(--medium-gray)] overflow-hidden bg-white shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className={`flex items-center justify-center w-10 h-10 transition-colors ${viewMode === 'grid' ? 'bg-[var(--teal)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--light-gray)]'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List view"
                  className={`flex items-center justify-center w-10 h-10 border-l border-[var(--medium-gray)] transition-colors ${viewMode === 'list' ? 'bg-[var(--teal)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--light-gray)]'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Grid or list layout */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} viewMode="list" />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[var(--teal)] text-[var(--teal)] font-semibold rounded-xl hover:bg-[var(--teal)] hover:text-white transition-all"
            >
              View All Products
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <SectionHeader
            title="Student Resources"
            subtitle="Free learning materials for your engineering journey"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res, i) => (
              <ScrollReveal key={res.title} className={`transition-delay-${Math.min(i * 100, 500)}`}>
                <div className="bg-white border border-[var(--medium-gray)] rounded-2xl p-8 hover:border-[var(--teal)] hover:-translate-y-1 transition-all duration-300">
                  <div className="text-[var(--teal)] mb-4">{res.icon}</div>
                  <h3 className="text-lg font-bold text-[var(--charcoal)] mb-3">{res.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{res.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--teal)] hover:gap-2.5 transition-all cursor-pointer">
                    Learn More <ChevronRight size={14} />
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[var(--light-gray)]">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <SectionHeader
            title="What TUM Students Say"
            subtitle="Trusted by engineering students across Kenya"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.initials} className={`transition-delay-${Math.min(i * 100, 500)}`}>
                <div className="bg-white border border-[var(--medium-gray)] rounded-2xl p-8 relative overflow-hidden hover:-translate-y-1 transition-all duration-300">
                  <span className="absolute top-4 right-6 text-6xl text-[var(--teal)]/10 font-serif leading-none">"</span>
                  <p className="text-[15px] text-[var(--charcoal)] italic leading-relaxed mb-6 relative z-10">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--teal)] to-[var(--amber)] flex items-center justify-center text-white font-bold text-sm">
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--charcoal)]">{t.name}</h4>
                      <span className="text-xs text-[var(--text-muted)]">{t.course}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[var(--teal-light)]/60 to-[var(--amber-light)]/60 border-t border-b border-[var(--medium-gray)]">
        <div className="max-w-[1280px] mx-auto px-[5%] text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--charcoal)] mb-4">
              <InlineEdit
                value={siteContent.ctaTitle}
                onSave={v => updateContent({ ctaTitle: v })}
                className="text-[var(--charcoal)]"
              />
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-8">
              <InlineEdit
                value={siteContent.ctaSubtitle}
                onSave={v => updateContent({ ctaSubtitle: v })}
                multiline
                className="text-[var(--text-muted)]"
              />
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[var(--teal)]/20"
              >
                Start Shopping
              </Link>
              <a
                href={`https://wa.me/${siteContent.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-[var(--medium-gray)] text-[var(--charcoal)] font-semibold rounded-xl hover:border-[var(--teal)] hover:bg-[var(--teal-light)] transition-all"
              >
                Chat on WhatsApp
                <InlineEdit
                  value={siteContent.whatsapp}
                  onSave={v => updateContent({ whatsapp: v })}
                  className="text-xs text-[var(--text-muted)] ml-1"
                  placeholder="+254..."
                />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
