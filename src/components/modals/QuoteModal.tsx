import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Loader2, Sparkles, Lock, ImageIcon, Shield } from 'lucide-react';
import { QuickRoofZone } from '../../types';
import { API_BASE } from '../../utils/apiConfig';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadCaptureEnabled?: boolean;
  visualizationImage?: string | null;
  roofZones?: QuickRoofZone[];
  onShowToS?: () => void;
  onShowPrivacy?: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, leadCaptureEnabled = false, visualizationImage = null, roofZones = [], onShowToS, onShowPrivacy }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', zipCode: '',
    contactTime: 'Morning (8am–12pm)', projectTimeline: 'ASAP',
    referralSource: 'Google', notes: ''
  });

  // Build design spec from roof zones
  const buildDesignSpec = () => {
    const activeZones = roofZones.filter(z => z.enabled || z.id === 'rz-main');
    if (activeZones.length === 0) return { mode: 'Quick' };

    const mainZone = activeZones.find(z => z.id === 'rz-main') || activeZones[0];
    return {
      mode: 'Quick',
      primaryLine: mainZone.selectedLine.line,
      primaryColor: mainZone.selectedColor.name,
      primaryHex: mainZone.selectedColor.hex,
      sections: activeZones.map(z => ({
        name: z.name,
        line: z.selectedLine.line,
        color: z.selectedColor.name,
        hex: z.selectedColor.hex,
      })),
    };
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.zipCode) {
      setApiError('Please fill in all required fields.');
      return;
    }
    if (!consentChecked) {
      setApiError('Please agree to the Terms of Use and Privacy Policy.');
      return;
    }
    setIsSubmitting(true);
    setApiError(null);
    try {
      // Simulate network request since backend is removed for static hosting
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Lead Captured (Demo Mode):', {
        ...form,
        designSpec: buildDesignSpec(),
      });

      setIsSuccess(true);

      // Auto-download the visualization image
      if (visualizationImage) {
        const a = document.createElement('a');
        a.href = visualizationImage;
        a.download = `BlueprintEnvision-${form.name.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      setApiError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset state after close animation
      setTimeout(() => {
        setIsSuccess(false);
        setApiError(null);
        setConsentChecked(false);
        setForm(f => ({ ...f, name: '', email: '', phone: '', address: '', zipCode: '', notes: '' }));
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="quote-modal-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            key="quote-modal-panel"
            initial={{ scale: 0.95, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '92vh' }}
          >
            {/* Modal Header */}
            <div className="bg-[#0A0E17] border-b border-[#1E293B] px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="text-xs font-bold text-[#60A5FA] uppercase tracking-widest">BlueprintEnvision</div>
                <div className="text-base font-bold text-[#E2E8F0] mt-0.5">Request a Free Quote</div>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {!leadCaptureEnabled ? (
                /* Premium Feature Locked State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 px-8 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center mb-6">
                    <Lock className="w-9 h-9 text-[#475569]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#E2E8F0] mb-3">Premium Feature</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed mb-4">
                    Lead capture and quote delivery are included in the <span className="text-[#60A5FA] font-semibold">Pro</span> and <span className="text-[#60A5FA] font-semibold">Premium</span> plans.
                  </p>
                  <p className="text-[#475569] text-xs leading-relaxed">
                    Contact Blueprint AI Consulting to upgrade and start receiving leads directly to your inbox.
                  </p>
                  <a
                    href="mailto:blueprintaiconsulting@gmail.com?subject=BlueprintEnvision%20Upgrade%20Inquiry"
                    className="mt-6 px-5 py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1D4ED8] text-[#60A5FA] text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Contact Us to Upgrade
                  </a>
                </motion.div>
              ) : isSuccess ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 px-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center mb-6"
                  >
                    <Check className="w-10 h-10 text-[#10B981]" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#E2E8F0] mb-3">Request Sent!</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed mb-2">Our team has your request and will reach out within <strong className="text-white">24 business hours</strong>.</p>
                  <p className="text-[#64748B] text-xs">Your visualization is downloading now…</p>
                </motion.div>
              ) : (
                <div className="px-6 py-5 space-y-5">
                  {/* Visualization Preview */}
                  {visualizationImage && (
                    <div className="rounded-xl overflow-hidden border border-[#1E3A8A]/50 bg-[#0A0E17]">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1E293B]">
                        <ImageIcon className="w-3 h-3 text-[#60A5FA]" />
                        <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Your Visualization</span>
                        <span className="text-[8px] text-[#10B981] ml-auto">✓ Will be attached</span>
                      </div>
                      <img 
                        src={visualizationImage} 
                        alt="Your roof visualization" 
                        className="w-full h-36 object-cover opacity-90"
                      />
                    </div>
                  )}

                  {/* Selected Shingle Summary */}
                  {(() => {
                    const mainZone = roofZones.find(z => z.id === 'rz-main') || roofZones[0];
                    if (!mainZone) return null;
                    const color = mainZone.selectedColor;
                    const line = mainZone.selectedLine;
                    return (
                      <div className="rounded-xl border border-[#1E293B] bg-[#111827] overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1E293B]">
                          <div className="w-3 h-3 rounded bg-[#1E3A8A] flex items-center justify-center">
                            <span className="text-[7px] font-bold text-[#60A5FA]">✦</span>
                          </div>
                          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Selected Shingle</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="w-14 h-10 rounded-lg border border-white/10 overflow-hidden relative shrink-0" style={{ backgroundColor: color.hex }}>
                            {color.swatchImage && (
                              <img src={color.swatchImage} alt={color.name} className="absolute inset-0 w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-[#E2E8F0] leading-tight">{color.name}</p>
                            <p className="text-[9px] text-[#64748B] mt-0.5">GAF {line.line} · {color.hex.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Full Name <span className="text-[#EF4444]">*</span></label>
                      <input type="text" placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Email <span className="text-[#EF4444]">*</span></label>
                      <input type="email" placeholder="jane@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Phone <span className="text-[#EF4444]">*</span></label>
                      <input type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                    </div>
                    {/* Street Address */}
                    <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Property Address <span className="text-[#EF4444]">*</span></label>
                      <input type="text" placeholder="123 Maple St, Anytown" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                    </div>
                    {/* Zip Code */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Zip Code <span className="text-[#EF4444]">*</span></label>
                      <input type="text" placeholder="12345" maxLength={10} value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                    </div>
                    {/* Best Time */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Best Time to Contact</label>
                      <select value={form.contactTime} onChange={e => setForm(f => ({ ...f, contactTime: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] transition-colors">
                        {['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)', 'Anytime'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    {/* Project Timeline */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Project Timeline</label>
                      <select value={form.projectTimeline} onChange={e => setForm(f => ({ ...f, projectTimeline: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] transition-colors">
                        {['ASAP', 'Within 1 Month', '1–3 Months', '3–6 Months', 'Just Exploring'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    {/* How did you hear */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">How Did You Find Us?</label>
                      <select value={form.referralSource} onChange={e => setForm(f => ({ ...f, referralSource: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] transition-colors">
                        {['Google', 'Facebook / Instagram', 'Referral from a Friend', 'Nextdoor', 'Drive By / Sign', 'Repeat Customer', 'Other'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    {/* Notes */}
                    <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Additional Notes <span className="text-[#475569] font-normal normal-case">(optional)</span></label>
                      <textarea rows={3} placeholder="Any details about your project…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none" />
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="flex items-start gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setConsentChecked(c => !c)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        consentChecked
                          ? 'bg-[#3B82F6] border-[#3B82F6]'
                          : 'bg-transparent border-[#475569] hover:border-[#64748B]'
                      }`}
                    >
                      {consentChecked && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                      <Shield className="w-3 h-3 inline-block mr-1 text-[#60A5FA] -mt-0.5" />
                      I agree to the{' '}
                      <button type="button" onClick={onShowToS} className="text-[#60A5FA] hover:text-[#93C5FD] underline underline-offset-2 transition-colors">Terms of Use</button>
                      {' '}and{' '}
                      <button type="button" onClick={onShowPrivacy} className="text-[#60A5FA] hover:text-[#93C5FD] underline underline-offset-2 transition-colors">Privacy Policy</button>
                      , and consent to my information being shared with the providing contractor for the purpose of this quote.
                    </p>
                  </div>

                  {apiError && (
                    <div className="p-3 bg-[#7F1D1D]/20 border border-[#DC2626] rounded-lg">
                      <p className="text-[#FCA5A5] text-xs font-bold text-center">{apiError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer CTA — only shown when lead capture is active */}
            {leadCaptureEnabled && !isSuccess && (
              <div className="px-6 py-4 border-t border-[#1E293B] shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !consentChecked}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                    isSubmitting || !consentChecked
                      ? 'bg-[#1E293B] text-[#64748B] cursor-not-allowed'
                      : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending Request…</>
                    : <><Sparkles className="w-4 h-4" /> Send Request &amp; Download My Visualization</>}
                </button>
                <p className="text-[10px] text-[#475569] text-center mt-2">Your visualization download will start automatically. No payment required.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuoteModal;
