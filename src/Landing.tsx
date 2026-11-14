import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import GalacticNebula from './GalacticNebula';
import {
  Sparkles, Shield, ChevronRight, Check, ArrowRight,
  Eye, Palette, Camera, MessageSquare, Menu, X, Lock,
  Layers, MapPin, Calculator, Smartphone, Building2, CheckCircle2,
  SlidersHorizontal, CheckCheck, Compass, ArrowUpRight
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  SHOWCASE PALETTES FOR HERO INTERACTIVE HOTSPOTS                */
/* ─────────────────────────────────────────────────────────────── */
const HERO_PALETTES = [
  {
    id: 'modern-slate',
    label: 'Modern Charcoal & Slate',
    image: 'demo-render-charcoal.png',
    roof: {
      line: 'Landmark® PRO',
      color: 'Moire Black',
      spec: 'Dual-Layer Architectural Shingle',
      hex: '#1E232A',
      tag: '50-Yr Warranty',
      price: '$3.85 / sq ft'
    },
    siding: {
      line: 'Monogram® D4 Cedar',
      color: 'Flagstone Gray',
      spec: 'TrueTexture™ Rough Cedar Finish',
      hex: '#5A626C',
      tag: 'Class A Fire Rated',
      price: '$6.20 / sq ft'
    },
    trim: {
      line: 'Restoration Millwork®',
      color: 'Harbor White',
      spec: 'Engineered Cellular PVC Trim',
      hex: '#EAEFF5',
      tag: 'Zero Rot Guarantee',
      price: '$2.10 / lin ft'
    }
  },
  {
    id: 'heritage-red',
    label: 'Heritage Brick & Pewter',
    image: 'demo-render-red.png',
    roof: {
      line: 'Landmark® Premium',
      color: 'Pewterwood Slate',
      spec: 'Max Def Shadow Accent Band',
      hex: '#3E4249',
      tag: 'Algae Resistance',
      price: '$4.15 / sq ft'
    },
    siding: {
      line: 'Cedar Impressions®',
      color: 'Colonial White',
      spec: 'Individual Polymer Cedar Shakes',
      hex: '#EDE8DF',
      tag: '220mph Wind Rated',
      price: '$7.40 / sq ft'
    },
    trim: {
      line: 'Precision Trim & Soffit',
      color: 'Barn Red Accent',
      spec: 'Beaded Aluminum Soffit & Fascia',
      hex: '#7A2E2E',
      tag: 'Factory Pre-Finished',
      price: '$2.85 / lin ft'
    }
  },
  {
    id: 'coastal-blue',
    label: 'Pacific Blue & Weathered Wood',
    image: 'demo-pa-colonial.png',
    roof: {
      line: 'Landmark® PRO',
      color: 'Weathered Wood',
      spec: 'High-Definition Color Blend',
      hex: '#4A423B',
      tag: 'Dual-Layer Composite',
      price: '$3.90 / sq ft'
    },
    siding: {
      line: 'Monogram® D4',
      color: 'Pacific Blue',
      spec: 'Heavy-Duty .046" Rigid Vinyl',
      hex: '#2E4C6D',
      tag: 'Colorfast Warranty',
      price: '$6.50 / sq ft'
    },
    trim: {
      line: 'Restoration Millwork®',
      color: 'Colonial White',
      spec: 'Reinforced Window Surroundings',
      hex: '#F8FAFC',
      tag: 'Moisture Barrier',
      price: '$2.10 / lin ft'
    }
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  ACCORDION FEATURE SHOWCASE DATA                                */
/* ─────────────────────────────────────────────────────────────── */
const ACCORDION_FEATURES = [
  {
    id: 'ai-renders',
    title: 'Photorealistic AI Exterior Renders',
    subtitle: 'Calibrated architectural vision in 30 seconds',
    description: 'Our proprietary Gemini vision pipeline interprets roof slopes, dormers, siding lap profiles, and natural sunlight angles without manual masking. Homeowners see their actual house transformed instantly.',
    stat: '30s Render Time',
    statLabel: 'Cloud GPU Pipeline',
    badge: 'Vision AI v2.5'
  },
  {
    id: 'multi-zone',
    title: 'Real-Time Multi-Zone Configuration',
    subtitle: 'Roofing, siding, gables, and trim independently tuned',
    description: 'Partition the exterior into distinct architectural zones. Paint CertainTeed Landmark shingles on the main roof while configuring Monogram siding on lower elevations and contrasting accents in the gables.',
    stat: '8 Independent Zones',
    statLabel: 'Precision Architecture',
    badge: 'Multi-Surface Engine'
  },
  {
    id: 'field-takeoff',
    title: '4-Side Field Takeoff & Materials Calculator',
    subtitle: 'Square footage, waste factors, and bundle counts on site',
    description: 'Switch from visual inspiration directly to an actionable material estimate. Enter wall dimensions or roof pitch to generate exact square requirements, starter course bundles, and flashing footage.',
    stat: '100% Billable Specs',
    statLabel: 'Instant Material Count',
    badge: 'Field Sales Tool'
  },
  {
    id: 'street-view',
    title: 'Google Street View & Camera Roll Ingestion',
    subtitle: 'Pull any residential property in seconds',
    description: 'Enter any US address or postal code to instantly pull Google Street View panoramas directly into the studio. Alternatively, sales reps and homeowners can snap live camera photos on iOS or Android.',
    stat: '98% US Coverage',
    statLabel: 'Zero Setup Friction',
    badge: 'Instant Property Lookup'
  },
  {
    id: 'lead-packet',
    title: 'Frictionless Homeowner Lead & Quote Delivery',
    subtitle: 'Design spec packets sent straight to your inbox and CRM',
    description: 'Homeowners customize their colors and request a formal quote in one click. Your sales team receives a full PDF-ready packet with contact details, property address, and exact CertainTeed product SKUs.',
    stat: '2.8x Higher Close Rate',
    statLabel: 'Informed Homeowners',
    badge: 'Sales Acceleration'
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  PRICING TIERS (PRESERVING STRIPE WORKFLOW)                     */
/* ─────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 99,
    period: '/mo',
    description: 'For independent exterior contractors starting out',
    features: [
      '100 AI visualizations / month',
      '1 team member seat',
      'CertainTeed Landmark & Monogram palettes',
      'Google Street View property lookup',
      'Lead capture form with instant email delivery',
      'BlueprintEnvision studio branding'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    key: 'pro',
    name: 'Pro Contractor',
    price: 249,
    period: '/mo',
    description: 'For growing roofing & siding firms closing deals in the field',
    features: [
      '500 AI visualizations / month',
      '3 team member seats',
      'Studio Visualizer + 4-Side Field Takeoff',
      'Custom company branding & logo on exports',
      'Priority Gemini AI processing speed',
      'Branded PDF quote packet generation',
      'CRM webhook export (HubSpot, JobNimbus)'
    ],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    key: 'enterprise',
    name: 'Enterprise & White-Label',
    price: null,
    period: '',
    description: 'Unlimited volume with full white-label custom domain',
    features: [
      'Unlimited AI visualizations',
      'Unlimited team member seats',
      'Full white-label on your company domain',
      'Custom manufacturer catalog integration',
      'Dedicated account manager & phone support',
      'Custom CRM & ERP API integration',
      '99.9% uptime SLA guarantee'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  ROLLOUT STEPS                                                  */
/* ─────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'Snap, Upload, or Pull Street View',
    subtitle: 'Zero friction home acquisition',
    description: 'Type any property address to pull high-res Street View imagery, or have the homeowner take a photo with their phone from the driveway.'
  },
  {
    num: '02',
    title: 'Configure Roof & Siding Live',
    subtitle: 'Interactive material customization',
    description: 'Swap between CertainTeed Landmark shingles, Monogram siding, and designer trim in real time. Compare before and after with an interactive slider.'
  },
  {
    num: '03',
    title: 'Close with Instant Takeoff & Quote',
    subtitle: 'Sign contracts at the kitchen table',
    description: 'Lock in homeowner confidence on the spot. Generate square counts, material breakdown, and deliver a clean quote packet directly to their inbox.'
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  FAQS                                                           */
/* ─────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'How accurate are the exterior visualizations?',
    a: 'BlueprintEnvision utilizes advanced multimodal Gemini AI calibrated specifically for residential exterior architecture. It preserves your exact roof pitch, dormers, window frames, and ambient sunlight, providing photorealistic previews that contractors routinely use to close deals on the spot.'
  },
  {
    q: 'Can homeowners use the tool without downloading an app?',
    a: 'Yes. BlueprintEnvision is 100% web-based and responsive across iPhone, iPad, Android, and desktop. Homeowners can test siding and roofing colors directly on your website without any account creation or app installation.'
  },
  {
    q: 'What manufacturer catalogs are supported?',
    a: 'Out of the box, BlueprintEnvision is pre-loaded with verified CertainTeed Landmark®, Landmark® PRO, Monogram® siding, and Restoration Millwork® colors. Pro and Enterprise accounts can integrate additional manufacturer palettes upon request.'
  },
  {
    q: 'How does the 4-Side Field Takeoff mode work?',
    a: 'Field Takeoff provides on-site measurement tools right from your iPad or mobile device. Sales reps can record North, South, East, and West wall dimensions, apply window/door subtractions, configure waste factors, and compute instant square counts for the estimate.'
  },
  {
    q: 'How do customer leads and quote requests reach my office?',
    a: 'When a homeowner clicks "Request Free Quote", their contact details, address, and exact selected product specifications are immediately delivered to your company email and can sync directly to your CRM.'
  },
  {
    q: 'Can I white-label the visualizer with my own roofing company branding?',
    a: 'Yes! Pro plans include your custom company logo and branding on customer exports. Enterprise plans offer 100% white-label hosting on your own custom domain (e.g., visualizer.yourcompany.com).'
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);
  const [activeAccordionId, setActiveAccordionId] = useState('ai-renders');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 28, restDelta: 0.001 });

  const base = import.meta.env.BASE_URL || '/';
  const assetPath = (path: string) => `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const currentPalette = HERO_PALETTES[activePaletteIndex];
  const activeAccordion = ACCORDION_FEATURES.find(f => f.id === activeAccordionId) || ACCORDION_FEATURES[0];

  const handleCheckout = async (planKey: string) => {
    if (planKey === 'enterprise') {
      window.location.href = 'mailto:drewhufnagle@gmail.com?subject=BlueprintEnvision%20Enterprise%20White-Label%20Inquiry';
      return;
    }
    setCheckoutLoading(planKey);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = `mailto:drewhufnagle@gmail.com?subject=BlueprintEnvision%20${planKey.toUpperCase()}%20Plan%20Inquiry`;
      }
    } catch {
      window.location.href = `mailto:drewhufnagle@gmail.com?subject=BlueprintEnvision%20${planKey.toUpperCase()}%20Plan%20Inquiry`;
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="immersive-mono min-h-screen bg-[#05060c] text-[#e8ecf5] selection:bg-[#57c8ff] selection:text-[#05060c] relative isolate font-sans overflow-x-hidden">
      
      {/* ──────── GALACTIC NEBULA & STARFIELD BACKGROUND ──────── */}
      <GalacticNebula />

      {/* ──────── LASER SCROLL PROGRESS BEAM ──────── */}
      <motion.div className="scroll-progress" style={{ scaleX }} />

      <div className="relative z-10">

      {/* ──────── IMMERSIVE STICKY HEADER ──────── */}
      <header className="sticky top-0 z-50 bg-[#05060c]/80 backdrop-blur-xl border-b border-[#8fd9ff]/20 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Wordmark & Circular Badge */}
          <div className="flex items-center gap-3.5 cursor-pointer select-none group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/bp-new-logo.jpg"
              alt="Blueprint AI Consulting Co."
              className="w-10 h-10 rounded-full object-cover ring-1 ring-[#57c8ff]/50 galactic-glow group-hover:scale-105 group-hover:ring-[#8fd9ff] transition-all"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-base tracking-tight text-white flex items-center leading-none">
                BLUEPRINT<span className="text-[#57c8ff] ml-1">ENVISION</span>
              </span>
              <span className="text-[8px] font-mono text-[#8fd9ff] uppercase tracking-[0.22em] mt-1">
                // Blueprint AI Consulting Co.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#a5b4cf]">
            <a href="#platform" className="hover:text-[#57c8ff] transition-colors">Platform</a>
            <a href="#capabilities" className="hover:text-[#57c8ff] transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-[#57c8ff] transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-[#57c8ff] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#57c8ff] transition-colors">FAQ</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e8ecf5]/80 hover:text-white px-4 py-2.5 rounded-[4px] transition-colors cursor-pointer"
            >
              Studio Demo
            </button>
            <button
              onClick={() => navigate('/app')}
              className="immersive-btn-primary px-5 py-2.5 cursor-pointer active:scale-95"
            >
              <span>LAUNCH STUDIO</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#05060c]" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#8fd9ff] hover:text-white rounded-[4px] border border-[#8fd9ff]/25"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#05060c]/95 backdrop-blur-xl border-b border-[#8fd9ff]/20 px-6 py-5 space-y-4 font-mono">
            <a href="#platform" className="block text-xs uppercase tracking-[0.18em] text-[#a5b4cf] hover:text-[#57c8ff]" onClick={() => setMobileMenuOpen(false)}>→ Platform</a>
            <a href="#capabilities" className="block text-xs uppercase tracking-[0.18em] text-[#a5b4cf] hover:text-[#57c8ff]" onClick={() => setMobileMenuOpen(false)}>→ Capabilities</a>
            <a href="#workflow" className="block text-xs uppercase tracking-[0.18em] text-[#a5b4cf] hover:text-[#57c8ff]" onClick={() => setMobileMenuOpen(false)}>→ Workflow</a>
            <a href="#pricing" className="block text-xs uppercase tracking-[0.18em] text-[#a5b4cf] hover:text-[#57c8ff]" onClick={() => setMobileMenuOpen(false)}>→ Pricing</a>
            <a href="#faq" className="block text-xs uppercase tracking-[0.18em] text-[#a5b4cf] hover:text-[#57c8ff]" onClick={() => setMobileMenuOpen(false)}>→ FAQ</a>
            <div className="pt-3 border-t border-[#8fd9ff]/20 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/app'); }}
                className="immersive-btn-primary w-full py-3"
              >
                LAUNCH STUDIO VISUALIZER <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ──────── HERO SECTION: GALACTIC IMMERSIVE SHOWCASE ──────── */}
        <section className="pt-14 sm:pt-20 pb-24 px-4 sm:px-6 relative" id="platform">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            
            {/* Official Glowing Blueprint Hero Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mb-6 flex justify-center"
            >
              <img
                src="/bp-new-logo.jpg"
                alt="Blueprint AI Consulting Co."
                width={336}
                height={336}
                loading="eager"
                decoding="async"
                className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full object-cover galactic-glow hover:scale-105 transition-transform"
              />
            </motion.div>

            {/* Galactic Eyebrow Kicker */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="home-eyebrow justify-center mb-5 px-4 py-1.5 rounded-full bg-[#05060c]/60 backdrop-blur-md border border-[#8fd9ff]/25"
              style={{ textShadow: '0 0 12px rgba(87, 200, 255, 0.5)' }}
            >
              <span>BLUEPRINT AI CONSULTING CO. · EXTERIOR STUDIO</span>
            </motion.div>

            {/* Galactic Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display immersive-glitch text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight max-w-5xl mx-auto mb-6"
            >
              <span className="text-white" style={{ textShadow: '0 0 26px rgba(87, 200, 255, 0.35), 0 2px 22px rgba(0, 0, 0, 0.65)' }}>
                Turn exterior photos into{' '}
              </span>
              <span className="text-[#8fd9ff]" style={{ textShadow: '0 0 24px rgba(87, 200, 255, 0.55), 0 2px 22px rgba(0, 0, 0, 0.6)' }}>
                photorealistic live experiences.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base sm:text-lg text-[#e8ecf5]/90 font-light max-w-2xl mx-auto mb-9 leading-relaxed font-sans"
              style={{ textShadow: '0 1px 12px rgba(0, 0, 0, 0.6)' }}
            >
              Give homeowners and sales teams a millimeter-accurate preview of CertainTeed roofing, siding, and designer trims on their actual home in 30 seconds.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <button
                onClick={() => navigate('/app')}
                className="immersive-btn-primary w-full sm:w-auto px-8 py-4 cursor-pointer"
              >
                <span>LAUNCH STUDIO VISUALIZER</span>
                <ArrowRight className="w-4 h-4 text-[#05060c]" />
              </button>

              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="immersive-btn-ghost w-full sm:w-auto px-7 py-4 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-[#57c8ff]" />
                <span>VIEW CONTRACTOR PLANS</span>
              </button>
            </motion.div>
          </div>

          {/* ──────── CENTERPIECE ARCHITECTURAL SHOWCASE WINDOW (.home-film) ──────── */}
          <div className="max-w-6xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="home-film"
            >
              {/* Browser HUD Bar (exact blueprintaiconsultingco.com style) */}
              <div className="home-film-bar">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-[#57c8ff]" />
                  <span>blueprintenvison.app/studio</span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-[#8fd9ff]">
                  <span>CERTAINTEED® PRECISION MESH</span>
                  <span className="home-film-live"><i>●</i> LIVE</span>
                </div>
              </div>

              {/* Inner Showcase Wrapper */}
              <div className="relative overflow-hidden bg-[#05060c] min-h-[420px] sm:min-h-[560px] lg:min-h-[620px] flex items-center justify-center">
                
                {/* Active Render Image */}
                <img
                  src={assetPath(currentPalette.image)}
                  alt="BlueprintEnvision Architectural Render"
                  className="w-full h-full object-cover max-h-[700px] filter brightness-[0.96] contrast-[1.04] transition-all duration-700"
                  onError={(e) => {
                    e.currentTarget.src = assetPath('og-preview.png');
                  }}
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05060c]/95 via-transparent to-black/25 pointer-events-none" />

                {/* Top-Left Live Status Pill */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#05060c]/85 backdrop-blur-md border border-[#8fd9ff]/25 font-mono text-[11px] text-[#e8ecf5] shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#57c8ff] animate-ping" />
                  <span>3 reps active</span>
                  <span className="text-[#8fd9ff]/40">·</span>
                  <span className="text-[#57c8ff] font-semibold">{currentPalette.roof.color}</span>
                </div>

                {/* Top-Right Architecture HUD Badge */}
                <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#05060c]/85 backdrop-blur-md border border-[#8fd9ff]/25 font-mono text-[11px] text-[#a5b4cf] shadow-lg">
                  <Compass className="w-3.5 h-3.5 text-[#007fff]" />
                  <span>GEMINI VISION ENGINE</span>
                </div>

                {/* ── HOTSPOT 1: ROOF (TOP/CENTER) ── */}
                <div className="absolute top-[22%] sm:top-[26%] left-[48%] -translate-x-1/2 z-20 group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#007fff]/35 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#007fff] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#007fff]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-[8px] transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#8fd9ff]">
                        ROOF ZONE · 32 SQ
                      </span>
                      <span className="font-mono text-[9px] font-bold text-[#57c8ff] px-1.5 py-0.5 rounded-[4px] bg-[#57c8ff]/15 border border-[#57c8ff]/35">
                        {currentPalette.roof.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-[4px] border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.roof.hex }}
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.roof.line}</div>
                        <div className="text-[10px] text-[#a5b4cf]">{currentPalette.roof.color}</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#a5b4cf]">Est. Installed:</span>
                      <span className="font-bold text-white">{currentPalette.roof.price}</span>
                    </div>
                  </div>
                </div>

                {/* ── HOTSPOT 2: SIDING (MIDDLE/LEFT) ── */}
                <div className="absolute top-[58%] sm:top-[56%] left-[28%] sm:left-[32%] z-20 group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#57c8ff]/35 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#57c8ff] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#57c8ff]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#05060c]" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-[8px] transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#57c8ff]">
                        SIDING ZONE · MAIN ELEVATION
                      </span>
                      <span className="font-mono text-[9px] font-bold text-[#8fd9ff] px-1.5 py-0.5 rounded-[4px] bg-[#007fff]/20 border border-[#007fff]/40">
                        {currentPalette.siding.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-[4px] border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.siding.hex }}
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.siding.line}</div>
                        <div className="text-[10px] text-[#a5b4cf]">{currentPalette.siding.color}</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#a5b4cf]">Est. Installed:</span>
                      <span className="font-bold text-white">{currentPalette.siding.price}</span>
                    </div>
                  </div>
                </div>

                {/* ── HOTSPOT 3: GABLE / TRIM (TOP/RIGHT) ── */}
                <div className="absolute top-[42%] right-[22%] sm:right-[26%] z-20 group hidden sm:block">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#8fd9ff]/35 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#8fd9ff] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#8fd9ff]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#05060c]" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-60 p-3.5 rounded-[8px] transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#8fd9ff]">
                        TRIM & SOFFIT ZONE
                      </span>
                      <span className="font-mono text-[9px] font-bold text-[#57c8ff] px-1.5 py-0.5 rounded-[4px] bg-[#57c8ff]/15 border border-[#57c8ff]/35">
                        {currentPalette.trim.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-[4px] border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.trim.hex }}
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.trim.line}</div>
                        <div className="text-[10px] text-[#a5b4cf]">{currentPalette.trim.color}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Interactive Palette Switcher Bar (Directly Inside Showcase Frame) */}
                <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-20">
                  <div className="immersive-glass rounded-[8px] p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-white shrink-0">
                      <SlidersHorizontal className="w-4 h-4 text-[#57c8ff]" />
                      <span className="hidden sm:inline uppercase tracking-wider">Palette:</span>
                      <span className="sm:hidden uppercase tracking-wider">Palettes:</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                      {HERO_PALETTES.map((palette, idx) => (
                        <button
                          key={palette.id}
                          onClick={() => setActivePaletteIndex(idx)}
                          className={`px-3 py-2 rounded-[4px] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activePaletteIndex === idx
                              ? 'bg-[#57c8ff] text-[#05060c] shadow-[0_0_20px_rgba(87,200,255,0.45)]'
                              : 'bg-[#05060c]/60 text-[#a5b4cf] hover:text-white hover:bg-[#0a4fd0]/30 border border-[#8fd9ff]/20'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: palette.siding.hex }}
                          />
                          <span className="truncate max-w-[110px] text-[11px]">{palette.label}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate('/app')}
                      className="hidden md:flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#57c8ff] hover:text-[#8fd9ff] px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer"
                    >
                      <span>Open in Studio</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* ──────── EDITORIAL STATEMENT BANNER ──────── */}
        <section className="home-section py-20 px-6 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="home-eyebrow justify-center">
              WEBSITE · IN-HOME CONSULTATION · 4-SIDE FIELD TAKEOFF · ONE PLATFORM
            </div>
            <p className="font-display immersive-glitch text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              “Traditional swatch boards leave homeowners hesitating and reps leaving without a deposit. <span className="text-[#8fd9ff]">BlueprintEnvision renders their finished home</span> before you stand up from the kitchen table.”
            </p>
            <div className="font-mono text-xs text-[#a5b4cf] tracking-wide">
              Adopted by leading exterior contractors across Pennsylvania, New Jersey, and Maryland.
            </div>
          </div>
        </section>

        {/* ──────── PROBLEM VS. BASELINE ──────── */}
        <section className="home-section py-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="home-eyebrow">
                THE DISCONNECT IN EXTERIOR SALES
              </div>
              <h2 className="font-display immersive-glitch text-3xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
                Contractors are losing high-ticket jobs they should be closing.
              </h2>
              <p className="text-sm sm:text-base text-[#a5b4cf] leading-relaxed font-light">
                When a homeowner is considering an $18,000 roof or a $32,000 siding remodel, a 3-inch plastic color chip is not enough reassurance. They delay decisions, consult neighbors, and browse competitor quotes.
              </p>
              <p className="text-sm sm:text-base text-[#a5b4cf] leading-relaxed font-light">
                BlueprintEnvision removes the visualization barrier entirely. By rendering the actual home with CertainTeed Landmark shingles and Monogram siding live in front of the customer, you turn abstract hesitation into instant emotional conviction.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-6 font-mono text-xs font-bold text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#57c8ff]" />
                  <span>Zero Homeowner Login</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#57c8ff]" />
                  <span>30s Render Velocity</span>
                </div>
              </div>
            </div>

            {/* Right Contrast Visual Cards */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              
              {/* Old Way Card */}
              <div className="home-offer pt-6 p-6 immersive-glass flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#ff7a59]/10 border border-[#ff7a59]/30 text-[#ff7a59] font-mono text-[10px] font-bold uppercase tracking-wider mb-5">
                    [01] Traditional Workflow
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Static Swatch Guesswork</h3>
                  <ul className="space-y-3 text-xs text-[#a5b4cf]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff7a59] font-bold">✕</span>
                      <span>Heavy physical sample boards hauled into the living room</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff7a59] font-bold">✕</span>
                      <span>3-week delays waiting for architectural drafting firms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff7a59] font-bold">✕</span>
                      <span>Homeowner indecision leads to 3+ follow-up appointments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff7a59] font-bold">✕</span>
                      <span>Average in-home consultation close rate: <strong className="text-white">26%</strong></span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-[#8fd9ff]/15 font-mono text-[11px] text-[#a5b4cf]">
                  Result: Lost momentum, stalled deals, price-shopping
                </div>
              </div>

              {/* BlueprintEnvision Card */}
              <div className="home-offer pt-6 p-6 immersive-glass border-[#57c8ff]/45 shadow-[0_0_40px_rgba(0,127,255,0.24)] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#007fff]/20 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#57c8ff]/15 border border-[#57c8ff]/40 text-[#57c8ff] font-mono text-[10px] font-bold uppercase tracking-wider mb-5">
                    [02] BlueprintEnvision Standard
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Instant Photorealistic AI</h3>
                  <ul className="space-y-3 text-xs text-[#e8ecf5]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#57c8ff] shrink-0" />
                      <span>Snap a driveway photo or pull Google Street View in 10s</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#57c8ff] shrink-0" />
                      <span>CertainTeed Landmark & Monogram colors applied live</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#57c8ff] shrink-0" />
                      <span>Instant side-by-side comparison slider on reps iPad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#57c8ff] shrink-0" />
                      <span>Average in-home consultation close rate: <strong className="text-[#8fd9ff]">68%</strong></span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-[#8fd9ff]/20 font-mono text-[11px] text-[#57c8ff] font-semibold">
                  Result: Same-day deposit, higher contract margins
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ──────── INTERACTIVE ACCORDION FEATURE SHOWCASE ──────── */}
        <section className="home-section py-24 px-6" id="capabilities">
          <div className="max-w-7xl mx-auto">
            
            <div className="max-w-3xl mb-16">
              <div className="home-eyebrow mb-3">
                WHAT BLUEPRINT ENVISION DOES
              </div>
              <h2 className="font-display immersive-glitch text-3xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
                One unified platform instead of four disconnected tools.
              </h2>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Accordion Menu (Left) */}
              <div className="lg:col-span-6 space-y-3">
                {ACCORDION_FEATURES.map((feat) => {
                  const isOpen = activeAccordionId === feat.id;
                  return (
                    <div
                      key={feat.id}
                      onClick={() => setActiveAccordionId(feat.id)}
                      className={`rounded-[8px] border transition-all cursor-pointer overflow-hidden backdrop-blur-md ${
                        isOpen
                          ? 'bg-[#04163a]/70 border-[#57c8ff]/60 shadow-[0_0_28px_rgba(87,200,255,0.18)]'
                          : 'bg-[#05060c]/55 border-[#8fd9ff]/20 hover:border-[#57c8ff]/45'
                      }`}
                    >
                      <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#57c8ff]">
                            {feat.badge}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            {feat.title}
                          </h3>
                        </div>
                        <div className={`w-8 h-8 rounded-[4px] border flex items-center justify-center shrink-0 font-mono transition-colors ${
                          isOpen ? 'border-[#57c8ff] bg-[#57c8ff]/20 text-[#8fd9ff]' : 'border-[#8fd9ff]/25 text-[#a5b4cf]'
                        }`}>
                          {isOpen ? '—' : '+'}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-6 pt-0 space-y-4 text-xs sm:text-sm text-[#a5b4cf] leading-relaxed border-t border-[#8fd9ff]/15 mt-1">
                          <p className="pt-3">{feat.description}</p>
                          <div className="flex items-center gap-6 pt-2">
                            <div>
                              <div className="text-sm font-extrabold text-white">{feat.stat}</div>
                              <div className="font-mono text-[10px] text-[#8fd9ff] uppercase tracking-wider">{feat.statLabel}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-4">
                  <button
                    onClick={() => navigate('/app')}
                    className="immersive-btn-primary w-full py-4 cursor-pointer"
                  >
                    <span>TEST THIS IN THE LIVE STUDIO</span>
                    <ArrowRight className="w-4 h-4 text-[#05060c]" />
                  </button>
                </div>
              </div>

              {/* Dynamic Feature Display Stage (Right) */}
              <div className="lg:col-span-6 sticky top-28">
                <div className="home-film">
                  <div className="home-film-bar">
                    <div className="flex items-center gap-2">
                      <span className="home-film-live"><i>●</i> ACTIVE</span>
                      <span className="truncate">{activeAccordion.title}</span>
                    </div>
                    <span className="text-[10px] text-[#57c8ff]">{activeAccordion.badge}</span>
                  </div>

                  <div className="p-6 space-y-6 bg-[#05060c]/60">
                    {/* Stage Preview Image Mockup */}
                    <div className="relative rounded-[6px] overflow-hidden aspect-[16/10] bg-[#04163a]/50 border border-[#8fd9ff]/25 shadow-inner">
                      <img
                        src={assetPath('demo-pa-bi-level.png')}
                        alt="Feature preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs gap-3">
                        <div className="bg-[#05060c]/85 backdrop-blur-md px-3 py-1.5 rounded-[4px] border border-[#8fd9ff]/25 text-white font-semibold">
                          {activeAccordion.subtitle}
                        </div>
                        <div className="bg-[#57c8ff] text-[#05060c] font-mono font-bold px-3 py-1.5 rounded-[4px] shadow-[0_0_20px_rgba(87,200,255,0.45)] shrink-0">
                          LIVE ACTIVE
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-[6px] bg-[#04163a]/50 border border-[#8fd9ff]/20">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-[#a5b4cf]">Performance Metric</div>
                        <div className="text-base font-bold text-white mt-0.5">{activeAccordion.stat}</div>
                      </div>
                      <div className="p-3.5 rounded-[6px] bg-[#04163a]/50 border border-[#8fd9ff]/20">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-[#a5b4cf]">Architecture Mode</div>
                        <div className="text-base font-bold text-[#57c8ff] mt-0.5">{activeAccordion.statLabel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ──────── THREE-STEP ROLLOUT WORKFLOW ──────── */}
        <section className="home-section py-24 px-6" id="workflow">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <div className="home-eyebrow justify-center">
                HOW IT WORKS
              </div>
              <h2 className="font-display immersive-glitch text-3xl sm:text-5xl font-bold text-white tracking-tight">
                How a rollout actually works.
              </h2>
              <p className="text-sm sm:text-base text-[#a5b4cf] font-light">
                Zero training curve. Your sales reps and website visitors can begin configuring exterior projects in under five minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {STEPS.map((step, idx) => (
                <div
                  key={step.num}
                  className="home-offer pt-6 p-8 immersive-glass hover:border-[#57c8ff]/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-4xl font-bold text-[#57c8ff]/55 mb-5 font-mono">
                      [{step.num}]
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <div className="font-mono text-xs font-semibold text-[#57c8ff] mb-4">{step.subtitle}</div>
                    <p className="text-xs sm:text-sm text-[#a5b4cf] leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#8fd9ff]/15 flex items-center justify-between font-mono text-[11px] font-bold text-[#a5b4cf]">
                    <span>Step {idx + 1} of 3</span>
                    <span className="text-[#8fd9ff]">VERIFIED FLOW →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── BUILT FOR HOW CONTRACTORS ACTUALLY WORK: 3-SURFACE CARDS ──────── */}
        <section className="home-section py-24 px-6">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="home-eyebrow justify-center">
                ACROSS THE BUYER JOURNEY
              </div>
              <h2 className="font-display immersive-glitch text-3xl sm:text-5xl font-bold text-white tracking-tight">
                One platform, three powerful surfaces.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Card 1: Website */}
              <div className="home-feature pt-6 p-6 immersive-glass flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#007fff]/20 border border-[#007fff]/40 flex items-center justify-center text-[#57c8ff]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8fd9ff]">[01] SURFACE 01</div>
                  <h3 className="text-xl font-bold text-white">On Your Website</h3>
                  <p className="text-xs sm:text-sm text-[#a5b4cf] leading-relaxed">
                    Embed the visualizer directly into your home remodeling website. Visitors explore color combinations 24/7 and submit quotes with pre-selected CertainTeed product specs.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#8fd9ff]/15 font-mono text-xs font-bold text-[#57c8ff]">
                  Captures warm inbound leads →
                </div>
              </div>

              {/* Card 2: Kitchen Table */}
              <div className="home-feature pt-6 p-6 immersive-glass border-[#57c8ff]/50 shadow-[0_0_32px_rgba(0,127,255,0.22)] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#57c8ff]/20 border border-[#57c8ff]/45 flex items-center justify-center text-[#57c8ff]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#57c8ff]">[02] SURFACE 02</div>
                  <h3 className="text-xl font-bold text-white">At the Kitchen Table</h3>
                  <p className="text-xs sm:text-sm text-[#a5b4cf] leading-relaxed">
                    Your sales reps hand an iPad to the homeowner. Together, you slide between the current roof and a brand-new Landmark PRO Moire Black roof, locking in emotional buy-in.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#8fd9ff]/20 font-mono text-xs font-bold text-white">
                  Closes deals on the first visit →
                </div>
              </div>

              {/* Card 3: Field Takeoff */}
              <div className="home-feature pt-6 p-6 immersive-glass flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#007fff]/20 border border-[#8fd9ff]/35 flex items-center justify-center text-[#8fd9ff]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8fd9ff]">[03] SURFACE 03</div>
                  <h3 className="text-xl font-bold text-white">In the Field</h3>
                  <p className="text-xs sm:text-sm text-[#a5b4cf] leading-relaxed">
                    Production managers and estimators record exact wall measurements, subtract window openings, calculate roof squares, and generate clean material takeoff lists on site.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#8fd9ff]/15 font-mono text-xs font-bold text-[#57c8ff]">
                  Eliminates estimation mistakes →
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ──────── PRICING SECTION (PRESERVES STRIPE CHECKOUT) ──────── */}
        <section className="home-section py-24 px-6" id="pricing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="home-eyebrow justify-center">
                TRANSPARENT PRICING
              </div>
              <h2 className="font-display immersive-glitch text-3xl sm:text-5xl font-bold text-white tracking-tight">
                Simple, transparent contractor pricing.
              </h2>
              <p className="text-sm sm:text-base text-[#a5b4cf] font-light">
                Choose the tier that fits your sales volume. Upgrade or cancel anytime from your Stripe customer portal.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  className={`immersive-glass p-8 flex flex-col justify-between transition-all duration-300 relative ${
                    plan.popular
                      ? 'border-[#57c8ff]/65 shadow-[0_0_45px_rgba(0,127,255,0.28)]'
                      : 'hover:border-[#57c8ff]/40'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#57c8ff] text-[#05060c] font-mono text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-[4px] shadow-[0_0_24px_rgba(87,200,255,0.5)]">
                      Most Popular with Contractors
                    </div>
                  )}

                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-xs text-[#a5b4cf] leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="mb-8 pb-6 border-b border-[#8fd9ff]/15">
                      {plan.price !== null ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-5xl font-black text-white">${plan.price}</span>
                          <span className="text-sm font-mono font-semibold text-[#8fd9ff]">{plan.period}</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-black text-white">Custom SLA</div>
                      )}
                    </div>

                    <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-[#e8ecf5]">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#57c8ff] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={checkoutLoading !== null}
                    className={`w-full py-4 cursor-pointer flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'immersive-btn-primary active:scale-95'
                        : 'immersive-btn-ghost'
                    } ${checkoutLoading ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    {checkoutLoading === plan.key ? 'CONNECTING TO STRIPE...' : plan.cta.toUpperCase()}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── FAQ ACCORDION ──────── */}
        <section className="home-section py-24 px-6" id="faq">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <div className="home-eyebrow justify-center">
                FREQUENTLY ASKED QUESTIONS
              </div>
              <h2 className="font-display immersive-glitch text-3xl sm:text-5xl font-bold text-white tracking-tight">
                Everything you need to know.
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="immersive-glass rounded-[8px] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#007fff]/10"
                    >
                      <span className="text-sm sm:text-base font-bold text-white pr-4">{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-[#57c8ff] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 border-t border-[#8fd9ff]/15">
                        <p className="text-xs sm:text-sm text-[#a5b4cf] leading-relaxed font-light pt-3">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────── BOTTOM HERO BANNER ──────── */}
        <section className="home-section py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="immersive-glass rounded-[12px] p-8 sm:p-14 border-[#57c8ff]/35 relative overflow-hidden">
              <div className="max-w-2xl space-y-6 relative z-10">
                <div className="home-eyebrow">
                  NO DELAYS · NO SWATCH GUESSWORK
                </div>
                <h2 className="font-display immersive-glitch text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
                  See your manufacturer catalog live in minutes.
                </h2>
                <p className="text-sm sm:text-base text-[#a5b4cf] leading-relaxed font-light">
                  Give your sales team the definitive unfair advantage. Elevate every homeowner consultation with instantaneous AI visualization and guaranteed material precision.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => navigate('/app')}
                    className="immersive-btn-primary w-full sm:w-auto px-8 py-4 cursor-pointer active:scale-95"
                  >
                    <span>LAUNCH STUDIO VISUALIZER</span>
                    <ArrowRight className="w-4 h-4 text-[#05060c]" />
                  </button>
                  <button
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="immersive-btn-ghost w-full sm:w-auto px-6 py-4 cursor-pointer"
                  >
                    <span>VIEW CONTRACTOR PLANS</span>
                  </button>
                </div>
              </div>

              {/* Background Architectural Watermark */}
              <div className="hidden lg:block absolute right-[-2%] bottom-[-14%] font-display text-[180px] font-bold text-[#57c8ff]/[0.04] select-none pointer-events-none tracking-tighter">
                BLUEPRINT
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ──────── ARCHITECTURAL MINIMALIST FOOTER ──────── */}
      <footer className="home-section border-t border-[#8fd9ff]/20 bg-[#05060c]/80 backdrop-blur-xl py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/bp-new-logo.jpg"
                  alt="Blueprint AI Consulting Co."
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-[#57c8ff]/50 galactic-glow"
                />
                <div className="flex flex-col">
                  <span className="font-display font-bold text-lg tracking-tight text-white leading-none">
                    BLUEPRINT<span className="text-[#57c8ff] ml-1">ENVISION</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#8fd9ff] uppercase tracking-[0.22em] mt-1">
                    Exterior Visualization Studio
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#a5b4cf] leading-relaxed max-w-sm font-sans">
                Next-generation exterior visualization platform for professional roofing, siding, and remodeling contractors. Powered by Gemini AI.
              </p>
              <div className="text-[11px] font-mono text-[#a5b4cf] flex flex-wrap items-center gap-2">
                <span>A</span>
                <a
                  href="https://blueprintaiconsultingco.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#57c8ff] hover:text-[#8fd9ff] hover:underline"
                >
                  Blueprint AI Consulting Co.
                </a>
                <span>Flagship Product · York, PA</span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <h4 className="font-display font-bold uppercase tracking-widest text-white text-xs">Platform</h4>
              <ul className="space-y-2 text-[#a5b4cf]">
                <li><a href="#platform" className="hover:text-[#57c8ff] transition-colors">Studio Visualizer</a></li>
                <li><a href="#capabilities" className="hover:text-[#57c8ff] transition-colors">4-Side Field Takeoff</a></li>
                <li><a href="#pricing" className="hover:text-[#57c8ff] transition-colors">Pricing & Plans</a></li>
                <li><a href="https://blueprintdispatch.app" target="_blank" rel="noreferrer" className="text-[#57c8ff] hover:text-[#8fd9ff] hover:underline">BlueprintDispatch Voice AI →</a></li>
              </ul>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <h4 className="font-display font-bold uppercase tracking-widest text-white text-xs">Legal & Specs</h4>
              <ul className="space-y-2 text-[#a5b4cf]">
                <li>CertainTeed® Landmark® Series</li>
                <li>Monogram® Siding Collection</li>
                <li><a href="mailto:drewhufnagle@gmail.com" className="hover:text-[#57c8ff] transition-colors">Enterprise White-Label Inquiry</a></li>
                <li><a href="mailto:drewhufnagle@gmail.com" className="hover:text-[#57c8ff] transition-colors">Support & Contact</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#8fd9ff]/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#a5b4cf]">
            <p>© {new Date().getFullYear()} Blueprint AI Consulting Co. All rights reserved.</p>
            <p>CertainTeed® is a registered trademark of CertainTeed LLC. Independent visualization software.</p>
          </div>
        </div>
      </footer>

      </div>
    </div>
  );
}
