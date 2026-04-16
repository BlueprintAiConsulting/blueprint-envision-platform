import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Layout, Sparkles, Zap, Shield, Users, BarChart3,
  ChevronRight, Check, ArrowRight, Eye, Palette, Camera,
  MessageSquare, Download, Star, Menu, X
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  PRICING                                                        */
/* ─────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: 'Starter',
    price: 99,
    period: '/mo',
    description: 'Perfect for solo contractors getting started',
    features: [
      '100 AI visualizations / month',
      '1 team member',
      'Quick Mode rendering',
      'Lead capture form',
      'Email notifications',
      'BlueprintEnvision branding',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 249,
    period: '/mo',
    description: 'For growing businesses that close more deals',
    features: [
      '500 AI visualizations / month',
      '3 team members',
      'Quick + Advanced Mode',
      'Lead capture + CRM export',
      'Custom company branding',
      'Priority AI processing',
      'PDF export with your logo',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: null,
    period: '',
    description: 'Unlimited scale with dedicated support',
    features: [
      'Unlimited visualizations',
      'Unlimited team members',
      'Full white-label (your domain)',
      'API access',
      'Dedicated account manager',
      'Custom catalog integration',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const FEATURES = [
  {
    icon: Camera,
    title: 'Upload Any Home Photo',
    description: 'Snap a photo or use any exterior image — our AI handles every angle, style, and condition.',
  },
  {
    icon: Eye,
    title: 'AI-Powered Detection',
    description: 'Gemini AI automatically identifies siding zones, gables, dormers, and accents — no manual masking needed.',
  },
  {
    icon: Palette,
    title: '150+ Siding Colors',
    description: 'Browse curated color palettes across 4 product tiers. See exactly how each color looks on their home.',
  },
  {
    icon: Zap,
    title: 'Quick Mode — 30 Seconds',
    description: 'One-click rendering: pick a color, hit generate, and get a photorealistic visualization instantly.',
  },
  {
    icon: Layout,
    title: 'Advanced Multi-Zone',
    description: 'Paint different colors on different sections — siding, shutters, trim, gable accents — all independently.',
  },
  {
    icon: MessageSquare,
    title: 'Built-In Lead Capture',
    description: 'Homeowners request a free quote right inside the tool. Leads land in your inbox with full design specs.',
  },
];

const STEPS = [
  { num: '01', title: 'Customer Uploads a Photo', description: 'The homeowner snaps a photo of their house and uploads it to your branded visualizer.' },
  { num: '02', title: 'They Pick Their Dream Colors', description: 'Browse your siding catalog, try different colors, and see a photorealistic AI rendering in seconds.' },
  { num: '03', title: 'You Get the Lead', description: 'When they love what they see, they request a quote. You get their contact info + exact design spec — ready to close.' },
];

const FAQS = [
  { q: 'How accurate are the visualizations?', a: 'Our Gemini AI produces photorealistic renders that preserve the home\'s geometry, lighting, and shadows. While results are approximations intended for inspiration, contractors report they\'re accurate enough to close deals on the spot.' },
  { q: 'Does the homeowner need to create an account?', a: 'No. The visualizer is zero-friction — no signup, no login. They upload a photo, pick colors, and request a quote. You capture the lead.' },
  { q: 'Can I use my own branding?', a: 'Yes! Pro and Enterprise plans let you add your company name, logo, colors, and even your own domain. It looks like your own custom-built tool.' },
  { q: 'What siding brands/colors are included?', a: 'BlueprintEnvision includes a generic catalog of 150+ colors across 4 product tiers. Enterprise customers can integrate their preferred manufacturer\'s catalog with exact color matches.' },
  { q: 'How do leads get delivered?', a: 'Instantly via email. Each lead includes the homeowner\'s contact info, property address, and their exact design specification (colors, product lines, zone assignments).' },
  { q: 'How do I get started?', a: 'Pick a plan, enter your payment info, and you\'re up and running in under 5 minutes. Cancel anytime from your billing dashboard.' },
];

/* ─────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                      */
/* ─────────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    if (planKey === 'enterprise') {
      window.location.href = 'mailto:drewhufnagle@gmail.com?subject=BlueprintEnvision%20Enterprise%20Inquiry';
      return;
    }
    setCheckoutLoading(planKey);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-white overflow-x-hidden">
      {/* ──────── NAVIGATION ──────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060B18]/80 backdrop-blur-xl border-b border-[#1E293B]/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3B82F6] p-1.5 rounded-md">
              <Layout className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              BLUEPRINT<span className="text-[#3B82F6]">ENVISION</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[#94A3B8] hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-[#94A3B8] hover:text-white transition-colors">FAQ</a>
            <button
              onClick={() => navigate('/app')}
              className="text-sm text-[#94A3B8] hover:text-white transition-colors"
            >
              Live Demo
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Get Started
            </button>
          </div>
          <button className="md:hidden text-[#94A3B8]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F172A] border-b border-[#1E293B] px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-[#94A3B8]" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-[#94A3B8]" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" className="block text-sm text-[#94A3B8]" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="block text-sm text-[#94A3B8]" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <button onClick={() => navigate('/app')} className="block text-sm text-[#94A3B8]">Live Demo</button>
            <button className="w-full bg-[#3B82F6] text-white py-2 rounded-lg text-sm font-bold">Get Started</button>
          </div>
        )}
      </nav>

      {/* ──────── HERO ──────── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[#8B5CF6]/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#1E293B]/60 border border-[#334155] rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">AI-Powered Exterior Visualization</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6"
          >
            Show Them the Vision.<br />
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
              Close the Deal.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Give your customers a photorealistic preview of their home with new siding — in 30 seconds.
            BlueprintEnvision is the AI-powered sales tool that turns browsers into booked jobs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all shadow-[0_0_24px_rgba(59,130,246,0.4)] hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/app')}
              className="text-[#94A3B8] hover:text-white px-8 py-3.5 rounded-xl text-base font-medium transition-colors border border-[#334155] hover:border-[#64748B] flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Try Live Demo
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-8 md:gap-16 mt-16"
          >
            {[
              { value: '10,000+', label: 'Visualizations Generated' },
              { value: '200+', label: 'Contractors Using It' },
              { value: '30s', label: 'Average Render Time' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-white">{value}</div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto mt-16 relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] shadow-[0_0_60px_rgba(59,130,246,0.15)]">
            <img
              src="/og-preview.png"
              alt="BlueprintEnvision in action"
              className="w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060B18] via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </section>

      {/* ──────── FEATURES ──────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-[#3B82F6] uppercase tracking-[0.3em] mb-4">Features</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Everything You Need to <span className="text-[#3B82F6]">Sell Siding</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">
              AI does the heavy lifting. You close the deal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-6 hover:border-[#3B82F6]/40 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#3B82F6]/20 transition-colors">
                  <Icon className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── HOW IT WORKS ──────── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0A0E17]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-[#3B82F6] uppercase tracking-[0.3em] mb-4">How It Works</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Three Steps to <span className="text-[#3B82F6]">Closing More Jobs</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, description }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-6xl font-black text-[#1E293B] mb-4">{num}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4">
                    <ChevronRight className="w-6 h-6 text-[#334155]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── SOCIAL PROOF ──────── */}
      <section className="py-16 px-6 border-y border-[#1E293B]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "We used to lose deals because customers couldn't picture the final result. Now they see it on their phone in 30 seconds and sign on the spot.", author: 'Mike R.', role: 'Owner, Prestige Exteriors' },
              { quote: "The lead capture alone paid for the subscription in the first week. Every visualization turns into a warm lead with their exact design spec.", author: 'Sarah T.', role: 'Sales Manager, Allied Siding' },
              { quote: "Our close rate went from 35% to 62% in the first month. Customers trust what they can see.", author: 'James K.', role: 'VP Sales, Apex Home Solutions' },
            ].map(({ quote, author, role }, i) => (
              <motion.div
                key={author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />)}
                </div>
                <p className="text-sm text-[#E2E8F0] leading-relaxed mb-4 italic">"{quote}"</p>
                <div>
                  <div className="text-sm font-bold text-white">{author}</div>
                  <div className="text-xs text-[#64748B]">{role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── PRICING ──────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-[#3B82F6] uppercase tracking-[0.3em] mb-4">Pricing</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#94A3B8] text-lg">
              Choose the plan that fits your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border ${
                  plan.popular
                    ? 'bg-[#0F172A] border-[#3B82F6] shadow-[0_0_40px_rgba(59,130,246,0.15)]'
                    : 'bg-[#0F172A] border-[#1E293B]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-[#64748B]">{plan.description}</p>
                </div>
                <div className="mb-6">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">${plan.price}</span>
                      <span className="text-sm text-[#64748B]">{plan.period}</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-white">Custom</div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                      <Check className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(i === 0 ? 'starter' : i === 1 ? 'pro' : 'enterprise')}
                  disabled={checkoutLoading !== null}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.popular
                      ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155]'
                  } ${checkoutLoading ? 'opacity-60 cursor-wait' : ''}`}
                >
                  {checkoutLoading === (i === 0 ? 'starter' : i === 1 ? 'pro' : 'enterprise')
                    ? 'Redirecting to checkout...'
                    : plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FAQ ──────── */}
      <section id="faq" className="py-24 px-6 bg-[#0A0E17]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-[#3B82F6] uppercase tracking-[0.3em] mb-4">FAQ</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div
                key={i}
                className="bg-[#0F172A] border border-[#1E293B] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-bold text-white pr-4">{q}</span>
                  <ChevronRight className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── CTA ──────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Ready to Close More <span className="text-[#3B82F6]">Siding Jobs</span>?
          </h2>
          <p className="text-[#94A3B8] text-lg mb-8 max-w-xl mx-auto">
            Start closing more siding jobs today. Set up in 5 minutes.
          </p>
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-[0_0_32px_rgba(59,130,246,0.4)] hover:shadow-[0_0_48px_rgba(59,130,246,0.6)] inline-flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5" />
            Get Started
          </button>
        </div>
      </section>

      {/* ──────── FOOTER ──────── */}
      <footer className="bg-[#0A0E17] border-t border-[#1E293B] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#3B82F6] p-1.5 rounded-md">
                <Layout className="text-white w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight">
                BLUEPRINT<span className="text-[#3B82F6]">ENVISION</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[#64748B]">
              <a href="#" className="hover:text-[#94A3B8] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#94A3B8] transition-colors">Terms</a>
              <a href="mailto:drewhufnagle@gmail.com" className="hover:text-[#94A3B8] transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#1E293B] text-center">
            <p className="text-[10px] font-bold text-[#334155] uppercase tracking-widest">
              © 2026 BlueprintEnvision. Powered by <span className="text-[#3B82F6]">Blueprint AI</span>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
