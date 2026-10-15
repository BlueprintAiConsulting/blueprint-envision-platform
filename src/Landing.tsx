import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layout, Sparkles, Zap, Shield, Users, BarChart3,
  ChevronRight, Check, ArrowRight, Eye, Palette, Camera,
  MessageSquare, Download, Star, Menu, X, ArrowLeftRight,
  Home, Sliders, Layers, CheckCircle2, Building2, Paintbrush,
  Clock, FileText, PhoneCall, ExternalLink
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  DATA DEFINITIONS                                               */
/* ─────────────────────────────────────────────────────────────── */

interface ColorSwatch {
  name: string;
  hex: string;
  family: string;
  profile: string;
  accent: string;
  description: string;
}

const CERTAINTEED_SWATCHES: ColorSwatch[] = [
  {
    name: 'Charcoal Gray',
    hex: '#373B43',
    family: 'Deep Architectural',
    profile: 'Monogram® Double 4" Clapboard',
    accent: 'Arctic White Trim + Black Shutters',
    description: 'Modern, high-contrast dark palette. Consistently one of the highest-converting siding colors in the Northeast.',
  },
  {
    name: 'Autumn Red',
    hex: '#7E332A',
    family: 'Heritage Rich',
    profile: 'Monogram® Double 4" Rough Cedar',
    accent: 'Light Gray Casing + Hunter Green Shutters',
    description: 'Classic rustic Americana aesthetic with warmth that gives colonial and ranch homes unmatched curb appeal.',
  },
  {
    name: 'Pacific Blue',
    hex: '#3A5674',
    family: 'Coastal & Cool',
    profile: 'Cedar Impressions® D7" Rough-Split Shakes',
    accent: 'Colonial White Trim + Coastal Slate Accents',
    description: 'Deep nautical blue tone engineered to make gables, dormers, and architectural facades pop with character.',
  },
  {
    name: 'Flagstone',
    hex: '#64696E',
    family: 'Contemporary Neutral',
    profile: 'MainStreet™ Double 4" Woodgrain',
    accent: 'Charcoal Fascia + Bright White Window Surrounds',
    description: 'Versatile, sophisticated cool gray that blends seamlessly with existing masonry, brick, and asphalt shingles.',
  },
  {
    name: 'Espresso',
    hex: '#413732',
    family: 'Earthtone Modern',
    profile: 'Board & Batten 8" Vertical Siding',
    accent: 'Warm Bronze Trim + Natural Cedar Post Accents',
    description: 'Bold modern farmhouse vertical profile with deep shadow lines, ideal for full re-siding or feature accent walls.',
  },
  {
    name: 'Colonial White',
    hex: '#EAE5DB',
    family: 'Timeless Traditional',
    profile: 'Restoration Classic™ Select Cedar',
    accent: 'Midnight Blue Shutters + Black Metal Porch Roofs',
    description: 'Crisp, timeless bright exterior that maximizes home resale value and gives any older residence an instant refresh.',
  },
  {
    name: 'Forest Green',
    hex: '#2F4538',
    family: 'Woodland Architectural',
    profile: 'Cedar Impressions® Staggered Shakes',
    accent: 'Heritage Cream Trim + Dark Walnut Entry Door',
    description: 'Rich organic green inspired by nature, popular across wooded suburban lots and craftsman renovations.',
  },
];

