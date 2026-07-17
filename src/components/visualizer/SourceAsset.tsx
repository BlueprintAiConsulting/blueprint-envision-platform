import React from 'react';
import { Upload, X, Check, Wand2, Camera } from 'lucide-react';

interface SourceAssetProps {
  selectedImage: string | null;
  onUpload: (file: File) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onReplaceClick: () => void;
  imageOptimizeInfo: string | null;
  showEnhancePrompt: boolean;
  setShowEnhancePrompt: (show: boolean) => void;
  isEnhancing: boolean;
  enhancedImage: string | null;
  enhanceError: string | null;
  onEnhance: () => void;
  onAcceptEnhanced: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef?: React.RefObject<HTMLInputElement | null>;
}

const SourceAsset: React.FC<SourceAssetProps> = ({
  selectedImage,
  onUpload,
  onDrop,
  onDragOver,
  onReplaceClick,
  imageOptimizeInfo,
  showEnhancePrompt,
  setShowEnhancePrompt,
  isEnhancing,
  enhancedImage,
  enhanceError,
  onEnhance,
  onAcceptEnhanced,
  fileInputRef,
  cameraInputRef,
}) => {
  // Internal camera ref fallback when not provided by parent
  const internalCameraRef = React.useRef<HTMLInputElement>(null);
  const camRef = cameraInputRef ?? internalCameraRef;
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-[#0A0E17]/80 backdrop-blur-xl rounded-xl border border-[#1E293B] p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="w-6 h-6 bg-[#1E3A8A] text-[#60A5FA] rounded flex items-center justify-center text-xs font-bold">01</div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">Source Asset</h2>
        </div>
        {/* Hidden file inputs — gallery picker + camera capture */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => { if (e.target.files?.[0]) { onUpload(e.target.files[0]); e.target.value = ''; } }}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={camRef as React.RefObject<HTMLInputElement>}
          onChange={(e) => { if (e.target.files?.[0]) { onUpload(e.target.files[0]); e.target.value = ''; } }}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={`border-2 border-dashed rounded-lg transition-all ${selectedImage ? 'border-[#3B82F6] bg-[#1E3A8A]/20 p-4' : 'border-[#334155] hover:border-[#3B82F6] hover:bg-[#1E293B] p-6'}`}
        >
          {selectedImage ? (
            <div className="w-full">
              <div className="relative w-full rounded-md overflow-hidden shadow-inner bg-[#0F172A] group">
                <img src={selectedImage} alt="Uploaded" className="w-full h-auto max-h-72 object-contain" />
                <div className="absolute inset-0 bg-[#0F172A]/75 flex items-center justify-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
                  <button
                    onClick={onReplaceClick}
                    className="flex items-center gap-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors shadow-lg"
                  >
                    <Upload className="w-3 h-3" /> Replace Photo
                  </button>
                  <button
                    onClick={() => (camRef as React.RefObject<HTMLInputElement>).current?.click()}
                    className="flex items-center gap-1.5 bg-[#0F172A] hover:bg-[#1E293B] border border-[#334155] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Camera className="w-3 h-3" /> Take New Photo
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[#64748B] mt-2 text-center font-medium hidden sm:block">Hover to replace · click camera to shoot live</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-[#3B82F6] mb-3 opacity-80" />
              <p className="font-bold text-sm text-[#E2E8F0] text-center">Upload or Take a Photo</p>
              <p className="text-[10px] text-[#64748B] mt-1 text-center">JPG · PNG · WebP — auto-optimized</p>

              {/* CTA buttons — camera + gallery, visible on all devices */}
              <div className="mt-4 flex gap-2 w-full max-w-xs">
                <button
                  onClick={(e) => { e.stopPropagation(); (camRef as React.RefObject<HTMLInputElement>).current?.click(); }}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#3B82F6]/20 hover:bg-[#3B82F6]/30 active:scale-[0.97] border border-[#3B82F6]/50 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse-glow"
                >
                  <Camera className="w-5 h-5 text-[#60A5FA]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">Camera</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#111827] hover:bg-[#1E293B] active:scale-[0.97] border border-[#334155] hover:border-[#3B82F6]/40 transition-all"
                >
                  <Upload className="w-5 h-5 text-[#64748B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Gallery</span>
                </button>
              </div>

              <div className="mt-3 hidden sm:flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-[#1E293B] border border-[#334155] rounded text-[9px] font-mono font-bold text-[#94A3B8] shadow-sm">⌘V</kbd>
                <span className="text-[9px] text-[#475569] font-medium">to paste a screenshot</span>
              </div>
            </div>
          )}
        </div>

        {/* Home Selection — always visible */}
        <div className={selectedImage ? 'mt-3' : 'mt-5'}>
          <div className={`text-center ${selectedImage ? 'mb-2' : 'mb-4'}`}>
            <h3 className={`font-bold text-[#E2E8F0] uppercase tracking-wider ${selectedImage ? 'text-[10px]' : 'text-sm'}`}>
              {selectedImage ? 'Switch Home Style' : 'Select Your Home Style'}
            </h3>
            {!selectedImage && (
              <p className="text-[10px] text-[#64748B] mt-1">Choose a home that looks like yours — or upload your own photo</p>
            )}
          </div>
          <div className={`grid gap-2 ${selectedImage ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 gap-2.5'}`}>
            {[
              { src: 'demo-pa-colonial.png',     label: 'Colonial' },
              { src: 'demo-pa-ranch.png',         label: 'Ranch' },
              { src: 'demo-pa-bi-level.png',      label: 'Bi-Level' },
              { src: 'demo-pa-cape-cod.png',      label: 'Cape Cod' },
              { src: 'demo-pa-split-level.png',   label: 'Split Level' },
              { src: 'demo-pa-two-story.png',     label: 'Two-Story' },
            ].map(demo => (
              <button
                key={demo.src}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const base = import.meta.env.BASE_URL || '/';
                    const res = await fetch(`${base}${demo.src}`);
                    const blob = await res.blob();
                    const file = new File([blob], demo.src, { type: blob.type });
                    onUpload(file);
                  } catch {}
                }}
                className={`group relative rounded-xl overflow-hidden border-2 border-[#1E293B] hover:border-[#3B82F6] hover:shadow-[0_0_16px_rgba(59,130,246,0.3)] transition-all bg-[#0A0E17] cursor-pointer ${selectedImage ? 'aspect-square' : 'aspect-[4/3]'}`}
              >
                <img
                  src={`${import.meta.env.BASE_URL || '/'}${demo.src}`}
                  alt={demo.label}
                  className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className={`absolute bottom-0 inset-x-0 px-1 font-bold text-white uppercase tracking-wider text-center ${selectedImage ? 'text-[7px] py-1' : 'text-[10px] py-2'}`}>
                  {demo.label}
                </span>
                {!selectedImage && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-[#3B82F6] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      Use This Home
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {imageOptimizeInfo && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg text-[10px] text-[#34D399] font-medium mt-1 animate-pulse-once">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {imageOptimizeInfo}
        </div>
      )}

      {selectedImage && showEnhancePrompt && (
        <div className="bg-[#0A0E17]/80 backdrop-blur-xl rounded-xl border border-[#3B82F6]/40 p-4 shadow-[0_0_20px_rgba(59,130,246,0.15)] space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1E3A8A] text-[#60A5FA] rounded flex items-center justify-center shrink-0">
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#E2E8F0] leading-tight">AI Image Optimizer</p>
              <p className="text-[9px] text-[#64748B] leading-tight mt-0.5">Remove obstacles · Fix lighting · Prepare for visualization</p>
            </div>
            <button onClick={() => setShowEnhancePrompt(false)} className="text-[#475569] hover:text-[#94A3B8] transition-colors shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {!enhancedImage && !isEnhancing && (
            <>
              <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                Our AI will remove parked cars, people, and obstructing trees — then optimize brightness and contrast for best visualization results.
              </p>
              {enhanceError && (
                <p className="text-[10px] text-red-400 font-medium">{enhanceError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={onEnhance}
                  className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white bg-[#1E3A8A] hover:bg-[#1D4ED8] active:scale-[0.98] shadow-[0_0_16px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-1.5 border border-[#3B82F6]/40"
                >
                  <Wand2 className="w-3 h-3" /> Optimize Now
                </button>
                <button onClick={() => setShowEnhancePrompt(false)} className="px-3 py-2 rounded-lg text-[10px] font-bold text-[#64748B] hover:text-[#94A3B8] border border-[#1E293B] hover:border-[#334155] transition-all">
                  Skip
                </button>
              </div>
            </>
          )}

          {isEnhancing && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-[#1E3A8A] border-t-[#60A5FA] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-[#60A5FA]" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#60A5FA] uppercase tracking-widest">Optimizing Image</p>
                <p className="text-[10px] text-[#64748B] mt-1">Removing obstacles & enhancing quality…</p>
              </div>
            </div>
          )}

          {enhancedImage && !isEnhancing && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[#475569] mb-1 text-center">Original</p>
                  <img src={selectedImage} alt="Original" className="w-full rounded-md object-cover h-20 border border-[#1E293B]" />
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[#60A5FA] mb-1 text-center">Optimized ✦</p>
                  <img src={enhancedImage} alt="Optimized" className="w-full rounded-md object-cover h-20 border border-[#3B82F6]/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onAcceptEnhanced}
                  className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white bg-[#1E3A8A] hover:bg-[#1D4ED8] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 border border-[#3B82F6]/40"
                >
                  <Check className="w-3 h-3" /> Use Optimized
                </button>
                <button onClick={onEnhance} className="px-3 py-2 rounded-lg text-[10px] font-bold text-[#60A5FA] hover:text-white border border-[#3B82F6]/40 hover:border-[#3B82F6] hover:bg-[#1E3A8A]/40 transition-all" title="Run optimization again">
                  ↻ Retry
                </button>
                <button onClick={() => setShowEnhancePrompt(false)} className="px-3 py-2 rounded-lg text-[10px] font-bold text-[#64748B] hover:text-[#94A3B8] border border-[#1E293B] hover:border-[#334155] transition-all">
                  Keep Original
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SourceAsset;
