import React from 'react';
import { Sparkles, Loader2, Check, X, Trash2 } from 'lucide-react';
import { Section } from '../../types';

interface AISectionSeparatorProps {
  selectedImage: string | null;
  exteriorType: 'siding' | 'roofing';
  isDetectingSections: boolean;
  detectionProgress: string;
  onDetectSections: () => void;
  sections: Section[];
  currentSectionId: string | null;
  onSwitchSection: (id: string) => void;
  onRemoveSection: (id: string) => void;
  onSetSections: (updated: (prev: Section[]) => Section[]) => void;
  setHoveredSectionId: (id: string | null) => void;
}

const AISectionSeparator: React.FC<AISectionSeparatorProps> = ({
  selectedImage,
  exteriorType,
  isDetectingSections,
  detectionProgress,
  onDetectSections,
  sections,
  currentSectionId,
  onSwitchSection,
  onRemoveSection,
  onSetSections,
  setHoveredSectionId
}) => {
  if (!selectedImage) return null;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-5 shadow-lg relative overflow-hidden transition-all ${isDetectingSections ? 'bg-[#0F1E3D] border-[#3B82F6]/60' : 'bg-gradient-to-br from-[#111827] to-[#0F172A] border-[#1E3A8A]/60 hover:border-[#3B82F6]/60'}`}>
        {isDetectingSections && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3B82F6]/10 to-transparent animate-[shimmer_1.5s_infinite] pointer-events-none" />}
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-lg border ${isDetectingSections ? 'bg-[#3B82F6]/30 border-[#3B82F6]/50 animate-pulse' : 'bg-[#1E3A8A]/60 border-[#1E3A8A]'}`}><Sparkles className="w-4 h-4 text-[#60A5FA]" /></div>
          <div><h3 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider">AI Section Separator</h3><p className="text-[10px] text-[#64748B]">Detect {exteriorType === 'roofing' ? 'roof' : 'siding'} zones automatically</p></div>
        </div>
        
        {isDetectingSections ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-[#0A0E17] rounded-lg px-3 py-2 border border-[#1E3A8A]/50"><Loader2 className="w-3.5 h-3.5 text-[#3B82F6] animate-spin shrink-0" /><span className="text-[10px] text-[#94A3B8] font-medium">{detectionProgress}</span></div>
            <div className="w-full bg-[#1E293B] rounded-full h-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full animate-pulse" style={{ width: '60%' }} /></div>
          </div>
        ) : detectionProgress.startsWith('✓') ? (
          <div className="flex items-center gap-2 bg-[#064E3B]/30 border border-[#10B981]/30 rounded-lg px-3 py-2"><Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" /><span className="text-[10px] text-[#6EE7B7] font-medium">{detectionProgress}</span></div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-[#64748B] leading-relaxed">Analyzes the house photo to identify <span className="text-[#94A3B8] font-medium">distinct {exteriorType === 'roofing' ? 'roof planes' : 'siding zones'}</span> — {exteriorType === 'roofing' ? 'primary roof, dormers, garage roof' : 'main body, gable ends, garage bays'} — and generates precise masks for each, ready to color individually.</p>
            <button onClick={onDetectSections} disabled={isDetectingSections} className="w-full flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-all border border-[#3B82F6]/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Sparkles className="w-3.5 h-3.5" /> {exteriorType === 'roofing' ? 'Detect Roof Sections' : 'Detect Siding Sections'}
            </button>
          </div>
        )}
      </div>

      {sections.length > 1 && (
        <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#1E3A8A] text-[#60A5FA] rounded flex items-center justify-center text-xs font-bold">02</div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">Active Zones</h2>
              <p className="text-[10px] text-[#64748B]">{sections.length} detected — click to switch</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSwitchSection(section.id)}
                onMouseEnter={() => setHoveredSectionId(section.id)}
                onMouseLeave={() => setHoveredSectionId(null)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
                  currentSectionId === section.id
                    ? 'bg-[#1E3A8A] border-[#3B82F6] text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    : 'bg-[#0A0E17] border-[#1E293B] text-[#94A3B8] hover:border-[#334155] hover:text-[#E2E8F0]'
                }`}
              >
                <div className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: section.selectedColor.hex }} />
                {currentSectionId === section.id ? (
                  <input type="text" value={section.name}
                    onChange={(e) => { 
                      const n = e.target.value; 
                      onSetSections(prev => prev.map(s => s.id === section.id ? { ...s, name: n } : s)); 
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none flex-1 border-b border-white/30 focus:border-white"
                  />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider flex-1 truncate">{section.name}</span>
                )}
                <button onClick={(e) => { e.stopPropagation(); onRemoveSection(section.id); }}
                  className="p-1 px-1.5 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5 text-[#64748B] hover:text-red-400" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISectionSeparator;
