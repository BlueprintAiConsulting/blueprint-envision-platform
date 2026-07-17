import React from 'react';
import { QuickZone, SidingLine, SidingColor } from '../../types';
import { CERTAINTEED_OPTIONS, VERTICAL_SIDING_OPTIONS, SHUTTER_COLORS, TRIM_COLORS } from '../../constants/catalog';
import ColorGrid from './ColorGrid';
import { ChevronDown } from 'lucide-react';

interface SidingCatalogProps {
  quickZones: QuickZone[];
  setQuickZones: (updated: (prev: QuickZone[]) => QuickZone[]) => void;
  expandedZoneId: string | null;
  setExpandedZoneId: (id: string | null) => void;
  onColorMouseEnter: (color: SidingColor) => void;
  onColorMouseLeave: () => void;
}

const SidingCatalog: React.FC<SidingCatalogProps> = ({
  quickZones,
  setQuickZones,
  expandedZoneId,
  setExpandedZoneId,
  onColorMouseEnter,
  onColorMouseLeave
}) => {
  const mainZone = quickZones.find(z => z.id === 'qz-main')!;
  const gableZone = quickZones.find(z => z.id === 'qz-gable')!;

  return (
    <div className="space-y-4">
      {/* 02 SIDING — applied to all exterior walls & gables */}
      <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#1E3A8A] text-[#60A5FA] rounded flex items-center justify-center text-xs font-bold">02</div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">Siding</h2>
            <p className="text-[10px] text-[#64748B]">Applied to all exterior walls &amp; gables</p>
          </div>
        </div>

        {/* Texture preview strip */}
        <div className="mb-3 rounded-lg overflow-hidden relative h-[4.5rem] border border-[#334155] shadow-inner">
          <img
            src={mainZone.selectedLine.textureImage}
            alt={mainZone.selectedLine.profileLabel}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17]/80 via-[#0A0E17]/30 to-transparent" />
          <div className="absolute inset-0 flex items-center px-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#60A5FA] leading-tight">{mainZone.selectedLine.line}</p>
              <p className="text-[10px] font-medium text-[#E2E8F0] leading-tight mt-0.5">{mainZone.selectedLine.profileLabel}</p>
              <p className="text-[8px] text-[#64748B] mt-0.5">{mainZone.selectedLine.colors.length} colors available</p>
            </div>
          </div>
        </div>

        <ColorGrid 
          colors={mainZone.selectedLine.colors}
          selectedColorId={mainZone.selectedColor.id}
          onSelect={(c) => setQuickZones(prev => prev.map(z => z.id === 'qz-main' ? { ...z, selectedColor: c as any } : z))}
          onMouseEnter={onColorMouseEnter}
          onMouseLeave={onColorMouseLeave}
          isExpanded={expandedZoneId === 'qz-main'}
          onToggleExpand={() => setExpandedZoneId(expandedZoneId === 'qz-main' ? null : 'qz-main')}
          textureImage={mainZone.selectedLine.textureImage}
        />

        {/* Upper Gable optional zone */}
        <div className="mt-3 pt-3 border-t border-[#1E293B]">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setQuickZones(prev => prev.map(z => z.id === 'qz-gable' ? { ...z, enabled: !z.enabled } : z))}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${gableZone.enabled ? 'bg-[#3B82F6]' : 'bg-[#1E293B] border border-[#334155]'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${gableZone.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-bold transition-colors ${gableZone.enabled ? 'text-[#E2E8F0]' : 'text-[#475569]'}`}>Upper Gable</span>
            <span className="text-[9px] text-[#475569] ml-auto">optional accent zone</span>
          </div>

          {gableZone.enabled && (
            <div className="space-y-3">
              <div className="mb-2 rounded-lg overflow-hidden relative h-12 border border-[#334155] shadow-inner">
                <img src={gableZone.selectedLine.textureImage} alt={gableZone.selectedLine.profileLabel} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17]/80 via-[#0A0E17]/30 to-transparent" />
                <div className="absolute inset-0 flex items-center px-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#A78BFA] leading-tight">{gableZone.selectedLine.line}</p>
                    <p className="text-[10px] font-medium text-[#E2E8F0] leading-tight mt-0.5">{gableZone.selectedLine.profileLabel}</p>
                  </div>
                </div>
              </div>

              {/* Gable tier tabs */}
              <div className="flex gap-1 mb-2">
                {[CERTAINTEED_OPTIONS[2], VERTICAL_SIDING_OPTIONS[0]].map(line => (
                  <button 
                    key={line.line}
                    onClick={() => setQuickZones(prev => prev.map(z => z.id === 'qz-gable' ? { ...z, selectedLine: line, selectedColor: line.colors[0] } : z))}
                    className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors ${
                      gableZone.selectedLine.line === line.line ? 'bg-[#7C3AED] text-white' : 'bg-[#1E293B] text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {line.line.replace('®', '').replace('™', '')}
                  </button>
                ))}
              </div>

              <ColorGrid 
                colors={gableZone.selectedLine.colors}
                selectedColorId={gableZone.selectedColor.id}
                onSelect={(c) => setQuickZones(prev => prev.map(z => z.id === 'qz-gable' ? { ...z, selectedColor: c as any } : z))}
                onMouseEnter={onColorMouseEnter}
                onMouseLeave={onColorMouseLeave}
                isExpanded={expandedZoneId === 'qz-gable'}
                onToggleExpand={() => setExpandedZoneId(expandedZoneId === 'qz-gable' ? null : 'qz-gable')}
                textureImage={gableZone.selectedLine.textureImage}
                ringColor="#7C3AED"
              />
            </div>
          )}
        </div>
      </div>

      {/* 03 ACCENTS — Shutters & Trim with dedicated standard palettes */}
      <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#1E3A8A] text-[#60A5FA] rounded flex items-center justify-center text-xs font-bold">03</div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">Accents</h2>
            <p className="text-[10px] text-[#64748B]">Shutters & trim — standard paint colors</p>
          </div>
        </div>
        <div className="space-y-2">
          {quickZones.filter(z => ['qz-shutters', 'qz-trim'].includes(z.id)).map((zone) => {
            const palette = zone.id === 'qz-shutters' ? SHUTTER_COLORS : TRIM_COLORS;
            const paletteLabel = zone.id === 'qz-shutters' ? 'Shutter Colors' : 'Trim Colors';
            const isExpanded = expandedZoneId === zone.id;
            
            return (
              <div key={zone.id} className={`rounded-lg border overflow-hidden transition-all ${zone.enabled ? 'border-[#334155] bg-[#0F172A]' : 'border-[#1E293B] bg-[#0A0E17]'}`}>
                <div className="flex items-center gap-3 p-3">
                  <button
                    onClick={() => setQuickZones(prev => prev.map(z => z.id === zone.id ? { ...z, enabled: !z.enabled } : z))}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${zone.enabled ? 'bg-[#3B82F6]' : 'bg-[#1E293B] border border-[#334155]'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${zone.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-xs font-bold flex-1 transition-colors ${zone.enabled ? 'text-[#E2E8F0]' : 'text-[#475569]'}`}>{zone.name}</span>
                  {zone.enabled && (
                    <button onClick={() => setExpandedZoneId(isExpanded ? null : zone.id)} className="flex items-center gap-1.5 group">
                      <div className="w-4 h-4 rounded-sm border border-white/20 shrink-0" style={{ backgroundColor: zone.selectedColor.hex }} />
                      <span className="text-[9px] text-[#94A3B8] group-hover:text-[#E2E8F0] truncate max-w-[72px] transition-colors">{zone.selectedColor.name}</span>
                      <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {zone.enabled && isExpanded && (
                  <div className="border-t border-[#1E293B] bg-[#0A0E17]/80 p-3">
                    <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest mb-2">{paletteLabel}</p>
                    <ColorGrid 
                      colors={palette}
                      selectedColorId={zone.selectedColor.id}
                      onSelect={(c) => setQuickZones(prev => prev.map(z => z.id === zone.id ? { ...z, selectedColor: c as any } : z))}
                      onMouseEnter={onColorMouseEnter}
                      onMouseLeave={onColorMouseLeave}
                      isExpanded={true} // Always expanded in this sub-menu
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SidingCatalog;
