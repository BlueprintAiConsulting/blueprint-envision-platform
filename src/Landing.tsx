import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles, Shield, ChevronRight, Check, ArrowRight,
  Eye, Palette, Camera, MessageSquare, Menu, X,
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
    <div className="min-h-screen bg-[#060B18] text-[#E2E8F0] selection:bg-[#3B82F6] selection:text-white relative">
      
      {/* ──────── TOP AMBIENT ARCHITECTURAL GLOW ──────── */}
      <div className="absolute top-0 inset-x-0 h-[650px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#3B82F6]/15 via-[#18A9D9]/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[10%] right-[15%] w-[450px] h-[450px] bg-[#83C248]/8 blur-[100px] rounded-full" />
      </div>

      {/* ──────── MINIMALIST STICKY HEADER (ARCWAY STYLE) ──────── */}
      <header className="sticky top-0 z-50 bg-[#060B18]/85 backdrop-blur-xl border-b border-[#1E293B]/70 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#18A9D9] flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.5)]">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                BLUEPRINT<span className="text-[#3B82F6]">ENVISION</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#18A9D9]">
                Architectural Exterior Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-9 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="text-xs font-bold text-[#94A3B8] hover:text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Studio Demo
            </button>
            <button
              onClick={() => navigate('/app')}
              className="bg-[#83C248] hover:bg-[#93D553] text-[#060B18] px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(131,194,72,0.35)] hover:shadow-[0_0_30px_rgba(131,194,72,0.5)] flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#060B18]" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#94A3B8] hover:text-white rounded-lg border border-[#1E293B]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B131E] border-b border-[#1E293B] px-6 py-5 space-y-4">
            <a href="#platform" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>Platform</a>
            <a href="#capabilities" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
            <a href="#workflow" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
            <a href="#pricing" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div className="pt-3 border-t border-[#1E293B] flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/app'); }}
                className="w-full bg-[#83C248] text-[#060B18] py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Launch Studio Visualizer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ──────── HERO SECTION: EDITORIAL HEADLINE & CENTERPIECE SHOWCASE ──────── */}
        <section className="pt-20 pb-24 px-4 sm:px-6 relative" id="platform">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Pill Kicker */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0F172A] border border-[#223448] shadow-inner mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#83C248] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18A9D9]">
                AI-Powered Exterior Visualization Platform
              </span>
            </motion.div>

            {/* Editorial Serif Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif-editorial text-4xl sm:text-6xl md:text-7xl font-normal text-white leading-[1.08] tracking-[-0.02em] max-w-4xl mx-auto mb-6"
            >
              Turn exterior floorplans and photos into <span className="italic text-[#18A9D9]">photorealistic live experiences</span>.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-[#94A3B8] font-light max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Give homeowners and sales teams a millimeter-accurate preview of CertainTeed roofing, siding, and designer trims on their actual home in 30 seconds.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16"
            >
              <button
                onClick={() => navigate('/app')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#83C248] hover:bg-[#93D553] text-[#060B18] font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_24px_rgba(131,194,72,0.4)] hover:shadow-[0_0_36px_rgba(131,194,72,0.6)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Launch Studio Visualizer</span>
                <ArrowRight className="w-4 h-4 text-[#060B18]" />
              </button>

              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#0F172A] hover:bg-[#131F2E] text-white border border-[#223448] hover:border-[#3B82F6] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-[#18A9D9]" />
                <span>Explore Contractor Pricing</span>
              </button>
            </motion.div>
          </div>

          {/* ──────── ARCWAY SIGNATURE: CENTERPIECE ARCHITECTURAL SHOWCASE WITH HOTSPOTS ──────── */}
          <div className="max-w-6xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="arc-frame rounded-3xl p-2.5 sm:p-4 relative"
            >
              {/* Inner Showcase Wrapper */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0A0E17] border border-[#223448] shadow-2xl min-h-[420px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center">
                
                {/* Active Render Image */}
                <img
                  src={assetPath(currentPalette.image)}
                  alt="BlueprintEnvision Architectural Render"
                  className="w-full h-full object-cover max-h-[720px] filter brightness-[0.96] contrast-[1.04] transition-all duration-700"
                  onError={(e) => {
                    e.currentTarget.src = assetPath('og-preview.png');
                  }}
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060B18]/90 via-transparent to-black/30 pointer-events-none" />

                {/* Top-Left Live Status Pill */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B131E]/85 backdrop-blur-md border border-white/10 text-[11px] font-medium text-[#E2E8F0] shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#83C248] animate-ping" />
                  <span>3 contractors viewing</span>
                  <span className="text-[#64748B]">·</span>
                  <span className="text-[#18A9D9] font-semibold">{currentPalette.roof.color} applied</span>
                </div>

                {/* Top-Right Architecture HUD Badge */}
                <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B131E]/85 backdrop-blur-md border border-white/10 text-[11px] font-medium text-[#94A3B8] shadow-lg">
                  <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>CertainTeed® Precision Mesh</span>
                </div>

                {/* ── HOTSPOT 1: ROOF (TOP/CENTER) ── */}
                <div className="absolute top-[22%] sm:top-[26%] left-[48%] -translate-x-1/2 z-20 group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#3B82F6]/30 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#3B82F6] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#3B82F6]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-xl transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#3B82F6]">
                        ROOF ZONE · 32 SQ
                      </span>
                      <span className="text-[9px] font-bold text-[#83C248] px-1.5 py-0.5 rounded bg-[#83C248]/15 border border-[#83C248]/30">
                        {currentPalette.roof.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.roof.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.roof.line}</div>
                        <div className="text-[10px] text-[#94A3B8]">{currentPalette.roof.color}</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">Est. Installed:</span>
                      <span className="font-bold text-white">{currentPalette.roof.price}</span>
                    </div>
                  </div>
                </div>

                {/* ── HOTSPOT 2: SIDING (MIDDLE/LEFT) ── */}
                <div className="absolute top-[58%] sm:top-[56%] left-[28%] sm:left-[32%] z-20 group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#18A9D9]/30 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#18A9D9] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#18A9D9]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-xl transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#18A9D9]">
                        SIDING ZONE · MAIN ELEVATION
                      </span>
                      <span className="text-[9px] font-bold text-[#60A5FA] px-1.5 py-0.5 rounded bg-[#3B82F6]/15 border border-[#3B82F6]/30">
                        {currentPalette.siding.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.siding.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.siding.line}</div>
                        <div className="text-[10px] text-[#94A3B8]">{currentPalette.siding.color}</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">Est. Installed:</span>
                      <span className="font-bold text-white">{currentPalette.siding.price}</span>
                    </div>
                  </div>
                </div>

                {/* ── HOTSPOT 3: GABLE / TRIM (TOP/RIGHT) ── */}
                <div className="absolute top-[42%] right-[22%] sm:right-[26%] z-20 group hidden sm:block">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#83C248]/30 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#83C248] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#83C248]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-60 p-3.5 rounded-xl transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#83C248]">
                        TRIM & SOFFIT ZONE
                      </span>
                      <span className="text-[9px] font-bold text-[#83C248] px-1.5 py-0.5 rounded bg-[#83C248]/15 border border-[#83C248]/30">
                        {currentPalette.trim.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.trim.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.trim.line}</div>
                        <div className="text-[10px] text-[#94A3B8]">{currentPalette.trim.color}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Interactive Palette Switcher Bar (Directly Inside Showcase Frame) */}
                <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-20">
                  <div className="bg-[#0B131E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-white shrink-0">
                      <SlidersHorizontal className="w-4 h-4 text-[#18A9D9]" />
                      <span className="hidden sm:inline">Active Architectural Palette:</span>
                      <span className="sm:hidden">Palettes:</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                      {HERO_PALETTES.map((palette, idx) => (
                        <button
                          key={palette.id}
                          onClick={() => setActivePaletteIndex(idx)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activePaletteIndex === idx
                              ? 'bg-[#3B82F6] text-white shadow-[0_0_16px_rgba(59,130,246,0.5)] border border-white/20'
                              : 'bg-[#131F2E] text-[#94A3B8] hover:text-white hover:bg-[#1A2838] border border-transparent'
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
                      className="hidden md:flex items-center gap-1.5 text-xs font-extrabold text-[#83C248] hover:text-[#93D553] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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

        {/* ──────── EDITORIAL STATEMENT BANNER (ARCWAY STYLE) ──────── */}
        <section className="border-y border-[#1E293B]/80 py-20 px-6 bg-[#080E1E] relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="text-xs uppercase tracking-[0.28em] font-extrabold text-[#18A9D9]">
              WEBSITE · IN-HOME CONSULTATION · 4-SIDE FIELD TAKEOFF · ONE PLATFORM
            </div>
            <p className="font-serif-editorial text-2xl sm:text-4xl md:text-5xl font-normal text-white leading-tight">
              “Traditional swatch boards leave homeowners hesitating and reps leaving without a deposit. BlueprintEnvision renders their finished home before you stand up from the kitchen table.”
            </p>
            <div className="text-xs font-semibold text-[#64748B] tracking-wide">
              Adopted by leading exterior contractors across Pennsylvania, New Jersey, and Maryland.
            </div>
          </div>
        </section>

        {/* ──────── PROBLEM VS. BASELINE: EDITORIAL NARRATIVE CONTRAST ──────── */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9]">
                THE DISCONNECT IN EXTERIOR SALES
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white leading-tight">
                Contractors are losing high-ticket jobs they should be closing.
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-light">
                When a homeowner is considering an $18,000 roof or a $32,000 siding remodel, a 3-inch plastic color chip is not enough reassurance. They delay decisions, consult neighbors, and browse competitor quotes.
              </p>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-light">
                BlueprintEnvision removes the visualization barrier entirely. By rendering the actual home with CertainTeed Landmark shingles and Monogram siding live in front of the customer, you turn abstract hesitation into instant emotional conviction.
              </p>
              
              <div className="pt-2 flex items-center gap-6 text-xs font-bold text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#83C248]" />
                  <span>Zero Homeowner Login</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#83C248]" />
                  <span>30s Render Velocity</span>
                </div>
              </div>
            </div>

            {/* Right Contrast Visual Cards */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
              
              {/* Old Way Card */}
              <div className="rounded-2xl p-6 bg-[#0B131E] border border-[#1E293B] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider mb-5">
                    Traditional Workflow
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Static Swatch Guesswork</h3>
                  <ul className="space-y-3 text-xs text-[#94A3B8]">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>Heavy physical sample boards hauled into the living room</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>3-week delays waiting for architectural drafting firms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>Homeowner indecision leads to 3+ follow-up appointments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>Average in-home consultation close rate: <strong>26%</strong></span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-[#1E293B] text-[11px] text-[#64748B]">
                  Result: Lost momentum, stalled deals, price-shopping
                </div>
              </div>

              {/* BlueprintEnvision Card */}
              <div className="rounded-2xl p-6 bg-[#0F172A] border border-[#3B82F6] shadow-[0_0_35px_rgba(59,130,246,0.18)] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#83C248]/15 border border-[#83C248]/30 text-[#83C248] text-[10px] font-bold uppercase tracking-wider mb-5">
                    BlueprintEnvision Standard
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Instant Photorealistic AI</h3>
                  <ul className="space-y-3 text-xs text-[#E2E8F0]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#83C248] shrink-0" />
                      <span>Snap a driveway photo or pull Google Street View in 10s</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#83C248] shrink-0" />
                      <span>CertainTeed Landmark & Monogram colors applied live</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#83C248] shrink-0" />
                      <span>Instant side-by-side comparison slider on reps iPad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#83C248] shrink-0" />
                      <span>Average in-home consultation close rate: <strong>68%</strong></span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-[#223448] text-[11px] text-[#18A9D9] font-semibold">
                  Result: Same-day deposit, higher contract margins
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ──────── INTERACTIVE ACCORDION FEATURE SHOWCASE (ARCWAY SIGNATURE) ──────── */}
        <section className="py-24 px-6 bg-[#080E1E] border-y border-[#1E293B]/80" id="capabilities">
          <div className="max-w-7xl mx-auto">
            
            <div className="max-w-3xl mb-16">
              <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9] mb-3">
                WHAT BLUEPRINT ENVISION DOES
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white leading-tight">
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
                      className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                        isOpen
                          ? 'bg-[#0F172A] border-[#3B82F6]/60 shadow-[0_0_24px_rgba(59,130,246,0.12)]'
                          : 'bg-[#0B131E] border-[#1E293B] hover:border-[#334155]'
                      }`}
                    >
                      <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#18A9D9]">
                            {feat.badge}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            {feat.title}
                          </h3>
                        </div>
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? 'border-[#3B82F6] bg-[#3B82F6]/20 text-[#60A5FA]' : 'border-[#223448] text-[#64748B]'
                        }`}>
                          {isOpen ? '—' : '+'}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-6 pt-0 space-y-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed border-t border-[#1E293B]/60 mt-1">
                          <p className="pt-3">{feat.description}</p>
                          <div className="flex items-center gap-6 pt-2">
                            <div>
                              <div className="text-sm font-extrabold text-white">{feat.stat}</div>
                              <div className="text-[10px] text-[#64748B] uppercase tracking-wider">{feat.statLabel}</div>
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
                    className="w-full py-4 rounded-xl bg-[#83C248] hover:bg-[#93D553] text-[#060B18] font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(131,194,72,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Test This In The Live Studio</span>
                    <ArrowRight className="w-4 h-4 text-[#060B18]" />
                  </button>
                </div>
              </div>

              {/* Dynamic Feature Display Stage (Right) */}
              <div className="lg:col-span-6 sticky top-28">
                <div className="arc-frame rounded-3xl p-3 sm:p-4 bg-[#0B131E] border border-[#223448] shadow-2xl">
                  <div className="rounded-2xl overflow-hidden bg-[#060B18] border border-[#1E293B] p-6 space-y-6">
                    
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                          Active Module: {activeAccordion.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#18A9D9] px-2 py-0.5 rounded bg-[#18A9D9]/10 border border-[#18A9D9]/20">
                        {activeAccordion.badge}
                      </span>
                    </div>

                    {/* Stage Preview Image Mockup */}
                    <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[#0F172A] border border-[#223448] shadow-inner">
                      <img
                        src={assetPath('demo-pa-bi-level.png')}
                        alt="Feature preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                        <div className="bg-[#0B131E]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-semibold">
                          {activeAccordion.subtitle}
                        </div>
                        <div className="bg-[#83C248] text-[#060B18] font-extrabold px-3 py-1.5 rounded-lg shadow-lg">
                          Live Active
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-[#0B131E] border border-[#1E293B]">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Performance Metric</div>
                        <div className="text-base font-bold text-white mt-0.5">{activeAccordion.stat}</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#0B131E] border border-[#1E293B]">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Architecture Mode</div>
                        <div className="text-base font-bold text-[#18A9D9] mt-0.5">{activeAccordion.statLabel}</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ──────── THREE-STEP ROLLOUT WORKFLOW (ARCWAY STYLE) ──────── */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="workflow">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9]">
              HOW IT WORKS
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white">
              How a rollout actually works.
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] font-light">
              Zero training curve. Your sales reps and website visitors can begin configuring exterior projects in under five minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                className="relative bg-[#0B131E] border border-[#1E293B] rounded-2xl p-8 hover:border-[#3B82F6]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="text-5xl font-black text-[#1E293B] mb-6 font-mono">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <div className="text-xs font-semibold text-[#18A9D9] mb-4">{step.subtitle}</div>
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-bold text-[#64748B]">
                  <span>Step {idx + 1} of 3</span>
                  <span className="text-[#83C248]">Verified Flow</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────── BUILT FOR HOW CONTRACTORS ACTUALLY WORK: 3-SURFACE CARDS ──────── */}
        <section className="py-24 px-6 bg-[#080E1E] border-y border-[#1E293B]/80">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9]">
                ACROSS THE BUYER JOURNEY
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white">
                One platform, three powerful surfaces.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Card 1: Website */}
              <div className="arc-frame rounded-2xl p-6 flex flex-col justify-between bg-[#0B131E] border border-[#1E293B]">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#18A9D9]">SURFACE 01</div>
                  <h3 className="text-xl font-bold text-white">On Your Website</h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                    Embed the visualizer directly into your home remodeling website. Visitors explore color combinations 24/7 and submit quotes with pre-selected CertainTeed product specs.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#1E293B] text-xs font-bold text-[#83C248]">
                  Captures warm inbound leads
                </div>
              </div>

              {/* Card 2: Kitchen Table */}
              <div className="arc-frame rounded-2xl p-6 flex flex-col justify-between bg-[#0B131E] border border-[#3B82F6]/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#83C248]/15 border border-[#83C248]/30 flex items-center justify-center text-[#83C248]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#83C248]">SURFACE 02</div>
                  <h3 className="text-xl font-bold text-white">At the Kitchen Table</h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                    Your sales reps hand an iPad to the homeowner. Together, you slide between the current roof and a brand-new Landmark PRO Moire Black roof, locking in emotional buy-in.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#1E293B] text-xs font-bold text-white">
                  Closes deals on the first visit
                </div>
              </div>

              {/* Card 3: Field Takeoff */}
              <div className="arc-frame rounded-2xl p-6 flex flex-col justify-between bg-[#0B131E] border border-[#1E293B]">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#18A9D9]/15 border border-[#18A9D9]/30 flex items-center justify-center text-[#18A9D9]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#18A9D9]">SURFACE 03</div>
                  <h3 className="text-xl font-bold text-white">In the Field</h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                    Production managers and estimators record exact wall measurements, subtract window openings, calculate roof squares, and generate clean material takeoff lists on site.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#1E293B] text-xs font-bold text-[#18A9D9]">
                  Eliminates estimation mistakes
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ──────── PRICING SECTION (PRESERVES STRIPE CHECKOUT) ──────── */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="pricing">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9]">
              TRANSPARENT PRICING
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white">
              Simple, transparent contractor pricing.
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] font-light">
              Choose the tier that fits your sales volume. Upgrade or cancel anytime from your Stripe customer portal.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.popular
                    ? 'bg-[#0F172A] border-2 border-[#3B82F6] shadow-[0_0_40px_rgba(59,130,246,0.22)]'
                    : 'bg-[#0B131E] border border-[#1E293B] hover:border-[#334155]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                    Most Popular with Contractors
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="mb-8 pb-6 border-b border-[#1E293B]">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-black text-white">${plan.price}</span>
                        <span className="text-sm font-semibold text-[#64748B]">{plan.period}</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-black text-white">Custom SLA</div>
                    )}
                  </div>

                  <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-[#E2E8F0]">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#83C248] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={checkoutLoading !== null}
                  className={`w-full py-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-[#83C248] hover:bg-[#93D553] text-[#060B18] shadow-[0_0_24px_rgba(131,194,72,0.4)] active:scale-95'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155]'
                  } ${checkoutLoading ? 'opacity-60 cursor-wait' : ''}`}
                >
                  {checkoutLoading === plan.key ? 'Connecting to Stripe...' : plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ──────── FAQ ACCORDION ──────── */}
        <section className="py-24 px-6 bg-[#080E1E] border-t border-[#1E293B]/80" id="faq">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9]">
                FREQUENTLY ASKED QUESTIONS
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white">
                Everything you need to know.
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-[#0B131E] border border-[#1E293B] rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#131F2E]/40"
                    >
                      <span className="text-sm sm:text-base font-bold text-white pr-4">{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-[#18A9D9] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 border-t border-[#1E293B]/60">
                        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-light">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────── BOTTOM HERO BANNER / TABLET SHOWCASE (ARCWAY STYLE) ──────── */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="arc-frame rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-[#0F172A] via-[#0B131E] to-[#060B18] border border-[#3B82F6]/40 relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18A9D9]/15 border border-[#18A9D9]/30 text-[#18A9D9] text-xs font-extrabold uppercase tracking-widest">
                NO DELAYS · NO SWATCH GUESSWORK
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl md:text-6xl font-normal text-white leading-tight">
                See your manufacturer catalog live in minutes.
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-light">
                Give your sales team the definitive unfair advantage. Elevate every homeowner consultation with instantaneous AI visualization and guaranteed material precision.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate('/app')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#83C248] hover:bg-[#93D553] text-[#060B18] font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_24px_rgba(131,194,72,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Launch Studio Visualizer</span>
                  <ArrowRight className="w-4 h-4 text-[#060B18]" />
                </button>
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#131F2E] hover:bg-[#1A2838] text-white border border-[#223448] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Contractor Plans</span>
                </button>
              </div>
            </div>

            {/* Background Architectural Watermark */}
            <div className="absolute right-[-4%] bottom-[-15%] font-serif-editorial text-[140px] sm:text-[220px] font-normal text-white/[0.03] select-none pointer-events-none tracking-tighter">
              BLUEPRINT
            </div>
          </div>
        </section>

      </main>

      {/* ──────── ARCHITECTURAL MINIMALIST FOOTER ──────── */}
      <footer className="border-t border-[#1E293B] bg-[#060B18] py-14 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#18A9D9] flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  BLUEPRINT<span className="text-[#3B82F6]">ENVISION</span>
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-sm">
                Next-generation exterior visualization platform for professional roofing, siding, and remodeling contractors. Powered by Gemini AI.
              </p>
              <div className="text-[11px] text-[#475569]">
                Blueprint AI Consulting Co. · All rights reserved.
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">Platform</h4>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li><a href="#platform" className="hover:text-white transition-colors">Studio Visualizer</a></li>
                <li><a href="#capabilities" className="hover:text-white transition-colors">4-Side Field Takeoff</a></li>
                <li><a href="#capabilities" className="hover:text-white transition-colors">Street View Engine</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">Legal & Specs</h4>
              <ul className="space-y-2 text-xs text-[#64748B]">
                <li>CertainTeed® Landmark® Series</li>
                <li>Monogram® Siding Collection</li>
                <li><a href="mailto:drewhufnagle@gmail.com" className="hover:text-[#94A3B8] transition-colors">Enterprise White-Label Inquiry</a></li>
                <li><a href="mailto:drewhufnagle@gmail.com" className="hover:text-[#94A3B8] transition-colors">Support & Contact</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#1E293B] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#475569]">
            <p>© {new Date().getFullYear()} BlueprintEnvision. Built for exterior contractors.</p>
            <p>CertainTeed® is a registered trademark of CertainTeed LLC. Independent visualization software.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
