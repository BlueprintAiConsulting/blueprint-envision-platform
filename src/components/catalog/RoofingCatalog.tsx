import React from 'react';
import { QuickRoofZone, RoofingColor } from '../../types';
import { ROOFING_OPTIONS } from '../../constants/catalog';
import ColorGrid from './ColorGrid';

interface RoofingCatalogProps {
  quickRoofZones: QuickRoofZone[];
  setQuickRoofZones: (updated: (prev: QuickRoofZone[]) => QuickRoofZone[]) => void;
  expandedRoofZoneId: string | null;
  setExpandedRoofZoneId: (id: string | null) => void;
  onColorMouseEnter: (color: RoofingColor) => void;
  onColorMouseLeave: () => void;
}

const RoofingCatalog: React.FC<RoofingCatalogProps> = ({
  quickRoofZones,
  setQuickRoofZones,
  onColorMouseEnter,
  onColorMouseLeave,
}) => {
  // Single roof zone — always the first (and only) entry
  const zone = quickRoofZones[0];
  if (!zone) return null;

  const palette = zone.selectedLine.colors;

  return (
    <div className="bg-[#111827] p-4 space-y-3">
      {/* Tier picker */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#060B18] p-1 rounded-lg">
        {ROOFING_OPTIONS.map((line) => {
          const isSelectedTier = zone.selectedLine.tier === line.tier;
          return (
            <button
              key={line.tier}
              onClick={() =>
                setQuickRoofZones((prev) =>
                  prev.map((z) =>
                    z.id === zone.id
                      ? { ...z, selectedLine: line, selectedColor: line.colors[0] }
                      : z
                  )
                )
              }
              className={`py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-150 ${
                isSelectedTier
                  ? 'bg-[#1E3A8A] text-[#60A5FA] shadow-md shadow-blue-500/10'
                  : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[#111827]'
              }`}
            >
              {line.tier}
            </button>
          );
        })}
      </div>

      {/* Product info card */}
      <div className="bg-[#060B18] rounded-lg p-3 border border-[#1E293B]">
        <p className="text-[11px] font-bold text-[#E2E8F0]">
          {zone.selectedLine.line}
        </p>
        <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed">
          {zone.selectedLine.profileLabel}
        </p>
        <p className="text-[9px] text-[#475569] mt-1.5 italic">
          {zone.selectedLine.description}
        </p>
      </div>

      {/* Color grid */}
      <ColorGrid
        colors={palette}
        selectedColorId={zone.selectedColor.id}
        onSelect={(c) =>
          setQuickRoofZones((prev) =>
            prev.map((z) =>
              z.id === zone.id ? { ...z, selectedColor: c as any } : z
            )
          )
        }
        onMouseEnter={onColorMouseEnter}
        onMouseLeave={onColorMouseLeave}
        isExpanded={true}
        ringColor="#3B82F6"
      />
    </div>
  );
};

export default RoofingCatalog;
