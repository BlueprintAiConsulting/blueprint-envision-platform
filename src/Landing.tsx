import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles, Shield, Camera,
  Palette, Phone, CheckCircle2,
  ChevronDown, ArrowRight,
  Home, Award, Clock,
  Menu, X
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  SPRING VALLEY ROOFING HOMEOWNER LANDING DATA                    */
/* ─────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    num: '01',
    icon: Camera,
    title: 'Snap & Upload Your Home',
    description: 'Take a photo of your house with your smartphone or choose from our sample home gallery — no apps or downloads needed.'
  },
  {
    num: '02',
    icon: Palette,
    title: 'Mix & Match CertainTeed Colors',
    description: 'Instant AI preview of Landmark® architectural shingles, Monogram® siding, designer trim, and shutters on your actual home in 30 seconds.'
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: 'Get Your Guaranteed Estimate',
    description: 'Save your custom design packet and receive an exact, transparent quote from Chris & Tricia Booth’s certified local team.'
  }
];

const PRODUCTS = [
  {
    title: 'Landmark® Architectural Shingles',
    subtitle: 'CertainTeed Roofing Excellence',
    desc: 'Heavyweight fiberglass dual-layered design engineered for maximum weather protection, Class A fire rating, and rich Max Def color depth.',
    colors: ['Moire Black', 'Weathered Wood', 'Pewterwood', 'Colonial Slate', 'Burnt Sienna', 'Cobblestone Gray'],
    badge: '50-Year Warranty'
  },
  {
    title: 'Monogram® Premium Siding',
    subtitle: 'CertainTeed Siding Mastery',
    desc: 'Heavy-duty .046" thickness featuring TrueTexture™ rough cedar finish, molded from real cedar boards with 40+ designer color palettes.',
    colors: ['Flagstone', 'Charcoal Gray', 'Pacific Blue', 'Colonial White', 'Savanna Wicker', 'Cypress'],
    badge: 'Hurricane Wind Rated'
  },
  {
    title: 'CertainTeed Integrity Roof System®',
    subtitle: 'Complete Waterproof Defense',
    desc: 'Full-system installation including WinterGuard® ice & water barrier, DiamondDeck® high-performance underlayment, and Shadow Ridge® hip & ridge caps.',
    colors: ['WinterGuard® Protection', 'Ridge Venting', 'Drip Edge Flashing', 'Starter Shingles'],
    badge: 'SureStart™ PLUS'
  }
];

const FAQS = [
  {
    q: 'How does the Spring Valley AI Visualizer work?',
    a: 'Simply upload a photo of your house. Our Gemini AI engine detects your roof, siding zones, trim, and accents, then accurately applies authentic CertainTeed colors with realistic lighting and shadows so you can see the finished result before work begins.'
  },
  {
    q: 'Is the visualizer really 100% free?',
    a: 'Yes! There is zero cost, no credit card required, and no obligation. We provide this tool so homeowners in West Chester, Pottstown, and across Chester & Montgomery Counties can make confident exterior design choices.'
  },
  {
    q: 'What CertainTeed products can I test?',
    a: 'You can test CertainTeed Landmark® & Landmark® PRO architectural shingles, Monogram® vinyl siding, Cedar Impressions® polymer shakes, CedarBoards™ board & batten, plus 12 designer trim and shutter colors.'
  },
  {
    q: 'How do I schedule an in-person roof or siding inspection?',
    a: 'Once you customize your design, click "Request Free Quote" inside the visualizer, or give our Pottstown office a call directly at (610) 948-5207. Chris Booth or one of our senior specialists will perform a comprehensive 21-point exterior inspection.'
  },
  {
    q: 'What areas in Pennsylvania does Spring Valley Roofing serve?',
    a: 'We proudly serve Pottstown, West Chester, Exton, Phoenixville, Collegeville, Gilbertsville, King of Prussia, Royersford, and throughout Chester, Montgomery, and Berks Counties (PA HIC #PA149822).'
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  MAIN HOMEOWNER LANDING COMPONENT                               */
/* ─────────────────────────────────────────────────────────────── */

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const base = import.meta.env.BASE_URL || '/';

  return (
    <div className="min-h-screen bg-[#0B131E] text-white overflow-x-hidden font-sans selection:bg-[#18A9D9] selection:text-white">
      
      {/* ──────── TOP ANNOUNCEMENT BAR ──────── */}
      <div className="bg-gradient-to-r from-[#131F2E] via-[#18A9D9]/20 to-[#131F2E] border-b border-[#223448] py-2 px-4 text-center text-xs md:text-sm font-medium text-[#9BA8B8]">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#83C248] animate-pulse"></span>
          <strong className="text-white">PA HIC #PA149822:</strong> Certified CertainTeed Contractor serving West Chester, Pottstown & Chester County.
          <span className="hidden sm:inline text-[#18A9D9] font-semibold">| Call (610) 948-5207</span>
        </span>
      </div>

      {/* ──────── NAVIGATION ──────── */}
      <nav className="sticky top-0 z-50 bg-[#0B131E]/90 backdrop-blur-xl border-b border-[#223448]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src={`${base}assets/logo.png`}
              alt="Spring Valley Roofing"
              className="h-10 md:h-12 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9BA8B8]">
            <a href="#how-it-works" className="hover:text-[#18A9D9] transition-colors">How It Works</a>
            <a href="#products" className="hover:text-[#18A9D9] transition-colors">CertainTeed Products</a>
            <a href="#guarantee" className="hover:text-[#18A9D9] transition-colors">The Spring Valley Promise</a>
            <a href="#faq" className="hover:text-[#18A9D9] transition-colors">FAQ</a>
            <a href="tel:6109485207" className="flex items-center gap-1.5 text-white hover:text-[#83C248] transition-colors font-bold">
              <Phone className="w-4 h-4 text-[#83C248]" /> (610) 948-5207
            </a>
            <button
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-[#83C248] to-[#72AD3C] hover:from-[#93D553] hover:to-[#83C248] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(131,194,72,0.3)] hover:shadow-[0_0_28px_rgba(131,194,72,0.5)] flex items-center gap-2"
            >
              <Palette className="w-4 h-4" /> Launch Visualizer
            </button>
          </div>

          <button className="md:hidden text-[#9BA8B8]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#131F2E] border-b border-[#223448] px-6 py-4 space-y-3 animate-fade-in">
            <a href="#how-it-works" className="block text-sm text-[#9BA8B8]" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#products" className="block text-sm text-[#9BA8B8]" onClick={() => setMobileMenuOpen(false)}>CertainTeed Products</a>
            <a href="#guarantee" className="block text-sm text-[#9BA8B8]" onClick={() => setMobileMenuOpen(false)}>The Spring Valley Promise</a>
            <a href="#faq" className="block text-sm text-[#9BA8B8]" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <a href="tel:6109485207" className="block text-sm font-bold text-[#83C248]">📞 Call (610) 948-5207</a>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/app'); }} className="w-full bg-[#83C248] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <Palette className="w-4 h-4" /> Launch Free Visualizer
            </button>
          </div>
        )}
      </nav>

      {/* ──────── HERO SECTION ──────── */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        {/* Glow ambient background orbs */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#18A9D9]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-28 right-1/4 w-[450px] h-[450px] bg-[#83C248]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2.5 bg-[#131F2E]/90 border border-[#223448] rounded-full px-5 py-2 mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 text-[#18A9D9]" />
              <span className="text-xs md:text-sm font-bold text-[#42C2ED] uppercase tracking-wider">
                Instant CertainTeed AI Exterior Preview
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6 max-w-5xl mx-auto"
          >
            See Your Dream Roof & Siding <br />
            <span className="text-[#18A9D9]">
              Before We Drive A Single Nail.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-[#9BA8B8] max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Preview genuine CertainTeed Landmark® shingles, Monogram® siding, and designer accents on your real home in 30 seconds. Handcrafted for homeowners across West Chester, Pottstown, and Chester County.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <button
              onClick={() => navigate('/app')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#83C248] to-[#72AD3C] hover:from-[#93D553] hover:to-[#83C248] text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-[0_0_25px_rgba(131,194,72,0.4)] hover:shadow-[0_0_35px_rgba(131,194,72,0.6)] flex items-center justify-center gap-2.5"
            >
              <Palette className="w-5 h-5" /> Launch Free Visualizer <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="tel:6109485207"
              className="w-full sm:w-auto bg-[#131F2E] hover:bg-[#192A3E] text-white px-7 py-4 rounded-xl text-base font-semibold transition-all border border-[#223448] hover:border-[#18A9D9] flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#83C248]" /> (610) 948-5207
            </a>
          </motion.div>

          {/* Trust badges */}
          <div className="mt-14 pt-8 border-t border-[#223448]/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#131F2E] border border-[#223448] rounded-xl text-[#18A9D9]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">CertainTeed Certified</div>
                <div className="text-xs text-[#9BA8B8]">5-Star Contractor</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#131F2E] border border-[#223448] rounded-xl text-[#83C248]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">SureStart™ PLUS</div>
                <div className="text-xs text-[#9BA8B8]">50-Year Coverage</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#131F2E] border border-[#223448] rounded-xl text-[#18A9D9]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">30-Second AI Preview</div>
                <div className="text-xs text-[#9BA8B8]">Zero Wait Time</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#131F2E] border border-[#223448] rounded-xl text-[#83C248]">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">PA HIC #PA149822</div>
                <div className="text-xs text-[#9BA8B8]">Pottstown & West Chester</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── HOW IT WORKS ──────── */}
      <section id="how-it-works" className="py-20 px-6 bg-[#0E1622] border-y border-[#223448]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#18A9D9] uppercase tracking-wider">3 Easy Steps</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 tracking-tight">How The Visualizer Works</h2>
            <p className="text-[#9BA8B8] max-w-xl mx-auto mt-3 text-base">
              No guesswork. See authentic manufacturer colors and architectural contours on your home in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="bg-[#131F2E] border border-[#223448] rounded-2xl p-8 hover:border-[#18A9D9]/50 transition-all group relative overflow-hidden"
              >
                <div className="text-5xl font-black text-[#223448] group-hover:text-[#18A9D9]/30 transition-colors absolute top-6 right-6 select-none">
                  {step.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#18A9D9]/20 to-[#83C248]/20 border border-[#18A9D9]/30 flex items-center justify-center mb-6 text-[#18A9D9]">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[#9BA8B8] text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 bg-[#18A9D9] hover:bg-[#0DA7E3] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md"
            >
              Try It On Your Home Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ──────── PRODUCTS SHOWCASE ──────── */}
      <section id="products" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#83C248] uppercase tracking-wider">Manufacturer Certified</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 tracking-tight">CertainTeed Product Lines</h2>
            <p className="text-[#9BA8B8] max-w-2xl mx-auto mt-3 text-base">
              Spring Valley Roofing is a certified CertainTeed installer. We use only authentic architectural products with full manufacturer warranty backing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PRODUCTS.map((prod, idx) => (
              <div key={idx} className="bg-[#131F2E] border border-[#223448] rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="inline-block bg-[#18A9D9]/10 border border-[#18A9D9]/30 text-[#42C2ED] text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {prod.badge}
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-1">{prod.title}</h3>
                  <div className="text-xs font-semibold text-[#83C248] mb-3">{prod.subtitle}</div>
                  <p className="text-[#9BA8B8] text-sm mb-6 leading-relaxed">{prod.desc}</p>
                  
                  <div className="border-t border-[#223448] pt-4">
                    <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Featured Colors:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.colors.map((c, cIdx) => (
                        <span key={cIdx} className="bg-[#0B131E] border border-[#223448] text-[#D0D7DE] text-xs px-2.5 py-1 rounded-md">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => navigate('/app')}
                    className="w-full bg-[#1A2838] hover:bg-[#18A9D9] hover:text-white text-[#42C2ED] py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    Preview in Visualizer <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── THE SPRING VALLEY PROMISE ──────── */}
      <section id="guarantee" className="py-20 px-6 bg-[#0E1622] border-y border-[#223448]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#83C248]/10 border border-[#83C248]/30 rounded-full px-4 py-1.5 mb-6 text-[#83C248] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" /> The Spring Valley Difference
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6">Family-Owned Craftsmanship. Transparent Pricing.</h2>
          <p className="text-[#9BA8B8] text-base md:text-lg max-w-3xl mx-auto mb-12 leading-relaxed">
            Founded by Chris & Tricia Booth, Spring Valley Roofing combines decades of exterior sales and installation expertise with uncompromising respect for your property.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="bg-[#131F2E] p-6 rounded-xl border border-[#223448]">
              <div className="text-2xl mb-3">🧲</div>
              <h4 className="font-bold text-white mb-2">Barefoot Magnet Sweep</h4>
              <p className="text-xs text-[#9BA8B8] leading-relaxed">
                We sweep your yard, driveway, and flowerbeds with commercial magnetic rollers multiple times daily. Safe for your kids and pets.
              </p>
            </div>
            <div className="bg-[#131F2E] p-6 rounded-xl border border-[#223448]">
              <div className="text-2xl mb-3">📜</div>
              <h4 className="font-bold text-white mb-2">PA HIC Compliance</h4>
              <p className="text-xs text-[#9BA8B8] leading-relaxed">
                100% compliant with the PA Home Improvement Consumer Protection Act (PA149822). Clear written specifications and guaranteed rescission protections.
              </p>
            </div>
            <div className="bg-[#131F2E] p-6 rounded-xl border border-[#223448]">
              <div className="text-2xl mb-3">🛡️</div>
              <h4 className="font-bold text-white mb-2">CertainTeed 5-Star Warranty</h4>
              <p className="text-xs text-[#9BA8B8] leading-relaxed">
                As a credentialed installer, we offer CertainTeed SureStart™ PLUS 50-year non-prorated material and labor coverage directly backed by the manufacturer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── FAQ SECTION ──────── */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#18A9D9] uppercase tracking-wider">Common Questions</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#131F2E] border border-[#223448] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left font-bold text-base md:text-lg flex items-center justify-between gap-4 text-white hover:text-[#18A9D9]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform text-[#9BA8B8] ${openFaq === idx ? 'rotate-180 text-[#18A9D9]' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-[#9BA8B8] leading-relaxed border-t border-[#223448]/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FINAL CTA BANNER ──────── */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0E1622] to-[#0B131E] border-t border-[#223448]">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#131F2E] via-[#182B3E] to-[#131F2E] border border-[#18A9D9]/30 rounded-3xl p-10 md:p-16 shadow-[0_0_50px_rgba(24,169,217,0.15)] relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#18A9D9]/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#83C248]/20 rounded-full blur-[80px]" />

          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight relative z-10">
            Ready to See Your Home Reimagined?
          </h2>
          <p className="text-[#9BA8B8] text-base md:text-lg max-w-xl mx-auto mb-8 relative z-10">
            Upload your home photo now and explore CertainTeed shingles and siding in 30 seconds. 100% free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => navigate('/app')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#83C248] to-[#72AD3C] hover:from-[#93D553] hover:to-[#83C248] text-white px-10 py-4 rounded-xl text-base font-bold transition-all shadow-[0_0_30px_rgba(131,194,72,0.4)] flex items-center justify-center gap-2"
            >
              <Palette className="w-5 h-5" /> Launch Free Visualizer <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="tel:6109485207"
              className="w-full sm:w-auto bg-[#0E1620] hover:bg-[#14202E] text-white px-8 py-4 rounded-xl text-base font-semibold transition-all border border-[#223448] flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#83C248]" /> (610) 948-5207
            </a>
          </div>
        </div>
      </section>

      {/* ──────── FOOTER ──────── */}
      <footer className="bg-[#070D15] border-t border-[#223448] py-12 px-6 text-xs text-[#69727D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={`${base}assets/logo.png`}
              alt="Spring Valley Roofing"
              className="h-8 w-auto opacity-80"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div className="font-bold text-[#D0D7DE]">Spring Valley Roofing</div>
              <div>1714 Gilbertsville Road, Pottstown, PA 19464 · (610) 948-5207</div>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div>PA Home Improvement Contractor Registration: <strong className="text-[#9BA8B8]">PA149822</strong></div>
            <div className="mt-1">CertainTeed Landmark® & Monogram® are registered trademarks of CertainTeed LLC.</div>
            <div className="mt-1">© {new Date().getFullYear()} Spring Valley Roofing. Powered by Blueprint AI Consulting Co.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