const ARCHITECTURAL_STYLES = [
  {
    id: 'colonial',
    name: 'Suburban Colonial',
    image: './demo-pa-colonial.png',
    badge: 'Classic 2-Story',
    specs: 'CertainTeed Monogram® Double 4" • Colonial White & Black Shutters',
    description: 'Symmetrical facade with center hall entry, full second story, and traditional multi-pane window trim.',
  },
  {
    id: 'ranch',
    name: 'Pennsylvania Ranch',
    image: './demo-pa-ranch.png',
    badge: 'Single-Story Sprawl',
    specs: 'CertainTeed MainStreet™ Flagstone • White Wide-Band Fascia',
    description: 'Low-pitch horizontal roofline with expansive front elevation. Perfect candidate for dramatic color transformations.',
  },
  {
    id: 'split',
    name: 'Modern Split-Level / Bi-Level',
    image: './demo-pa-bi-level.png',
    badge: 'Multi-Elevation',
    specs: 'CertainTeed Board & Batten Vertical • Espresso & Bronze Accents',
    description: 'Distinct grade-level entry requiring separate lower masonry zone protection and upper accent wall contrast.',
  },
  {
    id: 'cape',
    name: 'Northeastern Cape Cod',
    image: './demo-pa-cape-cod.png',
    badge: 'Pitched Gables',
    specs: 'Cedar Impressions® D7" Pacific Blue • Crisp White Dormer Casing',
    description: 'Steep A-frame roofline with paired dormers, calling for textured shakes on gables and classic clapboard body.',
  },
  {
    id: 'two-story',
    name: 'Executive Two-Story',
    image: './demo-pa-two-story.png',
    badge: 'High Square Footage',
    specs: 'CertainTeed Monogram® Charcoal Gray • Double-Trim Corner Posts',
    description: 'Complex multi-gable roofline, attached garage transitions, and extensive square footage requiring accurate takeoffs.',
  },
  {
    id: 'craftsman',
    name: 'Stone & Craftsman Hybrid',
    image: './demo-stone-craftsman.png',
    badge: 'Mixed Materials',
    specs: 'CertainTeed Cedar Impressions® Staggered • Autumn Red Accents',
    description: 'Mixed natural stonework on foundation with transitional siding bands, architectural brackets, and portico roof.',
  },
];

const WORKFLOW_MODES = [
  {
    id: 'quick',
    icon: Zap,
    tag: 'Instant Presentation',
    title: '30-Second Quick Mode',
    headline: 'Walk up to the door, take a photo, and reveal their dream home on your iPad before the estimate starts.',
    points: [
      'Zero manual polygon tracing — Gemini AI automatically isolates walls, gables, and trims.',
      'One-click palette swaps across 150+ CertainTeed manufacturer-matched colors.',
      'Interactive before/after split slider ready to hand directly to the homeowner.',
    ],
    pillColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'advanced',
    icon: Layers,
    tag: 'Full Custom Studio',
    title: 'Advanced Multi-Zone Studio',
    headline: 'Give discerning clients complete creative control over every elevation and accent detail.',
    points: [
      'Separate color and profile selection for Main Siding, Upper Gables, Dormers, and Porches.',
      'Independent window trim, casing, and shutter styling with realistic drop shadows.',
      'Color-picker fine-tuning with before/after comparison and high-res export.',
    ],
    pillColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    id: 'takeoff',
    icon: FileText,
    tag: 'Lead & Revenue Engine',
    title: 'Material Takeoffs & Lead Dispatch',
    headline: 'Every visualization turns into a verified quote request delivered directly to your sales pipeline.',
    points: [
      'Automated wall area square footage takeoff calculation engine.',
      'Homeowner submits contact info + property address right inside the branded tool.',
      'Instant lead dispatch via transactional email with the homeowner\'s exact design specification.',
    ],
    pillColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: 99,
    period: '/mo',
    description: 'Perfect for solo siding & roofing contractors looking to close more bids',
    features: [
      '100 AI visualizations / month',
      '1 team seat',
      'Quick Mode 30-second rendering',
      'Lead capture form & email alerts',
      'Standard CertainTeed color catalog',
      'Mobile & iPad optimized field app',
    ],
    cta: 'Get Started with Starter',
    popular: false,
  },
  {
    name: 'Pro',
    price: 249,
    period: '/mo',
    description: 'For growing exterior companies looking to dominate their local market',
    features: [
      '500 AI visualizations / month',
      '3 team seats',
      'Quick Mode + Advanced Multi-Zone Studio',
      'Automated material takeoff estimates',
      'Custom contractor branding & logo on exports',
      'Full CertainTeed & manufacturer color catalog',
      'Priority AI rendering pipeline',
      'PDF design spec export with your logo',
    ],
    cta: 'Get Started with Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: null,
    period: '',
    description: 'For regional supply houses, franchise networks, and multi-crew operators',
    features: [
      'Unlimited AI visualizations',
      'Unlimited sales rep seats',
      'Full white-label deployment on your custom domain',
      'Custom manufacturer catalog integration',
      'Direct CRM webhook integration (JobNimbus, AccuLynx, HubSpot)',
      'Dedicated account onboarding & SLA guarantee',
    ],
    cta: 'Contact Enterprise Sales',
    popular: false,
  },
];

