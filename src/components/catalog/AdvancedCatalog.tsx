import React from 'react';
import { Section, SidingLine, SidingColor } from '../../types';
import { ALL_SIDING_OPTIONS, SHUTTER_COLORS, TRIM_COLORS } from '../../constants/catalog';
import ColorGrid from './ColorGrid';
import { Check, ChevronDown } from 'lucide-react';

interface AdvancedCatalogProps {
  currentSection: Section | null;
  onUpdateSection: (updated: (prev: Section[]) => Section[]) => void;
  onSaveHistory: () => void;
  onColorMouseEnter: (color: any) => void;
  onColorMouseLeave: () => void;
  expandedColorZones: Set<string>;
  onToggleColorZone: (key: string) => void;
}

const AdvancedCatalog: React.FC<AdvancedCatalogProps> = ({
  currentSection,
  onUpdateSection,
  onSaveHistory,
  onColorMouseEnter,
  onColorMouseLeave,
  expandedColorZones,
  onToggleColorZone
}) => {
  if (!currentSection) return null;

  const sectionNameLower = currentSection.name.toLowerCase();
  const isShutterZone = sectionNameLower.includes('shutter');
  const isTrimZone = sectionNameLower.includes('trim') || sectionNameLower.includes('corner board');
  const isAccentZone = isShutterZone || isTrimZone;

  if (isAccentZone) {
    const accentColors = isShutterZone ? SHUTTER_COLORS : TRIM_COLORS;
    const label = isShutterZone ? 'Shutter Paint Colors' : 'Trim Paint Colors';
    return (
      <div className="rounded-lg border border-[#3B82F6] bg-[#1E293B] overflow-hidden">
        <div className="p-3 border-b border-[#334155]/50">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#60A5FA]">Paint Color</span>
          <h3 className="text-xs font-bold text-[#F8FAFC]">{label}</h3>
        </div>
        <div className="px-3 pb-3 pt-2 bg-[#0F172A]/50">
          <ColorGrid 
            colors={accentColors}
            selectedColorId={currentSection.selectedColor.id}
            onSelect={(color) => {
              onSaveHistory();
              onUpdateSection(prev => prev.map(s => s.id === currentSection.id ? { ...s, selectedColor: color as any } : s));
            }}
            onMouseEnter={onColorMouseEnter}
            onMouseLeave={onColorMouseLeave}
            isExpanded={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ALL_SIDING_OPTIONS.map((line) => {
        const isSelectedLine = currentSection.selectedLine.tier === line.tier;
        const colorZoneKey = `adv-${line.tier}`;
        const isColorExpanded = expandedColorZones.has(colorZoneKey);

        return (
          <div key={line.tier} className={`rounded-lg border transition-all overflow-hidden ${isSelectedLine ? 'border-[#3B82F6] bg-[#1E293B]' : 'border-[#334155] bg-[#0A0E17] hover:border-[#475569]'}`}>
            <div className="cursor-pointer" onClick={() => {
              onSaveHistory();
              const firstColor = line.colors[0];
              onUpdateSection(prev => prev.map(s => s.id === currentSection.id ? { ...s, selectedLine: line, selectedColor: firstColor } : s));
            }}>
              {/* Texture strip */}
              <div className="relative h-10 overflow-hidden">
                <img src={line.textureImage} alt={line.line} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17]/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelectedLine ? 'text-[#60A5FA]' : 'text-[#64748B]'}`}>{line.tier} Tier</span>
                    <h3 className="text-xs font-bold text-[#F8FAFC] leading-tight">{line.line}</h3>
                  </div>
                  {isSelectedLine ? <Check className="w-3.5 h-3.5 text-[#3B82F6]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />}
                </div>
              </div>
            </div>
            {isSelectedLine && (
              <div className="px-3 pb-3 pt-2 border-t border-[#334155]/50 bg-[#0F172A]/50">
                <ColorGrid 
                  colors={line.colors}
                  selectedColorId={currentSection.selectedColor.id}
                  onSelect={(color) => {
                    onSaveHistory();
                    onUpdateSection(prev => prev.map(s => s.id === currentSection.id ? { ...s, selectedColor: color as any } : s));
                  }}
                  onMouseEnter={onColorMouseEnter}
                  onMouseLeave={onColorMouseLeave}
                  isExpanded={isColorExpanded}
                  onToggleExpand={() => onToggleColorZone(colorZoneKey)}
                  textureImage={line.textureImage}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdvancedCatalog;
