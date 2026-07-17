import React from 'react';

interface FooterProps {
  onShowToS: () => void;
  onShowPrivacy: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowToS, onShowPrivacy }) => {
  const base = import.meta.env.BASE_URL || '/';

  return (
    <footer className="mt-10 sm:mt-16 border-t border-[#1E293B] bg-[#060B18] pt-8 sm:pt-12 pb-8 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={`${base}logo-mark.png`} alt="Blueprint AI" className="w-7 h-7 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
              <h2 className="font-bold text-xs tracking-widest text-[#64748B]">BLUEPRINT<span className="text-[#60A5FA]/60">ENVISION</span></h2>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed max-w-xs mb-4">
              AI-powered exterior visualization for contractors and homeowners. Preview roofing and accents on your home using real product colors.
            </p>
            {/* Shiloh Roofing — Presenting Contractor */}
            <div className="border-t border-[#1E293B] pt-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{background: 'linear-gradient(90deg, #60A5FA, #93C5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Your Contractor</p>
              <p className="text-sm font-bold text-white tracking-wide mb-1">Shiloh Roofing</p>
              <a href="tel:7177641269" className="block text-[11px] text-[#94A3B8] hover:text-white transition-colors mb-0.5">717-764-1269</a>
              <a href="https://shilohroofing.com" target="_blank" rel="noopener noreferrer" className="block text-[11px] text-[#60A5FA] hover:text-white transition-colors">shilohroofing.com</a>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B] mb-4">Capabilities</h3>
            <ul className="space-y-2 text-[11px] text-[#94A3B8] font-medium">
              <li>GAF® Roofing Visualization</li>
              <li>AI Image Enhancement</li>
              <li>Before & After Comparison</li>
              <li>Shingle Color Preview</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B] mb-4">Legal</h3>
            <ul className="space-y-2.5 text-[11px] text-[#64748B] leading-relaxed">
              <li><span className="text-[#94A3B8] font-semibold">Visualization Accuracy — </span>Results are AI-generated approximations for inspiration only.</li>
              <li><span className="text-[#94A3B8] font-semibold">Trademarks — </span>GAF® is a trademark of its respective owner. Not affiliated.</li>
              <li><span className="text-[#94A3B8] font-semibold">Image Privacy — </span>Uploaded photos are processed by Google Gemini AI. Not stored beyond your session.</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-[#1E293B] mt-10 pt-6">
          <p className="text-[9px] text-[#475569] leading-relaxed max-w-5xl">
            <span className="text-[#64748B] font-semibold">DISCLAIMER: </span>
            Visualizations produced by this tool are artificially generated approximations intended solely for illustrative purposes. Actual color, texture, profile, and appearance will vary based on product specification, installation conditions, ambient lighting, and other factors.
            {' '}GAF®, Timberline®, and LayerLock™ are registered trademarks of GAF, a Standard Industries company. CertainTeed®, Monogram®, Cedar Impressions®, and CedarBoards™ are trademarks of CertainTeed LLC. This tool is independently operated and is not affiliated with, sponsored by, or endorsed by GAF, CertainTeed, or any product manufacturer.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1E293B] mt-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-widest text-[#475569]">
            <p>© {new Date().getFullYear()} Shiloh Roofing · <span className="text-[#475569]">Powered by Blueprint AI Consulting Co.</span></p>
            <div className="flex gap-4">
              <span>v2.5</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[9px] text-[#475569]">
            <span>By using this tool, you confirm you are 13+ and agree to the terms below.</span>
            <button onClick={onShowToS} className="text-[#64748B] hover:text-[#94A3B8] underline underline-offset-2 transition-colors">Terms of Use</button>
            <span className="text-[#334155]">|</span>
            <button onClick={onShowPrivacy} className="text-[#64748B] hover:text-[#94A3B8] underline underline-offset-2 transition-colors">Privacy Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