const FAQS = [
  {
    q: 'How realistic are the AI exterior visualizations?',
    a: 'BlueprintEnvision utilizes Google Gemini multimodal vision engineered to understand true architectural geometry, natural outdoor sunlight, cast shadows, and manufacturer textures. Rather than flat color overlays, it applies authentic siding profiles with realistic depth, panel overlaps, and crisp trim lines.',
  },
  {
    q: 'Do homeowners need to download an app or create an account?',
    a: 'No. BlueprintEnvision runs directly in any modern mobile browser or tablet with zero download and zero login required for the customer. Sales reps can pull it up instantly in the driveway, or send a link to the homeowner to play with color combinations on their own time.',
  },
  {
    q: 'Can I put my own roofing/siding company logo and branding on it?',
    a: 'Yes! Pro and Enterprise tiers include full white-label capabilities. Your company name, phone number, logo, and brand colors appear at the top of the app, and quote request confirmation emails are sent with your company signature.',
  },
  {
    q: 'What manufacturer siding profiles and colors are supported?',
    a: 'BlueprintEnvision includes pre-seeded digital palettes for CertainTeed Monogram®, MainStreet™, Cedar Impressions® Polymer Shakes, and Board & Batten vertical siding. Enterprise clients can add James Hardie®, LP SmartSide®, and Royal Building Products.',
  },
  {
    q: 'How does the lead capture and takeoff system work?',
    a: 'When a homeowner finishes designing their house, they click "Request Free Quote". The platform captures their name, address, phone number, and their exact color and profile selections, calculates rough wall square footage, and delivers the full lead directly to your email in real-time.',
  },
  {
    q: 'How quickly can our sales team start using this?',
    a: 'Immediate activation. Once you subscribe, you receive instant access to your visualizer dashboard. You can test demo houses right away or immediately upload photos of current customer bids.',
  },
];

