import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6 border-b border-[#1E293B] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
                  <Info className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <h3 className="text-lg font-bold text-white">About BlueprintEnvision</h3>
              </div>
              <button onClick={onClose} className="text-[#94A3B8] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                BlueprintEnvision is an AI-powered exterior home visualizer that lets you preview roofing colors on your home using real GAF® product colors — before committing to a purchase.
              </p>
              <div className="space-y-3">
                <div className="bg-[#1E293B]/60 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-[#60A5FA] uppercase tracking-wider mb-1">Quick Mode</h4>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">Select roofing colors for primary roof, dormers, garage, and gutters, then generate a one-shot AI visualization. Best for quick previews.</p>
                </div>
                <div className="bg-[#1E293B]/60 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-[#60A5FA] uppercase tracking-wider mb-1">Advanced Mode</h4>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">AI detects individual sections of your roof and home exterior. Apply different materials to each zone for precise, section-by-section control.</p>
                </div>
                <div className="bg-[#1E293B]/60 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-[#60A5FA] uppercase tracking-wider mb-1">AI Image Optimizer</h4>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">Our AI automatically removes parked cars, people, and obstructing objects from your photo — then optimizes lighting for the best visualization results.</p>
                </div>
              </div>
              <p className="text-[#475569] text-[10px] leading-relaxed">
                Color names are verified GAF® product colors. Hex values are best-effort digital approximations — physical samples are the authoritative reference.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
