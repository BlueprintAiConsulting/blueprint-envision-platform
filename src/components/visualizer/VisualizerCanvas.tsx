import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, ArrowLeftRight, ZoomIn, ZoomOut, Hand, Maximize, ImageIcon } from 'lucide-react';

interface VisualizerCanvasProps {
  selectedImage: string | null;
  resultImage: string | null;
  quickResult: string | null;
  isProcessing: boolean;
  isQuickGenerating: boolean;
  sliderPos: number;
  setSliderPos: (pos: number) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  pan: { x: number, y: number };
  setPan: (pan: { x: number, y: number }) => void;
  isPanMode: boolean;
  setIsPanMode: (mode: boolean) => void;
  isDraggingPan: boolean;
  onStartPan: (x: number, y: number) => void;
  onMovePan: (x: number, y: number) => void;
  onEndPan: () => void;
  appMode: 'quick' | 'advanced';
  onQuoteClick: () => void;
  swatchPreviewHex: string | null;
  swatchPreviewName: string | null;
  swatchPreviewImage: string | null;
  sections: any[];
  currentSectionId: string | null;
  hoveredSectionId: string | null;
  imageDimensions: { width: number, height: number };
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  SECTION_COLORS: [number, number, number, number][];
}

/* --------------------------------------------------------------------------
 * Self-contained elapsed-seconds timer — only mounts while the spinner is
 * visible, avoiding unnecessary state churn in the parent App component.
 * ----------------------------------------------------------------------- */