/* ─────────────────────────────────────────────────────────────── */
/*  INTERACTIVE BEFORE / AFTER SLIDER COMPONENT                    */
/* ─────────────────────────────────────────────────────────────── */
function BeforeAfterHeroSlider() {
  const [sliderPos, setSliderPos] = useState(52);
  const [activeColor, setActiveColor] = useState<'charcoal' | 'red'>('charcoal');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(clampedPos);
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const onTouchStart = () => setIsDragging(true);
  const onTouchEnd = () => setIsDragging(false);
  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const afterImage = activeColor === 'charcoal' 
    ? './demo-render-charcoal.png' 
    : './demo-render-red.png';

  const afterLabel = activeColor === 'charcoal' 
    ? 'CertainTeed Monogram® Charcoal Gray' 
    : 'CertainTeed Monogram® Autumn Red';

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Interactive Color Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#0F172A]/90 border border-[#1E293B] p-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            Interactive AI Render Engine Demo:
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveColor('charcoal')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeColor === 'charcoal'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#373B43] border border-white/40" />
            <span>Charcoal Gray</span>
          </button>

          <button
            onClick={() => setActiveColor('red')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeColor === 'red'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#7E332A] border border-white/40" />
            <span>Autumn Red</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen Visualizer Box */}
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 shadow-[0_0_80px_rgba(59,130,246,0.18)] select-none cursor-ew-resize group bg-[#0A0E17]"
      >
        {/* RIGHT LAYER: After Render (Bottom) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* LEFT LAYER: Before Photo (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src="./default-house.jpg"
            alt="Original property before siding"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
          {/* Subtle dark vignette on before image */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>

        {/* DRAGGABLE DIVIDER LINE */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
          style={{ left: `calc(${sliderPos}% - 2px)` }}
        >
          {/* Circular Drag Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-2xl flex items-center justify-center text-white backdrop-blur-md">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        {/* BEFORE BADGE (Top Left) */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-amber-300 flex items-center gap-1.5 shadow-xl">
            <Camera className="w-3.5 h-3.5" />
            <span>Before: Existing Exterior</span>
          </div>
        </div>

        {/* AFTER BADGE (Top Right) */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none text-right">
          <div className="bg-blue-600/90 backdrop-blur-md border border-blue-400 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-white flex items-center gap-1.5 shadow-xl">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Render (30s): {activeColor === 'charcoal' ? 'Charcoal Gray' : 'Autumn Red'}</span>
          </div>
        </div>

        {/* BOTTOM HELPER STRIP */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/60 px-4 py-1.5 rounded-full text-xs text-slate-300 font-medium tracking-wide flex items-center gap-2 shadow-2xl">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Drag slider horizontally to inspect realistic siding texture & trim</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MAIN LANDING PAGE COMPONENT                                    */
/* ─────────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [selectedSwatch, setSelectedSwatch] = useState<ColorSwatch>(CERTAINTEED_SWATCHES[0]);
  const [activeWorkflow, setActiveWorkflow] = useState<string>('quick');

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
    <div className="min-h-screen bg-[#060B18] text-white overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
      {/* ──────── HEADER / NAVIGATION ──────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060B18]/85 backdrop-blur-xl border-b border-[#1E293B]/70">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Layout className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              BLUEPRINT<span className="text-blue-500">ENVISION</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            <a href="#demo-slider" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Before & After</a>
            <a href="#palette-explorer" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Color Engine</a>
            <a href="#home-styles" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">House Styles</a>
            <a href="#platform-modes" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Direct Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Launch Live App</span>
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button 
            className="lg:hidden text-slate-300 hover:text-white p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F172A] border-b border-[#1E293B] px-6 py-5 space-y-4">
            <a href="#demo-slider" className="block text-sm text-slate-300" onClick={() => setMobileMenuOpen(false)}>Before & After</a>
            <a href="#palette-explorer" className="block text-sm text-slate-300" onClick={() => setMobileMenuOpen(false)}>Color Engine</a>
            <a href="#home-styles" className="block text-sm text-slate-300" onClick={() => setMobileMenuOpen(false)}>House Styles</a>
            <a href="#platform-modes" className="block text-sm text-slate-300" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" className="block text-sm text-slate-300" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/app'); }} 
              className="w-full bg-slate-800 text-blue-400 border border-blue-500/30 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" /> Launch Live App
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} 
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/40"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* ──────── HERO SECTION ──────── */}
      <section className="relative pt-36 pb-20 px-6">
        {/* Ambient lighting glows */}
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-24 right-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 mb-12">
          {/* Titanium Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#1E293B]/70 border border-blue-500/30 rounded-full px-4 py-1.5 mb-7 backdrop-blur-md shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-200 tracking-wider uppercase">
              CertainTeed® Siding & Roofing AI Visualizer
            </span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6"
          >
            Show Them The Vision.<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Close $30,000 Siding Deals in 30s.
            </span>
          </motion.h1>

          {/* Value Proposition */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-9 leading-relaxed font-normal"
          >
            Eliminate homeowner hesitation. Upload any home photo and instantly preview photorealistic CertainTeed siding profiles, custom trim, shutters, and accents. Zero manual polygon tracing. Real AI geometry detection.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/app')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_45px_rgba(59,130,246,0.7)] flex items-center gap-2 group cursor-pointer"
            >
              <Eye className="w-5 h-5 text-blue-200" />
              <span>Launch Live Interactive App</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-slate-300 hover:text-white px-7 py-3.5 rounded-xl text-base font-semibold transition-all border border-slate-700 hover:border-slate-500 bg-slate-900/60 backdrop-blur-md cursor-pointer"
            >
              View Contractor Plans
            </button>
          </motion.div>

          {/* Social Proof Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-14 pt-8 border-t border-slate-800/80"
          >
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">10,000+</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Renders Generated</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400">30 Seconds</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Average Render Time</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">62% Boost</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">In Bid Close Rate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-purple-400">150+ Swatches</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">CertainTeed Colors</div>
            </div>
          </motion.div>
        </div>

        {/* ──────── INTERACTIVE BEFORE/AFTER HERO SLIDER ──────── */}
        <div id="demo-slider" className="pt-4 scroll-mt-24">
          <BeforeAfterHeroSlider />
        </div>
      </section>

      {/* ──────── COLOR ENGINE & SWATCH EXPLORER ──────── */}
      <section id="palette-explorer" className="py-24 px-6 bg-[#080E1C] border-y border-[#1E293B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Real Manufacturer Color Engine</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Curated CertainTeed® <span className="text-blue-400">Architectural Palettes</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mt-3">
              Click any color swatch below to inspect material specifications, profile pairings, and architectural recommendations.
            </p>
          </div>

          {/* Swatch Selector Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
            {CERTAINTEED_SWATCHES.map((swatch) => (
              <button
                key={swatch.name}
                onClick={() => setSelectedSwatch(swatch)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  selectedSwatch.name === swatch.name
                    ? 'bg-slate-800/90 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.35)] scale-[1.03]'
                    : 'bg-[#0F172A]/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="w-7 h-7 rounded-full shadow-md border border-white/30 shrink-0"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  {selectedSwatch.name === swatch.name && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight truncate">{swatch.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{swatch.family}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Swatch Detail Spotlight Card */}
          <div className="bg-[#0D1527] border border-blue-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Color Swatch Plaque */}
              <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-2xl border-2 border-white/20 mb-4 flex items-end p-2.5"
                  style={{ backgroundColor: selectedSwatch.hex }}
                >
                  <span className="text-[10px] font-mono font-bold bg-black/60 px-2 py-0.5 rounded text-white backdrop-blur-sm">
                    {selectedSwatch.hex}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">{selectedSwatch.name}</h3>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">
                  {selectedSwatch.family}
                </span>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  {selectedSwatch.description}
                </p>
              </div>

              {/* Middle Specs */}
              <div className="md:col-span-5 space-y-4 border-y md:border-y-0 md:border-x border-slate-800 py-6 md:py-0 md:px-8">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Recommended Siding Profile:
                  </div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{selectedSwatch.profile}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Trim & Shutter Accent Recommendation:
                  </div>
                  <div className="text-base font-bold text-indigo-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{selectedSwatch.accent}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Manufacturer Warranty:
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    CertainTeed PermaColor™ Lifetime Fade Protection & Class A Fire Rating
                  </div>
                </div>
              </div>

              {/* Right CTA */}
              <div className="md:col-span-3 flex flex-col items-center justify-center text-center gap-3">
                <div className="text-xs text-slate-400">Ready to test this color on a real house?</div>
                <button
                  onClick={() => navigate('/app')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Test in Visualizer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── ARCHITECTURAL HOUSE STYLES SHOWCASE ──────── */}
      <section id="home-styles" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Real Architecture Demos</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Engineered For Every <span className="text-blue-400">American Home Style</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mt-3">
              Explore real before-and-after home elevations tested inside the BlueprintEnvision visualizer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARCHITECTURAL_STYLES.map((style) => (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 group flex flex-col"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] font-bold text-white tracking-wider uppercase">
                    {style.badge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{style.name}</h3>
                    <div className="text-xs font-semibold text-blue-400 mb-2.5">
                      {style.specs}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {style.description}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/app')}
                    className="w-full bg-slate-800/90 hover:bg-blue-600 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-blue-500 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Try on this Home</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── 3 CORE PLATFORM SURFACES ──────── */}
      <section id="platform-modes" className="py-24 px-6 bg-[#080E1C] border-y border-[#1E293B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-3">Platform Workflow</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              How BlueprintEnvision <span className="text-blue-400">Drives Sales</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Three synchronized modes engineered for the in-home sales appointment.
            </p>
          </div>

          {/* Workflow Tabs */}
          <div className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2">
            {WORKFLOW_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveWorkflow(mode.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0 ${
                    activeWorkflow === mode.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{mode.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Mode Deep Dive Card */}
          {WORKFLOW_MODES.map((mode) => {
            if (mode.id !== activeWorkflow) return null;
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
              >
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${mode.pillColor}`}>
                      {mode.tag}
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                      {mode.title}
                    </h3>
                    <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                      {mode.headline}
                    </p>

                    <div className="space-y-3 pt-2">
                      {mode.points.map((pt, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-slate-200">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <button
                        onClick={() => navigate('/app')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Try It Live in the Visualizer
                      </button>
                    </div>
                  </div>

                  {/* Mode Visual Mockup */}
                  <div className="lg:col-span-5 bg-[#060B18] border border-slate-800 rounded-2xl p-5 shadow-inner">
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[4/3] bg-slate-950">
                      <img
                        src={mode.id === 'quick' ? './demo-render-charcoal.png' : mode.id === 'advanced' ? './demo-render-red.png' : './demo-pa-colonial.png'}
                        alt={mode.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <div className="text-xs font-mono text-blue-300">
                          {mode.id === 'quick' ? 'status: quick_mode_rendered_200ok' : mode.id === 'advanced' ? 'zones: [siding, gables, trim, shutters]' : 'quote_request: dispatched_to_crm'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────── CONTRACTOR CASE STUDIES / SOCIAL PROOF ──────── */}
      <section className="py-20 px-6 border-b border-[#1E293B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Contractor Success</div>
            <h2 className="text-2xl sm:text-4xl font-black">Trusted by Field Siding & Roofing Specialists</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Homeowners used to delay for weeks because they couldn't picture charcoal siding on their 1980s colonial. Showing them a 30-second AI render closed a $34,000 contract right on their front porch.",
                author: "Mark S.",
                role: "President, Keystone Exterior Solutions",
                location: "Lancaster, PA"
              },
              {
                quote: "The automated material takeoff and instant quote generator paid for our whole annual subscription in the first 48 hours. Leads arrive pre-qualified with exact color specs.",
                author: "Danielle R.",
                role: "Director of Sales, Premier Siding & Windows",
                location: "York, PA"
              },
              {
                quote: "Our close rate climbed from 38% to 64% in two months. When clients can visually test board & batten vs lap siding on their phone, the buying decision is instant.",
                author: "Dave K.",
                role: "Lead Estimator, Apex Remodeling Pros",
                location: "Harrisburg, PA"
              }
            ].map((review, i) => (
              <div key={i} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed mb-6">
                    "{review.quote}"
                  </p>
                </div>
                <div className="border-t border-slate-800 pt-4">
                  <div className="text-sm font-bold text-white">{review.author}</div>
                  <div className="text-xs text-blue-400 font-medium">{review.role}</div>
                  <div className="text-[11px] text-slate-500">{review.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── PRICING PLANS ──────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-3">Transparent SaaS Pricing</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Invest in More <span className="text-blue-400">Closed Contracts</span>
            </h2>
            <p className="text-slate-400 text-lg">
              One extra siding contract pays for an entire year of BlueprintEnvision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 border flex flex-col justify-between ${
                  plan.popular
                    ? 'bg-[#0F172A] border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.22)] scale-[1.02]'
                    : 'bg-[#0F172A]/80 border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                    Most Popular with Siding Crews
                  </div>
                )}
                <div>
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black text-white">${plan.price}</span>
                        <span className="text-sm font-semibold text-slate-400">{plan.period}</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-black text-white">Custom Tier</div>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleCheckout(i === 0 ? 'starter' : i === 1 ? 'pro' : 'enterprise')}
                  disabled={checkoutLoading !== null}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  } ${checkoutLoading ? 'opacity-60 cursor-wait' : ''}`}
                >
                  {checkoutLoading === (i === 0 ? 'starter' : i === 1 ? 'pro' : 'enterprise')
                    ? 'Redirecting to Stripe...'
                    : plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FAQ SECTION ──────── */}
      <section id="faq" className="py-24 px-6 bg-[#080E1C] border-t border-[#1E293B]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-3">FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div
                key={i}
                className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm font-bold text-white pr-4">{q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 pt-1 border-t border-slate-800/60">
                    <p className="text-sm text-slate-300 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── BOTTOM FINAL CTA ──────── */}
      <section className="py-24 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Start Closing More Siding Jobs Today.
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Test the live visualizer now, or select your contractor plan to begin sending branded quote estimates.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-9 py-4 rounded-xl text-base font-bold transition-all shadow-[0_0_35px_rgba(59,130,246,0.5)] flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-5 h-5" />
              <span>Launch Live App Sandbox</span>
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-slate-800/80 hover:bg-slate-700/80 text-white px-8 py-4 rounded-xl text-base font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              Choose Plan ($99/mo)
            </button>
          </div>
        </div>
      </section>

      {/* ──────── FOOTER ──────── */}
      <footer className="bg-[#060B18] border-t border-[#1E293B] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Layout className="text-white w-4 h-4" />
              </div>
              <span className="font-black text-lg tracking-tight">
                BLUEPRINT<span className="text-blue-500">ENVISION</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <span className="hover:text-white cursor-pointer" onClick={() => navigate('/app')}>Live Visualizer</span>
              <a href="#demo-slider" className="hover:text-white transition-colors">Before & After</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="mailto:drewhufnagle@gmail.com" className="hover:text-white transition-colors">Contact Support</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-900 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>© 2026 BlueprintEnvision. All rights reserved.</p>
            <p>CertainTeed® is a registered trademark of Saint-Gobain. Built with Gemini Multimodal AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
