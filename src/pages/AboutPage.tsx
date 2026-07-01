import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, Clock, Award, Users, Target, Zap } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[var(--teal-light)]/60 to-[var(--amber-light)]/60 py-20 border-b border-[var(--medium-gray)]">
        <div className="max-w-[1280px] mx-auto px-[5%] text-center">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--charcoal)] mb-4">
              About Dopha Electronics
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Born from the frustration of engineering students struggling to find quality components in Mombasa, Dopha Electronics is on a mission to empower the next generation of engineers.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-[5%] py-16 space-y-20">
        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <h2 className="text-3xl font-extrabold text-[var(--charcoal)] mb-6">Our Story</h2>
            <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
              <p>
                Dopha Electronics was founded in 2024 by a group of engineering graduates who experienced firsthand the struggle of sourcing quality electronic components in Mombasa. Every semester, students faced the same challenges: traveling to Nairobi for basic parts, dealing with unreliable suppliers, or settling for counterfeit components that failed during critical project demonstrations.
              </p>
              <p>
                We decided to change that. Starting from a small shop in Mombasa, we began stocking the essential components that every engineering student needs — from Arduino boards and sensors to soldering equipment and passive components.
              </p>
              <p>
                Today, Dopha Electronics serves over 5,000 students across Kenya, offering 140+ products, same-day campus delivery, and the unique Project Lab — interactive circuit diagrams that help students understand their mandatory projects and source components with a single click.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-80 mb-6">
              <img
                src="/images/about-students.jpg"
                alt="Engineering students working on projects"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--charcoal)]/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-medium opacity-90">Engineering Students at Work</p>
                <p className="text-xs opacity-70">Building the future, one project at a time</p>
              </div>
            </div>
            <div className="bg-white border border-[var(--medium-gray)] rounded-2xl p-8 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-[var(--teal-light)] rounded-xl">
                  <div className="text-3xl font-extrabold text-[var(--teal)] mb-1">140+</div>
                  <div className="text-sm text-[var(--text-muted)]">Products</div>
                </div>
                <div className="text-center p-4 bg-[var(--amber-light)] rounded-xl">
                  <div className="text-3xl font-extrabold text-[var(--amber)] mb-1">5000+</div>
                  <div className="text-sm text-[var(--text-muted)]">Students</div>
                </div>
                <div className="text-center p-4 bg-[var(--teal-light)] rounded-xl">
                  <div className="text-3xl font-extrabold text-[var(--teal)] mb-1">9+</div>
                  <div className="text-sm text-[var(--text-muted)]">Project Guides</div>
                </div>
                <div className="text-center p-4 bg-[var(--amber-light)] rounded-xl">
                  <div className="text-3xl font-extrabold text-[var(--amber)] mb-1">24h</div>
                  <div className="text-sm text-[var(--text-muted)]">Delivery</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* What We Offer */}
        <div>
          <ScrollReveal>
            <h2 className="text-3xl font-extrabold text-[var(--charcoal)] mb-10 text-center">What We Offer</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={28} />, title: 'Quality Components', desc: 'We source directly from manufacturers and authorized distributors. Every component is tested and guaranteed genuine.' },
              { icon: <GraduationCap size={28} />, title: 'Student Pricing', desc: '10% student discount for verified students. Bulk discounts for class projects and student clubs.' },
              { icon: <Users size={28} />, title: 'Community Support', desc: 'Active WhatsApp and Discord communities where students help each other with projects and troubleshooting.' },
              { icon: <Target size={28} />, title: 'Curriculum Aligned', desc: 'Our product catalog is organized around engineering and technology syllabuses, covering components for labs and mandatory projects.' },
              { icon: <Award size={28} />, title: 'Project Lab', desc: 'Interactive circuit diagrams with clickable components. Learn how to build common projects and buy parts in one place.' },
              { icon: <Clock size={28} />, title: 'Fast Delivery', desc: 'Fast local delivery across Mombasa. Free delivery on orders over KSh 3,000. Campus pickup also available.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} className={`transition-delay-${Math.min(i * 100, 500)}`}>
                <div className="bg-white border border-[var(--medium-gray)] rounded-2xl p-8 hover:border-[var(--teal)] hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-[var(--teal-light)] rounded-2xl flex items-center justify-center text-[var(--teal)] mb-5">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--charcoal)] mb-3">{item.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Engineering Disciplines */}
        <div className="bg-white border border-[var(--medium-gray)] rounded-2xl p-8 md:p-12">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[var(--teal)] rounded-xl flex items-center justify-center text-white">
                <GraduationCap size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--charcoal)]">Built for Engineering Students</h2>
                <p className="text-sm text-[var(--text-muted)]">Across all levels and disciplines</p>
              </div>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed mb-6">
              Dopha Electronics stocks components that cover the full breadth of engineering and technology disciplines — from first-year electronics labs to final-year research projects. Whether you're studying electrical engineering, mechatronics, or computer networking, we have what you need.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Electrical & Electronic Eng.', 'Mechatronics & Robotics', 'Instrumentation & Control', 'Telecommunication Eng.'].map(dept => (
                <div key={dept} className="bg-[var(--light-gray)] rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-[var(--charcoal)]">{dept}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Contact */}
        <div>
          <ScrollReveal>
            <h2 className="text-3xl font-extrabold text-[var(--charcoal)] mb-8 text-center">Get in Touch</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MapPin size={24} />, title: 'Location', desc: 'Mombasa, Kenya\nServing the Coast Region' },
              { icon: <Phone size={24} />, title: 'Phone', desc: '+254 7XX XXX XXX\nMon-Sat, 8AM-6PM' },
              { icon: <Mail size={24} />, title: 'Email', desc: 'info@dophaelectronics.co.ke\nOrders & Support' },
              { icon: <Clock size={24} />, title: 'Hours', desc: 'Monday-Saturday\n8:00 AM - 6:00 PM' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} className={`transition-delay-${Math.min(i * 100, 500)}`}>
                <div className="bg-white border border-[var(--medium-gray)] rounded-2xl p-6 text-center hover:border-[var(--teal)] transition-all">
                  <div className="w-12 h-12 bg-[var(--teal-light)] rounded-xl flex items-center justify-center text-[var(--teal)] mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-[var(--charcoal)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] whitespace-pre-line">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <h3 className="text-2xl font-extrabold text-[var(--charcoal)] mb-4">Ready to start your next project?</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/products" className="px-8 py-3.5 bg-[var(--teal)] text-white font-semibold rounded-xl hover:bg-[var(--teal-dark)] transition-colors shadow-lg shadow-[var(--teal)]/20">
              Browse Products
            </Link>
            <Link to="/project-lab" className="px-8 py-3.5 border border-[var(--medium-gray)] text-[var(--charcoal)] font-semibold rounded-xl hover:border-[var(--teal)] hover:bg-[var(--teal-light)] transition-all">
              Explore Project Lab
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
