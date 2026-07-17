import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfUseModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="p-5 border-b border-[#1E293B] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Terms of Use</h3>
                <p className="text-[10px] text-[#64748B] mt-0.5">BlueprintEnvision — Effective January 2026</p>
              </div>
              <button onClick={onClose} className="text-[#94A3B8] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-[11px] text-[#94A3B8] leading-relaxed">
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">1. Permitted Use</h4>
                <p>This tool is provided solely for personal, non-commercial home improvement visualization purposes. You may not copy, reproduce, resell, or distribute outputs for commercial gain without written permission from Blueprint AI Consulting Co.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">2. No Warranty</h4>
                <p>Visualizations are AI-generated approximations provided "as is" without any warranty of accuracy, completeness, or fitness for a particular purpose. No output constitutes a guarantee or binding representation of any product, price, or outcome. Actual colors, textures, and profiles will vary based on product specification, manufacturing lot, installation conditions, and ambient lighting.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">3. Trademarks</h4>
                <p>GAF®, Timberline®, and LayerLock™ are registered trademarks of GAF, a Standard Industries company. CertainTeed®, Monogram®, Cedar Impressions®, CedarBoards™, MainStreet™, and TrueTexture™ are trademarks of CertainTeed LLC, a Saint-Gobain company. All other product names, logos, and brands are the property of their respective owners.</p>
                <p className="mt-1.5">This tool is independently operated by Blueprint AI Consulting Co. and is <strong className="text-[#E2E8F0]">not affiliated with, sponsored by, or endorsed by</strong> GAF, CertainTeed LLC, or any manufacturer whose products are referenced. All product names are used for identification purposes only.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">4. Image & Privacy</h4>
                <p>By uploading images, you confirm you own or have the right to use them for this purpose. Uploaded images are transmitted to Google LLC's Gemini AI service for processing. They are not stored, retained, or shared by Blueprint AI Consulting Co. or the providing contractor beyond the active session. See our <strong className="text-[#60A5FA]">Privacy Policy</strong> for full details.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">5. Age Requirement</h4>
                <p>Use of this tool requires you to be at least 13 years of age. By using this tool, you represent that you meet this requirement.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">6. Limitation of Liability</h4>
                <p>To the maximum extent permitted by law, Blueprint AI Consulting Co. and the providing contractor shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of this tool or reliance on any visualization output, including but not limited to errors in color representation, material selection, or project estimation.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">7. Indemnification</h4>
                <p>You agree to indemnify and hold harmless Blueprint AI Consulting Co. and any affiliated contractors from any claims, damages, or expenses arising from your use of this tool or any decisions made based on its output.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">8. Governing Law</h4>
                <p>These terms shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without regard to its conflict of law provisions.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">9. Changes</h4>
                <p>These terms may be updated at any time. Continued use of the tool constitutes acceptance of the current terms. Material changes will be reflected by updating the effective date above.</p>
              </section>
            </div>
            <div className="p-4 border-t border-[#1E293B] shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const PrivacyPolicyModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="p-5 border-b border-[#1E293B] shrink-0 flex justify-between items-center bg-[#0F172A]">
              <div>
                <h3 className="text-base font-bold text-white">Privacy Policy</h3>
                <p className="text-[10px] text-[#64748B] mt-0.5">BlueprintEnvision — Effective January 2026</p>
              </div>
              <button onClick={onClose} className="text-[#475569] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar text-[11px] text-[#94A3B8] leading-relaxed space-y-4">
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">1. Information We Collect</h4>
                <p>When you submit a quote request, we collect information you provide directly, including your full name, email address, phone number, property address, zip code, project timeline, preferred contact time, and any additional notes you provide. We also collect the visualization image you generated and the product selections you made.</p>
                <p className="mt-1.5">When you use the visualizer tool without submitting a quote, we do not collect or store any personal information. Uploaded home photos are processed in real-time and are not retained.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">2. How We Use Your Information</h4>
                <p>We use your contact information strictly to:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#94A3B8]">
                  <li>Deliver your quote request and visualization to the providing contractor</li>
                  <li>Send you a one-time confirmation email with your selected design details</li>
                  <li>Enable the contractor to follow up regarding your project</li>
                </ul>
                <p className="mt-1.5">We do <strong className="text-[#E2E8F0]">not</strong> use your information for marketing, advertising, or any purpose beyond fulfilling your quote request.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">3. AI Processing & Image Data</h4>
                <p>Uploaded home photos are securely transmitted to Google LLC's Gemini AI service via API to generate the visual simulation. Under the <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-[#60A5FA] hover:text-[#93C5FD] underline underline-offset-2">Google Gemini API Terms of Service</a>, data submitted through the paid API is <strong className="text-[#E2E8F0]">not used to train Google's AI models</strong>. Images are processed in real-time and are not stored permanently by Blueprint AI or Google beyond the duration necessary to generate your visualization.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">4. Data Sharing & Retention</h4>
                <p>Your quote request information (name, email, phone, address, design selections, and visualization image) is shared via email with the specific contractor providing this tool instance. This data transfer is necessary to fulfill your request.</p>
                <p className="mt-1.5"><strong className="text-[#E2E8F0]">We do not sell, rent, or trade your personal data to any third party.</strong></p>
                <p className="mt-1.5">Quote request data is retained by Blueprint AI Consulting Co. only in server logs for operational troubleshooting and is not used for any other purpose. The providing contractor may retain your information in accordance with their own privacy practices.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">5. Your Rights</h4>
                <p>You may request access to, correction of, or deletion of your personal information at any time by contacting us at <a href="mailto:blueprintaiconsulting@gmail.com" className="text-[#60A5FA] hover:text-[#93C5FD] underline underline-offset-2">blueprintaiconsulting@gmail.com</a>. We will respond to data requests within 30 days.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">6. Cookies & Tracking</h4>
                <p>This tool does <strong className="text-[#E2E8F0]">not</strong> use cookies, local storage, analytics trackers, or any third-party tracking scripts. No browsing behavior data is collected.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">7. Security</h4>
                <p>All data transmissions are encrypted via HTTPS/TLS. API keys are stored server-side and are never exposed to the client. Rate limiting and input validation are enforced on all endpoints.</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">8. Contact</h4>
                <p>For privacy-related inquiries, contact Blueprint AI Consulting Co. at <a href="mailto:blueprintaiconsulting@gmail.com" className="text-[#60A5FA] hover:text-[#93C5FD] underline underline-offset-2">blueprintaiconsulting@gmail.com</a>.</p>
              </section>
            </div>
            <div className="p-4 border-t border-[#1E293B] shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