const RenderingOverlay: React.FC = () => {
  const [elapsedSecs, setElapsedSecs] = useState(0);

  useEffect(() => {
    setElapsedSecs(0);
    const id = setInterval(() => setElapsedSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full p-8 flex flex-col items-center justify-center gap-8">
      <div className="relative shrink-0">
        <div className="w-24 h-24 border-2 border-[#1E3A8A] border-t-[#60A5FA] rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.25)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center border border-[#1E293B] shadow-lg"><Sparkles className="w-6 h-6 text-[#60A5FA]" /></div>
        </div>
      </div>
      <div className="w-full max-w-sm text-center space-y-4">
        <p className="font-bold text-sm uppercase tracking-[0.3em] text-[#60A5FA]">Rendering New Roof</p>
        <p className="text-[#94A3B8] text-[11px] font-medium tracking-wide">
          {[
            `Analyzing roof structure…`,
            `Mapping shingle pattern…`,
            `Calibrating color values…`,
            `Applying light & shadow…`,
            `Rendering photorealistic roof…`,
            `Finalizing shingle details…`,
          ][Math.floor(elapsedSecs / 6) % 6]}
        </p>
        <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden border border-[#334155]/50">
          <div className="h-full bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out" style={{ width: `${Math.min(96, 100 * (1 - Math.exp(-elapsedSecs / 38)))}%` }} />
        </div>
      </div>
    </motion.div>
  );
};

const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  selectedImage,
  resultImage,
  quickResult,
  isProcessing,
  isQuickGenerating,
  sliderPos,
  setSliderPos,
  zoom,
  setZoom,
  pan,
  setPan,
  isPanMode,
  setIsPanMode,
  isDraggingPan,
  onStartPan,
  onMovePan,
  onEndPan,
  appMode,
  onQuoteClick,
  swatchPreviewHex,
  swatchPreviewName,
  swatchPreviewImage,
  sections,
  currentSectionId,
  hoveredSectionId,
  imageDimensions,
  canvasRef,
  SECTION_COLORS
}) => {
  const currentResult = appMode === 'quick' ? quickResult : resultImage;

  // --- Throttled slider via requestAnimationFrame ---
  // We keep a pending position in a ref and only flush to React state once
  // per animation frame, preventing 60+ setState calls/sec on touch devices.
  const rafRef = useRef<number>(0);
  const pendingPos = useRef<number | null>(null);

  const flushSlider = useCallback(() => {
    if (pendingPos.current !== null) {
      setSliderPos(pendingPos.current);
      pendingPos.current = null;
    }
    rafRef.current = 0;
  }, [setSliderPos]);

  const updateSlider = useCallback((clientX: number, rect: DOMRect) => {
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    pendingPos.current = pos;
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(flushSlider);
    }
  }, [flushSlider]);

  // Clean up any pending rAF on unmount
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Mouse-based slider drag (desktop)
  const handleSliderMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updateSlider(e.clientX, rect);
    const onMove = (ev: MouseEvent) => updateSlider(ev.clientX, rect);
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [updateSlider]);

  // Touch-based slider drag (mobile) — passive-safe
  const handleSliderTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updateSlider(e.touches[0].clientX, rect);
  }, [updateSlider]);

  const handleSliderTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updateSlider(e.touches[0].clientX, rect);
  }, [updateSlider]);

  return (
    <div className="flex-1 relative bg-transparent flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {currentResult ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full p-4 flex flex-col gap-3"
          >
            <div
              className="relative w-full flex-1 min-h-0 rounded-lg overflow-hidden border border-[#334155] shadow-2xl bg-[#0F172A] cursor-ew-resize select-none"
              onMouseDown={handleSliderMouseDown}
              onTouchStart={handleSliderTouchStart}
              onTouchMove={handleSliderTouchMove}
            >
              <img src={selectedImage!} alt="Before" className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />
              <img src={currentResult} alt="After" className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} draggable={false} />
              <div className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.7)] z-10 pointer-events-none" style={{ left: `${sliderPos}%` }} />
              <div className="absolute top-1/2 z-20 pointer-events-none" style={{ left: `${sliderPos}%`, transform: "translate(-50%, -50%)" }}>
                <div className="w-10 h-10 rounded-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex items-center justify-center ring-2 ring-black/10">
                  <ArrowLeftRight className="w-4 h-4 text-[#0F172A]" />
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-[#0F172A]/85 backdrop-blur-md text-[#94A3B8] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow-lg border border-[#334155] pointer-events-none z-10">BEFORE</div>
              <div className="absolute top-4 right-4 bg-[#0EA5E9]/85 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow-lg border border-white/20 pointer-events-none z-10">AFTER</div>
              {sliderPos === 100 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-[#0F172A]/80 backdrop-blur-md text-[#94A3B8] text-[8px] sm:text-[9px] font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#334155] pointer-events-none z-10 whitespace-nowrap">
                  ← Drag to compare&nbsp;|&nbsp; Before ↔ After
                </div>
              )}
            </div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full shrink-0">
              <button onClick={onQuoteClick} className="w-full py-3.5 rounded-xl font-[800] text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse-glow border border-[#60A5FA]/30 transition-all">
                <Sparkles className="w-4 h-4" /> Request Free Quote &amp; Download
              </button>
            </motion.div>
          </motion.div>
        ) : (isProcessing || isQuickGenerating) ? (
          <RenderingOverlay />
        ) : selectedImage ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full p-4 flex flex-col relative">
            <div className="absolute top-3 right-4 hidden sm:flex items-center gap-1.5 bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-full px-3 py-1.5 shadow-xl z-20">
              <button onClick={() => setZoom(Math.max(1, zoom - 0.25))} className="p-1.5 rounded-full transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-[10px] font-bold text-[#E2E8F0] tracking-wider w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(5, zoom + 0.25))} className="p-1.5 rounded-full transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"><ZoomIn className="w-4 h-4" /></button>
              <div className="h-4 w-[1px] bg-[#334155] mx-1" />
              <button onClick={() => setIsPanMode(!isPanMode)} className={`p-1.5 rounded-full transition-colors ${isPanMode ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`}><Hand className="w-4 h-4" /></button>
              <button onClick={() => { setZoom(1); setPan({x:0, y:0}); }} className="p-1.5 rounded-full transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"><Maximize className="w-4 h-4" /></button>
            </div>
            <div className="w-full h-full relative rounded-lg overflow-hidden border border-[#334155] shadow-xl bg-[#0A0E17]/60 backdrop-blur-sm flex items-center justify-center mt-4">
              <div 
                className="relative inline-block max-w-full max-h-full"
                style={{
                  aspectRatio: imageDimensions.width / imageDimensions.height,
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center',
                }}
              >
                <img src={selectedImage} alt="Workspace" className="max-w-full max-h-full object-contain block pointer-events-none" />
                {swatchPreviewHex && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-10">
                    <div className="w-20 h-12 rounded-lg shadow-2xl border border-white/20 overflow-hidden relative" style={{ backgroundColor: swatchPreviewHex }}>
                      {swatchPreviewImage && (
                        <img src={swatchPreviewImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-full px-3 py-1.5 shadow-xl">
                      <div className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0 overflow-hidden relative" style={{ backgroundColor: swatchPreviewHex }}>
                        {swatchPreviewImage && (
                          <img src={swatchPreviewImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-[#E2E8F0] uppercase tracking-wider whitespace-nowrap">{swatchPreviewName}</span>
                    </div>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  width={imageDimensions.width}
                  height={imageDimensions.height}
                  className={`absolute inset-0 w-full h-full ${isPanMode ? (isDraggingPan ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                  style={{ touchAction: 'none', opacity: 0 }}
                  onMouseDown={(e) => onStartPan(e.clientX, e.clientY)}
                  onMouseMove={(e) => onMovePan(e.clientX, e.clientY)}
                  onMouseUp={onEndPan}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center p-12">
            <div className="w-24 h-24 bg-[#0F172A] rounded-2xl border border-[#1E293B] flex items-center justify-center mb-8 shadow-inner rotate-3"><ImageIcon className="w-10 h-10 text-[#334155]" /></div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-3 text-[#E2E8F0]">No Asset Detected</h4>
            <p className="text-[#64748B] text-xs font-medium max-w-xs leading-relaxed mb-6">Please upload a site photograph to begin.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(VisualizerCanvas);
