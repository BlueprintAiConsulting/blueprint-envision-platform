import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';

interface HeaderProps {
  hasImage: boolean;
  onStartOver: () => void;
  onQuoteClick: () => void;
  isQuoteAvailable: boolean;
}

const Header: React.FC<HeaderProps> = ({
  hasImage,
  onStartOver,
  onQuoteClick,
  isQuoteAvailable
}) => {
  const base = import.meta.env.BASE_URL || '/';

  return (
    <header className="border-b border-[#3B82F6]/15 bg-[#060B18]/95 backdrop-blur-md sticky top-0 z-10 shadow-[0_1px_24px_rgba(59,130,246,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand — logo + wordmark */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-[#3B82F6] rounded-xl flex items-center justify-center shrink-0 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-[800] text-[18px] leading-none tracking-[-0.5px] text-white whitespace-nowrap">
              BLUEPRINT<span className="text-[#3B82F6]">ENVISION</span>
            </h1>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold whitespace-nowrap mt-0.5 text-[#475569]">
              Exterior Visualizer
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {hasImage && (
            <button
              onClick={onStartOver}
              className="hover:text-red-400 text-red-500/70 transition-colors flex items-center gap-1.5 text-xs font-medium p-1.5 sm:p-0"
              title="Start Over"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={onQuoteClick}
            disabled={!isQuoteAvailable}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all active:scale-95 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap ${
              isQuoteAvailable
                ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                : 'bg-[#1E293B] text-[#475569] cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Get Free Quote & Download</span>
            <span className="sm:hidden">Quote</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
