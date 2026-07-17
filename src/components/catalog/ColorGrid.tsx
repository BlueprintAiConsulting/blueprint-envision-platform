import React from 'react';
import { SidingColor, RoofingColor } from '../../types';

interface ColorGridProps {
  colors: (SidingColor | RoofingColor)[];
  selectedColorId: string;
  onSelect: (color: SidingColor | RoofingColor) => void;
  onMouseEnter?: (color: SidingColor | RoofingColor) => void;
  onMouseLeave?: () => void;
  textureImage?: string;
  isExpanded: boolean;
  onToggleExpand?: () => void;
  ringColor?: string;
  showMoreLabel?: string;
  showFewerLabel?: string;
}

const ColorGrid: React.FC<ColorGridProps> = ({
  colors,
  selectedColorId,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  isExpanded,
  onToggleExpand,
  ringColor = '#3B82F6',
  showMoreLabel = 'Show all colors',
  showFewerLabel = 'Show fewer',
}) => {
  const PREVIEW_COUNT = 12;
  const selectedColor = colors.find(c => c.id === selectedColorId);
  const visibleColors = isExpanded ? colors : colors.slice(0, PREVIEW_COUNT);

  return (
    <div className="space-y-3">
      {/* Selected color preview bar */}
      {selectedColor && (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#060B18] border border-[#1E293B]">
          <div
            className="w-8 h-8 rounded-md shrink-0 border border-white/10 overflow-hidden relative"
            style={{ backgroundColor: selectedColor.hex }}
          >
            {'swatchImage' in selectedColor && (selectedColor as any).swatchImage && (
              <img src={(selectedColor as any).swatchImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-[#E2E8F0] leading-tight">{selectedColor.name}</p>
            <p className="text-[10px] text-[#64748B] leading-tight mt-0.5">{selectedColor.hue}</p>
          </div>
          <div
            className="shrink-0 w-2 h-2 rounded-full"
            style={{ backgroundColor: ringColor }}
          />
        </div>
      )}

      {/* Swatch grid — 3 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {visibleColors.map((color) => {
          const isSelected = color.id === selectedColorId;
          const hasSwatchImg = 'swatchImage' in color && (color as any).swatchImage;

          return (
            <button
              key={color.id}
              onClick={() => onSelect(color)}
              onMouseEnter={() => onMouseEnter?.(color)}
              onMouseLeave={onMouseLeave}
              title={`${color.name} — ${color.hue}`}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
            >
              {/* Swatch */}
              <div
                className="w-full aspect-square rounded-lg relative overflow-hidden transition-all duration-150"
                style={{
                  backgroundColor: color.hex,
                  boxShadow: isSelected
                    ? `0 0 0 2px #060B18, 0 0 0 4px ${ringColor}`
                    : '0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                {hasSwatchImg && (
                  <img
                    src={(color as any).swatchImage}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Hover shine */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-150 rounded-lg" />
              </div>

              {/* Label */}
              <p
                className="w-full text-center text-[9px] leading-tight font-medium truncate px-0.5 transition-colors"
                style={{ color: isSelected ? '#E2E8F0' : '#64748B' }}
              >
                {color.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Show more/fewer toggle */}
      {colors.length > PREVIEW_COUNT && onToggleExpand && (
        <button
          onClick={onToggleExpand}
          className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-[#1E293B] hover:border-[#334155] hover:bg-[#111827] text-center"
          style={{ color: ringColor }}
        >
          {isExpanded
            ? `↑ ${showFewerLabel}`
            : `↓ ${showMoreLabel} (${colors.length - PREVIEW_COUNT} more)`}
        </button>
      )}
    </div>
  );
};

export default ColorGrid;
