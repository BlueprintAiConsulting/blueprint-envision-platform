/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';

import { Upload, Layout, Check, Loader2, Image as ImageIcon, Sparkles, ArrowRight, Grid3X3, Layers, Settings, ChevronDown, Undo, Redo, Brush, Eraser, Trash2, Wand2, ArrowLeftRight, Feather, Scan, Info, Sun, X, Pencil, ZoomIn, ZoomOut, Maximize, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { get, set, del } from 'idb-keyval';
import { TENANT } from './tenant.config';
import { SIDING_OPTIONS, ALL_SIDING_OPTIONS, VERTICAL_OPTIONS, DEFAULT_SIDING_LINE, DEFAULT_SIDING_COLOR, SHUTTER_COLORS, TRIM_COLORS } from './catalogData';




// Proper types for siding catalog data
interface SidingColor {
  id: string;
  name: string;
  hex: string;
  hue: string; // Plain-language color description shown in the UI
}

interface SidingLine {
  tier: string;
  line: string;
  material: string;
  description: string;
  profileLabel: string;       // e.g. "D5\u2033 Colonial Clapboard"
  textureImage: string;       // path under /textures/
  textureStyle: 'horizontal-lap' | 'dutch-lap' | 'board-batten' | 'shake';
  colors: SidingColor[];
  style?: 'horizontal' | 'vertical';
}

interface Section {
  id: string;
  name: string;
  maskData: string | null;
  selectedLine: SidingLine;
  selectedColor: SidingColor;
  maskTarget: string;
}

interface QuickZone {
  id: string;
  name: string;
  enabled: boolean;
  selectedLine: SidingLine;
  selectedColor: SidingColor;
}


const DEFAULT_QUICK_ZONES: QuickZone[] = [
  { id: 'qz-main',     name: 'Main Body',   enabled: true,  selectedLine: DEFAULT_SIDING_LINE, selectedColor: DEFAULT_SIDING_COLOR },
  { id: 'qz-gable',    name: 'Upper Gable', enabled: false, selectedLine: SIDING_OPTIONS[2], selectedColor: SIDING_OPTIONS[2].colors[0] },
  { id: 'qz-dormer',   name: 'Dormer',      enabled: false, selectedLine: SIDING_OPTIONS[2], selectedColor: SIDING_OPTIONS[2].colors[3] },
  { id: 'qz-trim',     name: 'Trim',        enabled: false, selectedLine: SIDING_OPTIONS[0], selectedColor: TRIM_COLORS[0] },
  { id: 'qz-shutters', name: 'Shutters',    enabled: false, selectedLine: SIDING_OPTIONS[0], selectedColor: SHUTTER_COLORS[0] },
  { id: 'qz-garage',   name: 'Garage',      enabled: false, selectedLine: SIDING_OPTIONS[1], selectedColor: SIDING_OPTIONS[1].colors[1] },
];



export default function App() {
  const [isRestoring, setIsRestoring] = useState(true);

  // --- Dismiss splash screen as soon as React mounts ---
  useEffect(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('hidden');
      setTimeout(() => splash.remove(), 700);
    }
  }, []);

  // --- Keep-alive ping — prevents Render free-tier cold starts ---
  // Fires once on mount (warms the server) then every 10 min while tab is open.
  // Pair with UptimeRobot (free) pinging /api/ping every 5 min for 24/7 warmth.
  useEffect(() => {
    const ping = () => fetch('/api/ping').catch(() => {});
    ping(); // immediate warm-up on load
    const id = setInterval(ping, 10 * 60 * 1000); // every 10 minutes
    return () => clearInterval(id);
  }, []);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // Image Optimizer states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [showEnhancePrompt, setShowEnhancePrompt] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);


  const [sections, setSections] = useState<Section[]>([
    {
      id: 'default',
      name: 'Main Siding',
      maskData: null,
      selectedLine: SIDING_OPTIONS[1],
      selectedColor: SIDING_OPTIONS[1].colors[0],
      maskTarget: 'exterior siding',
    }
  ]);
  const [optionalSections, setOptionalSections] = useState<{ name: string; maskTarget: string }[]>([]);
  const [currentSectionId, setCurrentSectionId] = useState('default');

  const currentSection = sections.find(s => s.id === currentSectionId) || sections[0];
  
  const [selectedLine, setSelectedLine] = useState(currentSection.selectedLine);
  const [selectedColor, setSelectedColor] = useState(currentSection.selectedColor);
  
  const [past, setPast] = useState<{ line: typeof selectedLine, color: typeof selectedColor, resultImage: string | null, selectedImage: string | null }[]>([]);
  const [future, setFuture] = useState<{ line: typeof selectedLine, color: typeof selectedColor, resultImage: string | null, selectedImage: string | null }[]>([]);

  const latestStateRef = useRef({ line: selectedLine, color: selectedColor, resultImage, selectedImage });
  const generateAbortRef = useRef<AbortController | null>(null); // cancels stale in-flight generate calls
  useEffect(() => {
    latestStateRef.current = { line: selectedLine, color: selectedColor, resultImage, selectedImage };
  }, [selectedLine, selectedColor, resultImage, selectedImage]);

  const saveStateToHistory = () => {
    setPast(prev => {
      const newState = [...prev, latestStateRef.current];
      if (newState.length > 50) return newState.slice(newState.length - 50);
      return newState;
    });
    setFuture([]);
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture(prev => [latestStateRef.current, ...prev]);
    setPast(newPast);
    setSelectedLine(previous.line);
    setSelectedColor(previous.color);
    setResultImage(previous.resultImage);
    setSelectedImage(previous.selectedImage);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast(prev => [...prev, latestStateRef.current]);
    setFuture(newFuture);
    setSelectedLine(next.line);
    setSelectedColor(next.color);
    setResultImage(next.resultImage);
    setSelectedImage(next.selectedImage);
  };
  
  const [sliderPos, setSliderPos] = useState(100); // 0–100 percent, default 100 = full after view
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const compareContainerRef = useRef<HTMLDivElement>(null);
  const [appMode, setAppMode] = useState<'quick' | 'advanced'>('quick');
  const [quickZones, setQuickZones] = useState<QuickZone[]>(DEFAULT_QUICK_ZONES);
  const [quickResult, setQuickResult] = useState<string | null>(null);
  const [isQuickGenerating, setIsQuickGenerating] = useState(false);
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>('qz-main');
  const [expandedColorZones, setExpandedColorZones] = useState<Set<string>>(new Set());
  const toggleColorZone = (id: string) => setExpandedColorZones(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const [swatchPreviewHex, setSwatchPreviewHex] = useState<string | null>(null);
  const [swatchPreviewName, setSwatchPreviewName] = useState<string>('');
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const generationStartRef = useRef<number>(0);

  // --- IndexedDB Hydration (Auto-Save Restore) ---
  useEffect(() => {
    async function hydrate() {
      try {
        const savedState = await get('blueprint-siding-state');
        if (savedState) {
          // Validate catalog compatibility — discard stale data from old catalog
          const knownIds = new Set(ALL_SIDING_OPTIONS.flatMap(l => l.colors.map(c => c.id)));
          const isValid = savedState.sections?.[0]?.selectedColor?.id ? knownIds.has(savedState.sections[0].selectedColor.id) : false;
          if (!isValid) { console.warn('[hydrate] Stale catalog — clearing'); await del('blueprint-siding-state'); setIsRestoring(false); return; }
          // NOTE: selectedImage is intentionally NOT restored — always start fresh at gallery
          if (savedState.appMode) setAppMode(savedState.appMode);
          if (savedState.sections) setSections(savedState.sections);
          if (savedState.currentSectionId) setCurrentSectionId(savedState.currentSectionId);
          if (savedState.quickZones) setQuickZones(savedState.quickZones);
          
          if (savedState.sections && savedState.currentSectionId) {
            const sec = savedState.sections.find((s: any) => s.id === savedState.currentSectionId) || savedState.sections[0];
            setSelectedLine(sec.selectedLine);
            setSelectedColor(sec.selectedColor);
          }
        }
      } catch (e) {
        console.error("Error loading state from IndexedDB", e);
      } finally {
        setIsRestoring(false);
      }
    }
    hydrate();
  }, []);

  // --- IndexedDB Auto-Save Watcher (debounced 1.5s) ---
  useEffect(() => {
    if (isRestoring || (!selectedImage && !quickResult && !resultImage)) return;
    
    const payload = {
      selectedImage,
      appMode,
      sections,
      currentSectionId,
      resultImage,
      quickZones,
      quickResult
    };
    const timerId = setTimeout(() => {
      set('blueprint-siding-state', payload).catch(console.error);
    }, 1500);
    return () => clearTimeout(timerId);
    
  }, [isRestoring, selectedImage, appMode, sections, currentSectionId, resultImage, quickZones, quickResult]);

  // --- Tick elapsed timer while any generation is running ---
  useEffect(() => {
    if (!isProcessing && !isQuickGenerating) return;
    generationStartRef.current = Date.now();
    setElapsedSecs(0);
    const id = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - generationStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isProcessing, isQuickGenerating]);

  // --- Zoom & Pan State & Hotkeys ---
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a text input (e.g., target tracking area)
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault(); // prevent page scroll down
        setIsPanMode(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPanMode(false);
        setIsDraggingPan(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const switchSection = (sectionId: string) => {
    if (!canvasRef.current) return;
    
    // Save current section state
    const currentMaskData = canvasRef.current.toDataURL();
    setSections(prev => prev.map(s => s.id === currentSectionId ? { ...s, maskData: currentMaskData, selectedLine, selectedColor, maskTarget } : s));
    
    // Load new section state
    const nextSection = sections.find(s => s.id === sectionId);
    if (nextSection) {
      setCurrentSectionId(sectionId);
      setSelectedLine(nextSection.selectedLine);
      setSelectedColor(nextSection.selectedColor);
      setMaskTarget(nextSection.maskTarget);
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (nextSection.maskData) {
          const img = new Image();
          img.onload = () => {
            // Scale mask to fill canvas regardless of AI output resolution
            ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
            setHasMask(true);
          };
          img.src = nextSection.maskData;
        } else {
          setHasMask(false);
        }
      }
    }
  };

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    const newSection: Section = {
      id: newId,
      name: `Section ${sections.length + 1}`,
      maskData: null,
      selectedLine: SIDING_OPTIONS[1],
      selectedColor: SIDING_OPTIONS[1].colors[0],
      maskTarget: 'exterior siding',
    };
    setSections(prev => [...prev, newSection]);
    setCurrentSectionId(newId);
    setSelectedLine(newSection.selectedLine);
    setSelectedColor(newSection.selectedColor);
    setMaskTarget(newSection.maskTarget);
    // Guard: canvas may not be mounted yet
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHasMask(false);
      }
    }
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) return;
    const newSections = sections.filter(s => s.id !== id);
    setSections(newSections);
    if (currentSectionId === id) {
      switchSection(newSections[0].id);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [brushSize, setBrushSize] = useState(40);
  const [isEraser, setIsEraser] = useState(false);
  const [isMagicWand, setIsMagicWand] = useState(false);
  const [wandTolerance, setWandTolerance] = useState(30);
  const [featherAmount, setFeatherAmount] = useState(0);
  const [isAutoMasking, setIsAutoMasking] = useState(false);
  const [isDetectingSections, setIsDetectingSections] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState<string>('');
  const originalImageDataRef = useRef<ImageData | null>(null);
  // Cache: Map<imageHash → Section[]> — avoids re-running detect+mask on the same image
  const detectCacheRef = useRef<Map<string, Section[]>>(new Map());
  const [hasMask, setHasMask] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [lightingCondition, setLightingCondition] = useState('Daylight');
  const [maskTarget, setMaskTarget] = useState(currentSection.maskTarget);
  const aiMaskImageRef = useRef<HTMLImageElement | null>(null);

  // --- Quote Request Modal state ---
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteApiError, setQuoteApiError] = useState<string | null>(null);
  const [imageOptimizeInfo, setImageOptimizeInfo] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    name: '', email: '', phone: '', address: '', zipCode: '',
    contactTime: 'Morning', projectTimeline: 'Within 1 Month',
    referralSource: 'Google', notes: '',
  });

  const hitTestCanvasRef = useRef<HTMLCanvasElement>(null);
  const [infoSectionId, setInfoSectionId] = useState<string | null>(null);
  const [showToS, setShowToS] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const isDraggingRef = useRef(false);
  
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const lastHoverTime = useRef(0);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const previewRafRef = useRef<number | null>(null); // RAF handle for magic-wand preview throttle

  const MAX_MASK_HISTORY = 15; // Each ImageData ~8 MB @ 1920×1080 — cap prevents memory bloat
  const [maskPast, setMaskPast] = useState<{imageData: ImageData, hasMask: boolean}[]>([]);
  const [maskFuture, setMaskFuture] = useState<{imageData: ImageData, hasMask: boolean}[]>([]);

  // NOTE: Auto-loading default-house.jpg removed for white-label platform.
  // Users choose from the demo gallery or upload their own image.

  // ---------------------------------------------------------------------------
  // Clipboard paste: Cmd+V / Ctrl+V pastes an image directly from clipboard
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignore if the user is typing in an input / textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setHasMask(false);
        setMaskPast([]);
        setMaskFuture([]);
        aiMaskImageRef.current = null;
        
        // Extract original image data for magic wand
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = img.naturalWidth;
        offscreenCanvas.height = img.naturalHeight;
        const ctx = offscreenCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          originalImageDataRef.current = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
        }
      };
      img.src = selectedImage;
    }
  }, [selectedImage]);

  useEffect(() => {
    if (!hitTestCanvasRef.current || imageDimensions.width === 0) return;
    const ctx = hitTestCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.clearRect(0, 0, imageDimensions.width, imageDimensions.height);
    
    const drawMasks = async () => {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.id === currentSectionId) continue;
        if (section.maskData) {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = imageDimensions.width;
              tempCanvas.height = imageDimensions.height;
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) {
                tempCtx.drawImage(img, 0, 0);
                tempCtx.globalCompositeOperation = 'source-in';
                tempCtx.fillStyle = `rgb(${i + 1}, 0, 0)`;
                tempCtx.fillRect(0, 0, imageDimensions.width, imageDimensions.height);
                ctx.drawImage(tempCanvas, 0, 0);
              }
              resolve();
            };
            img.src = section.maskData!;
          });
        }
      }
    };
    drawMasks();
  }, [sections, imageDimensions, currentSectionId]);

  const saveMaskState = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setMaskPast(prev => {
      const next = [...prev, { imageData, hasMask }];
      // Evict oldest entries beyond the cap to prevent unbounded memory growth
      return next.length > MAX_MASK_HISTORY ? next.slice(next.length - MAX_MASK_HISTORY) : next;
    });
    setMaskFuture([]);
  };

  const undoMask = () => {
    if (maskPast.length === 0 || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const currentImageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setMaskFuture(prev => [{ imageData: currentImageData, hasMask }, ...prev]);
    
    const previousState = maskPast[maskPast.length - 1];
    setMaskPast(prev => prev.slice(0, -1));
    
    ctx.putImageData(previousState.imageData, 0, 0);
    setHasMask(previousState.hasMask);
  };

  const redoMask = () => {
    if (maskFuture.length === 0 || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const currentImageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setMaskPast(prev => [...prev, { imageData: currentImageData, hasMask }]);
    
    const nextState = maskFuture[0];
    setMaskFuture(prev => prev.slice(1));
    
    ctx.putImageData(nextState.imageData, 0, 0);
    setHasMask(nextState.hasMask);
  };

  // ---------------------------------------------------------------------------
  // Shared scanline flood fill — used by both commit (floodFill) and preview.
  // fillColor: [R, G, B, A] written to each matched pixel.
  // readCanvas: source of existing mask pixels (for commit mode).
  // writeCanvas: target canvas to paint the result.
  // Optimization: squared-distance color match avoids Math.sqrt per pixel (~3× faster).
  // ---------------------------------------------------------------------------
  const runScanlineFill = (
    writeCanvas: HTMLCanvasElement,
    startX: number,
    startY: number,
    tolerance: number,
    fillColor: [number, number, number, number],
    fresh = false,        // true = start from blank (preview), false = overlay existing mask
  ) => {
    if (!originalImageDataRef.current) return;
    const ctx = writeCanvas.getContext('2d');
    if (!ctx) return;

    const width = writeCanvas.width;
    const height = writeCanvas.height;
    ctx.clearRect(0, 0, width, height);

    startX = Math.floor(startX);
    startY = Math.floor(startY);
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

    const imgData = originalImageDataRef.current.data;
    const maskImageData = fresh
      ? ctx.createImageData(width, height)
      : ctx.getImageData(0, 0, width, height);
    const maskData = maskImageData.data;

    const startPos = (startY * width + startX) * 4;
    const startR = imgData[startPos];
    const startG = imgData[startPos + 1];
    const startB = imgData[startPos + 2];
    const tolSq = tolerance * tolerance; // avoid sqrt in the inner loop

    const visited = new Uint8Array(width * height);
    const stack = [[startX, startY]];

    const colorMatch = (pos: number) => {
      const r = imgData[pos]     - startR;
      const g = imgData[pos + 1] - startG;
      const b = imgData[pos + 2] - startB;
      return r * r + g * g + b * b <= tolSq;
    };

    while (stack.length > 0) {
      const current = stack.pop()!;
      let x = current[0];
      let y = current[1];
      let idx = y * width + x;

      while (y > 0 && colorMatch((idx - width) * 4) && !visited[idx - width]) {
        y--; idx -= width;
      }

      let spanLeft = false;
      let spanRight = false;

      while (y < height && colorMatch(idx * 4) && !visited[idx]) {
        visited[idx] = 1;
        const pos = idx * 4;
        maskData[pos]     = fillColor[0];
        maskData[pos + 1] = fillColor[1];
        maskData[pos + 2] = fillColor[2];
        maskData[pos + 3] = fillColor[3];

        if (x > 0) {
          if (colorMatch((idx - 1) * 4) && !visited[idx - 1]) {
            if (!spanLeft) { stack.push([x - 1, y]); spanLeft = true; }
          } else if (spanLeft) { spanLeft = false; }
        }
        if (x < width - 1) {
          if (colorMatch((idx + 1) * 4) && !visited[idx + 1]) {
            if (!spanRight) { stack.push([x + 1, y]); spanRight = true; }
          } else if (spanRight) { spanRight = false; }
        }

        y++; idx += width;
      }
    }

    ctx.putImageData(maskImageData, 0, 0);
  };
  // Distinct per-section highlight colors (RGBA, semi-transparent for mask overlay)
  const SECTION_COLORS: [number, number, number, number][] = [
    [59,  130, 246, 200],  // blue    – Section 1 (canvas hidden, data-only)
    [16,  185, 129, 200],  // emerald – Section 2
    [245, 158, 11,  200],  // amber   – Section 3
    [239, 68,  68,  200],  // rose    – Section 4
    [139, 92,  246, 200],  // violet  – Section 5
    [6,   182, 212, 200],  // cyan    – Section 6
  ];

  const getSectionRGBAArray = (): [number, number, number, number] => {
    const idx = sections.findIndex(s => s.id === currentSectionId);
    return SECTION_COLORS[Math.max(0, idx) % SECTION_COLORS.length];
  };

  const getSectionRGBA = (): string => {
    const [r, g, b, a] = getSectionRGBAArray();
    return `rgba(${r},${g},${b},${a / 255})`;
  };

  const floodFill = (startX: number, startY: number, tolerance: number) => {
    if (!canvasRef.current || !originalImageDataRef.current) return;
    saveMaskState();
    runScanlineFill(canvasRef.current, startX, startY, tolerance, getSectionRGBAArray());
    setHasMask(true);
  };

  const previewFloodFill = (startX: number, startY: number, tolerance: number) => {
    if (!hoverCanvasRef.current || !originalImageDataRef.current) return;
    const [r, g, b] = getSectionRGBAArray();
    runScanlineFill(hoverCanvasRef.current, startX, startY, tolerance, [r, g, b, 130], true);
  };


  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Returns the ratio of canvas native pixels to CSS display pixels.
  // brushSize is specified in display pixels; multiply by this to get canvas-space lineWidth.
  const getCanvasScale = (): number => {
    if (!canvasRef.current) return 1;
    const rect = canvasRef.current.getBoundingClientRect();
    return rect.width > 0 ? canvasRef.current.width / rect.width : 1;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = false;
    const coords = getCoordinates(e);
    if (!coords || !canvasRef.current) return;
    
    if (hoveredSectionId && hoveredSectionId !== currentSectionId) {
      isDrawingRef.current = false;
      return;
    }
    
    if (isMagicWand) {
      floodFill(coords.x, coords.y, wandTolerance);
      return;
    }

    saveMaskState();
    isDrawingRef.current = true;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // brushSize is in display pixels; scale to canvas-native pixels for correct visual size
    const scale = getCanvasScale();
    const scaledBrush = brushSize * scale;
    const scaledFeather = featherAmount * scale;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineTo(coords.x, coords.y);

    ctx.strokeStyle = getSectionRGBA();
    ctx.lineWidth = scaledBrush;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.shadowBlur = scaledFeather > 0 ? scaledFeather * 2 : 0;
    ctx.shadowColor = isEraser ? 'rgba(0,0,0,1)' : getSectionRGBA().replace(/,[^,]+\)$/, ',1)');
    ctx.stroke();

    if (!isEraser) setHasMask(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !canvasRef.current || isMagicWand) return;
    isDraggingRef.current = true;
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDraggingRef.current && hoveredSectionId && hoveredSectionId !== currentSectionId) {
      setInfoSectionId(hoveredSectionId);
    }

    if (!isDrawingRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.closePath();
      // Reset shadow so subsequent operations (eraser, new strokes) aren't affected
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
  };

  const clearHover = () => {
    if (hoverCanvasRef.current) {
      const ctx = hoverCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, hoverCanvasRef.current.width, hoverCanvasRef.current.height);
    }
  };


  // Cleanup RAF and hover timeout on unmount to prevent stale closures / memory leaks
  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current);
    };
  }, []);

  // Prevent browser scroll while painting on touch devices
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preventDefault = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener('touchmove', preventDefault, { passive: false });
    return () => canvas.removeEventListener('touchmove', preventDefault);
  }, []);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDrawingRef.current) {
      draw(e);
      return;
    }
    
    const coords = getCoordinates(e);
    if (!coords) {
      clearHover();
      setHoveredSectionId(null);
      return;
    }

    if (isMagicWand) {
      // RAF-throttled preview: cancel any pending frame, schedule a new one
      if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current);
      previewRafRef.current = requestAnimationFrame(() => {
        previewFloodFill(coords.x, coords.y, wandTolerance);
      });
    } else {
      // Draw brush/eraser cursor ring on the hover canvas
      if (hoverCanvasRef.current) {
        const hCtx = hoverCanvasRef.current.getContext('2d');
        if (hCtx) {
          hCtx.clearRect(0, 0, hoverCanvasRef.current.width, hoverCanvasRef.current.height);
          hCtx.beginPath();
          hCtx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
          if (isEraser) {
            hCtx.strokeStyle = 'rgba(239,68,68,0.85)';
            hCtx.setLineDash([5, 3]);
          } else {
            hCtx.strokeStyle = 'rgba(59,130,246,0.85)';
            hCtx.setLineDash([]);
            hCtx.fillStyle = 'rgba(59,130,246,0.1)';
            hCtx.fill();
          }
          hCtx.lineWidth = 1.5;
          hCtx.stroke();
          hCtx.setLineDash([]);
        }
      }
    }

    if (hitTestCanvasRef.current && !isMagicWand && !isEraser) {
      const ctx = hitTestCanvasRef.current.getContext('2d');
      if (ctx) {
        const pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data;
        const sectionIndex = pixel[0] - 1;
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
          setHoveredSectionId(sections[sectionIndex].id);
        } else {
          setHoveredSectionId(null);
        }
      }
    } else {
      setHoveredSectionId(null);
    }
  };

  const clearMask = () => {
    if (!canvasRef.current) return;
    saveMaskState();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setHasMask(false);
  };

  const findConnectedComponents = (imageData: ImageData, width: number, height: number): ImageData[] => {
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const components: ImageData[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (!visited[idx] && data[idx * 4 + 3] > 0) {
          const queue = [idx];
          visited[idx] = 1;
          const pixels = [];

          let head = 0;
          while (head < queue.length) {
            const currIdx = queue[head++];
            pixels.push(currIdx);
            
            const cx = currIdx % width;
            const cy = Math.floor(currIdx / width);

            // Check neighbors
            if (cx > 0) {
              const left = currIdx - 1;
              if (!visited[left] && data[left * 4 + 3] > 0) {
                visited[left] = 1;
                queue.push(left);
              }
            }
            if (cx < width - 1) {
              const right = currIdx + 1;
              if (!visited[right] && data[right * 4 + 3] > 0) {
                visited[right] = 1;
                queue.push(right);
              }
            }
            if (cy > 0) {
              const up = currIdx - width;
              if (!visited[up] && data[up * 4 + 3] > 0) {
                visited[up] = 1;
                queue.push(up);
              }
            }
            if (cy < height - 1) {
              const down = currIdx + width;
              if (!visited[down] && data[down * 4 + 3] > 0) {
                visited[down] = 1;
                queue.push(down);
              }
            }
          }

          // Filter out small noise blobs (e.g., less than 500 pixels)
          if (pixels.length > 500) {
            const newImgData = new ImageData(width, height);
            for (let i = 0; i < pixels.length; i++) {
              const pIdx = pixels[i];
              newImgData.data[pIdx * 4] = 255;
              newImgData.data[pIdx * 4 + 1] = 255;
              newImgData.data[pIdx * 4 + 2] = 255;
              newImgData.data[pIdx * 4 + 3] = data[pIdx * 4 + 3];
            }
            components.push(newImgData);
          }
        }
      }
    }
    return components;
  };

  const applyAiMaskThreshold = () => {
    if (!aiMaskImageRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(aiMaskImageRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;

    const threshold = 128;
    let hasAnyMask = false;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      if (luminance > threshold) {
        const edgeSoftness = 10;
        const alpha = Math.min(255, Math.max(0, (luminance - threshold) * edgeSoftness));
        data[i] = 255;
        data[i+1] = 255;
        data[i+2] = 255;
        data[i+3] = alpha;
        if (alpha > 10) hasAnyMask = true;
      } else {
        data[i] = 0;
        data[i+1] = 0;
        data[i+2] = 0;
        data[i+3] = 0;
      }
    }

    const components = findConnectedComponents(imgData, tempCanvas.width, tempCanvas.height);
    
    if (components.length > 0) {
      // Pre-compute section start index so color assignments are stable
      const existingSectionCount = sections.filter(s => s.id !== currentSectionId || !!sections.find(x => x.id === currentSectionId)?.maskData).length;

      const newSections = components.map((compData, index) => {
        const sectionColorIndex = (existingSectionCount + index) % SECTION_COLORS.length;
        const [cr, cg, cb, ca] = SECTION_COLORS[sectionColorIndex];

        // Colorize: replace white alpha-channel pixels with the section highlight color
        const colorizedData = new ImageData(compData.width, compData.height);
        for (let p = 0; p < compData.data.length; p += 4) {
          if (compData.data[p + 3] > 0) {
            colorizedData.data[p]     = cr;
            colorizedData.data[p + 1] = cg;
            colorizedData.data[p + 2] = cb;
            colorizedData.data[p + 3] = ca;
          }
        }

        const compCanvas = document.createElement('canvas');
        compCanvas.width = tempCanvas.width;
        compCanvas.height = tempCanvas.height;
        const compCtx = compCanvas.getContext('2d')!;
        compCtx.putImageData(colorizedData, 0, 0);
        
        return {
          id: `ai-section-${Date.now()}-${index}`,
          name: `${maskTarget} ${index + 1}`,
          maskData: compCanvas.toDataURL('image/png'),
          selectedLine: SIDING_OPTIONS[1],
          selectedColor: SIDING_OPTIONS[1].colors[0],
          maskTarget: maskTarget,
        };
      });

      setSections(prev => {
        const current = prev.find(s => s.id === currentSectionId);
        const isCurrentEmpty = !current?.maskData;
        
        const keptSections = prev.filter(s => {
          if (isCurrentEmpty && s.id === currentSectionId) return false;
          return true;
        });
        
        return [...keptSections, ...newSections];
      });
      
      const firstNewId = newSections[0].id;
      setCurrentSectionId(firstNewId);
      
      // Paint the first section's colorized mask onto the active canvas
      const firstColorIndex = existingSectionCount % SECTION_COLORS.length;
      const [fr, fg, fb, fa] = SECTION_COLORS[firstColorIndex];
      const firstColorized = new ImageData(components[0].width, components[0].height);
      for (let p = 0; p < components[0].data.length; p += 4) {
        if (components[0].data[p + 3] > 0) {
          firstColorized.data[p]     = fr;
          firstColorized.data[p + 1] = fg;
          firstColorized.data[p + 2] = fb;
          firstColorized.data[p + 3] = fa;
        }
      }
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.putImageData(firstColorized, 0, 0);
      setHasMask(true);
    } else {
      ctx.putImageData(imgData, 0, 0);
      setHasMask(hasAnyMask);
    }
  };

  const autoMaskSiding = async () => {
    if (!selectedImage || !canvasRef.current) return;
    setIsAutoMasking(true);
    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      // API key stays on the server — call our backend proxy
      const res = await fetch('/api/auto-mask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType, maskTarget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auto-mask generation failed.');

      const maskBase64: string = data.maskBase64;
      const img = new Image();
      img.onload = () => {
        saveMaskState();
        aiMaskImageRef.current = img;
        applyAiMaskThreshold();
        setIsAutoMasking(false);
      };
      img.onerror = () => {
        console.error('Failed to load generated mask image');
        setIsAutoMasking(false);
      };
      img.src = maskBase64;
    } catch (err) {
      console.error('Auto-mask failed:', err);
      setIsAutoMasking(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Image downscaler — reduces size before sending to mask API.
  // B&W silhouette masks don't need full resolution; 1024px is plenty
  // and significantly reduces upload time + model inference time.
  // ---------------------------------------------------------------------------
  const downscaleImage = (src: string, maxPx: number): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.88).split(',')[1]);
      };
      img.src = src;
    });

  // ---------------------------------------------------------------------------
  // Phase 1: /api/detect-sections  → get JSON list of siding zones
  // Phase 2: /api/auto-mask (×N)   → generate a mask image per zone
  // Result: replaces the sections list with AI-generated, pre-masked sections
  // ---------------------------------------------------------------------------
  const detectAndMaskSections = async () => {
    if (!selectedImage) return;
    setIsDetectingSections(true);
    setDetectionProgress('Analyzing house structure...');
    setError(null);

    try {
      // --- Simple hash: first 256 chars of base64 is enough to identify the image ---
      const imageHash = selectedImage.slice(0, 256);

      // --- #4: Cache hit — skip all API calls, reuse previous result ---
      if (detectCacheRef.current.has(imageHash)) {
        const cached = detectCacheRef.current.get(imageHash)!;
        setSections(cached);
        const firstId = cached[0]?.id;
        if (firstId) {
          setCurrentSectionId(firstId);
          setSelectedLine(cached[0].selectedLine);
          setSelectedColor(cached[0].selectedColor);
          setMaskTarget(cached[0].maskTarget);
          if (cached[0].maskData && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
                ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
                setHasMask(true);
              };
              img.src = cached[0].maskData!;
            }
          }
        }
        setDetectionProgress(`✓ ${cached.length} sections (cached)`);
        setTimeout(() => setDetectionProgress(''), 3000);
        return;
      }

      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      // --- Phase 1: identify sections ---
      const detectRes = await fetch('/api/detect-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });
      const detectText = await detectRes.text();
      if (!detectText) throw new Error('Backend server is not responding — make sure it is running (npm run dev).');
      let detectData: any;
      try { detectData = JSON.parse(detectText); } catch { throw new Error('Backend returned an invalid response. Check server logs.'); }
      if (!detectRes.ok) throw new Error(detectData.error || 'Section detection failed.');

      const detectedSections: { name: string; maskTarget: string }[] = detectData.sections;
      const detectedOptional: { name: string; maskTarget: string }[] = detectData.optionalSections || [];
      setOptionalSections(detectedOptional);

      // --- #6: Single section — skip masking entirely ---
      if (detectedSections.length === 1) {
        setDetectionProgress('Single zone detected — skipping mask generation...');
        const singleSection: Section[] = [{
          id: `ai-${Date.now()}-0`,
          name: detectedSections[0].name,
          maskData: null,
          selectedLine: SIDING_OPTIONS[1],
          selectedColor: SIDING_OPTIONS[1].colors[0],
          maskTarget: detectedSections[0].maskTarget,
        }];
        setSections(singleSection);
        setCurrentSectionId(singleSection[0].id);
        setSelectedLine(singleSection[0].selectedLine);
        setSelectedColor(singleSection[0].selectedColor);
        setMaskTarget(singleSection[0].maskTarget);
        detectCacheRef.current.set(imageHash, singleSection);
        setDetectionProgress('✓ 1 section detected');
        setTimeout(() => setDetectionProgress(''), 3000);
        return;
      }

      // --- Phase 2: downscale image for masking ---
      const maskImageBase64 = await downscaleImage(selectedImage, 1024);
      const maskMimeType = 'image/jpeg';

      // --- Phase 3: generate masks in parallel, render each as it arrives (#5) ---
      setDetectionProgress(`Generating ${detectedSections.length} masks in parallel...`);

      // Initialise sections immediately with null masks so the panel shows names now
      const placeholderSections: Section[] = detectedSections.map((det, i) => ({
        id: `ai-${Date.now()}-${i}`,
        name: det.name,
        maskData: null,
        selectedLine: SIDING_OPTIONS[1],
        selectedColor: SIDING_OPTIONS[1].colors[i % SIDING_OPTIONS[1].colors.length],
        maskTarget: det.maskTarget,
      }));
      setSections(placeholderSections);
      setCurrentSectionId(placeholderSections[0].id);
      setSelectedLine(placeholderSections[0].selectedLine);
      setSelectedColor(placeholderSections[0].selectedColor);
      setMaskTarget(placeholderSections[0].maskTarget);

      // Fire all mask requests simultaneously; update state as each one resolves
      const maskPromises = detectedSections.map((det, i) =>
        fetch('/api/auto-mask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: maskImageBase64, mimeType: maskMimeType, maskTarget: det.maskTarget }),
        })
          .then(r => r.json())
          .then(async (maskData) => {
            let finalMaskData: string | null = maskData.maskBase64 || null;
            if (finalMaskData) {
              const sectionColorRGBA = SECTION_COLORS[i % SECTION_COLORS.length];
              finalMaskData = await tintMask(finalMaskData, sectionColorRGBA);
            }
            // #5: Update this specific section as soon as its mask is ready
            setSections(prev => prev.map(s =>
              s.id === placeholderSections[i].id ? { ...s, maskData: finalMaskData } : s
            ));
            // Draw the first section's mask onto the canvas immediately
            if (i === 0 && finalMaskData && canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                const img = new Image();
                img.onload = () => {
                  ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
                  ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
                  setHasMask(true);
                };
                img.src = finalMaskData;
              }
            }
            return { i, finalMaskData };
          })
          .catch(e => {
            console.warn(`[detect] mask error for "${det.name}":`, e);
            return { i, finalMaskData: null as string | null };
          })
      );

      // Wait for all to finish before storing in cache
      const allResults = await Promise.all(maskPromises);
      const finalSections: Section[] = placeholderSections.map((s, i) => ({
        ...s,
        maskData: allResults.find(r => r.i === i)?.finalMaskData ?? null,
      }));
      detectCacheRef.current.set(imageHash, finalSections);

      setDetectionProgress(`✓ ${finalSections.length} sections detected`);
      setTimeout(() => setDetectionProgress(''), 3000);
    } catch (err: any) {
      console.error('[detect-sections]', err);
      setError(err?.message || 'AI section detection failed. Please try again.');
      setDetectionProgress('');
    } finally {
      setIsDetectingSections(false);
    }
  };

  // Utility: tint a B&W mask image with an RGBA color via offscreen canvas
  const tintMask = (maskSrc: string, color: [number, number, number, number]): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          // White pixels become the tint color; black pixels become transparent
          if (d[i] > 128) {
            d[i]     = color[0];
            d[i + 1] = color[1];
            d[i + 2] = color[2];
            d[i + 3] = color[3];
          } else {
            d[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.onerror = () => resolve(maskSrc); // fallback: return original
      img.src = maskSrc;
    });
  };




  const invertMask = () => {
    if (!canvasRef.current) return;
    saveMaskState();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let hasAnyMask = false;
    for (let i = 0; i < data.length; i += 4) {
      const currentAlpha = data[i + 3];
      const newAlpha = 255 - currentAlpha;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = newAlpha;
      if (newAlpha > 0) hasAnyMask = true;
    }
    ctx.putImageData(imageData, 0, 0);
    setHasMask(hasAnyMask);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processFile = (file: File) => {
    // HEIC/HEIF detection (common iPhone format — browsers can't decode it)
    const name = file.name.toLowerCase();
    if (name.endsWith('.heic') || name.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
      setError("HEIC/HEIF images are not supported by web browsers. Please convert your photo to JPG or PNG first, or change your iPhone camera settings to \"Most Compatible\" (Settings → Camera → Formats).");
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError("That doesn't look like an image file. Please upload a JPG or PNG photo of your home.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("This image is too large (max 10 MB). Try taking a new photo or reducing the file size.");
      return;
    }
    if (file.size < 10 * 1024) {
      setError("This image is too small. Please upload a clear, high-resolution photo of the exterior of your home.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Validate image dimensions before accepting
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w < 400 || h < 400) {
          setError(`This image is too small (${w}×${h}px). For good results, use a photo at least 800×600 pixels. Try taking a new photo from ~15 feet away.`);
          return;
        }
        const ratio = Math.max(w, h) / Math.min(w, h);
        if (ratio > 3.5) {
          setError("This image has an unusual shape (panorama or very tall). Please upload a standard landscape or portrait photo of your home.");
          return;
        }
        // ── Normalize: resize to max 2048px + re-encode as JPEG @0.88 ─────────────
        // Runs 100% client-side via Canvas. Catches every upload path:
        // file picker, drag-and-drop, and clipboard paste.
        const MAX_SIDE = 2048;
        const jpegQuality = 0.88;
        const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
        const targetW = Math.round(w * scale);
        const targetH = Math.round(h * scale);
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const normalizedUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        // Approximate compressed size from base64 length
        const origKB = Math.round(file.size / 1024);
        const normKB = Math.round(normalizedUrl.split(',')[1].length * 0.75 / 1024);
        const sizeMsg = scale < 1
          ? `Resized to ${targetW}×${targetH}px · ${origKB}KB → ${normKB}KB`
          : `Optimized to JPEG · ${origKB}KB → ${normKB}KB`;
        setImageOptimizeInfo(sizeMsg);
        setTimeout(() => setImageOptimizeInfo(null), 5000);
        console.log('[normalizeImage]', sizeMsg);
        // ─────────────────────────────────────────────────────────────────────────
        saveStateToHistory();
        setSelectedImage(normalizedUrl);
        setResultImage(null);
        setQuickResult(null);
        setError(null);
        // Show AI optimizer prompt after any new upload
        setEnhancedImage(null);
        setEnhanceError(null);
        setShowEnhancePrompt(true);
      };
      img.onerror = () => {
        setError("We couldn't read this image. Please try a different photo (JPG or PNG work best).");
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setError("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // ---------------------------------------------------------------------------
  // enhanceImage — sends the selected image to /api/enhance-image for AI cleanup
  // ---------------------------------------------------------------------------
  const enhanceImage = async () => {
    if (!selectedImage) return;
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1] || 'image/jpeg';
      const res = await fetch('/api/enhance-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Enhancement failed.');
      const dataUrl = `data:${data.mimeType};base64,${data.enhancedImageBase64}`;
      setEnhancedImage(dataUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Enhancement failed. Please try again.';
      setEnhanceError(msg);
    } finally {
      setIsEnhancing(false);
    }
  };

  const acceptEnhancedImage = () => {
    if (enhancedImage) {
      setSelectedImage(enhancedImage);
      setResultImage(null);
      setQuickResult(null);
    }
    setShowEnhancePrompt(false);
    setEnhancedImage(null);
  };

  const exportDesign = async () => {
    if (!resultImage) return;

    const timestamp = new Date().toISOString().slice(0, 10);
    const img = new Image();

    img.onload = () => {
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const panelH = 56 + sections.length * 52 + 32; // header + rows + footer
      const totalH = imgH + panelH;

      const canvas = document.createElement('canvas');
      canvas.width = imgW;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d')!;

      // --- House image ---
      ctx.drawImage(img, 0, 0, imgW, imgH);

      // --- Spec panel background ---
      ctx.fillStyle = '#0A0E17';
      ctx.fillRect(0, imgH, imgW, panelH);

      // Top border accent line
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(0, imgH, imgW, 3);

      // --- Header row ---
      const headerY = imgH + 3;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, headerY, imgW, 44);

      // BlueprintEnvision wordmark
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#60A5FA';
      ctx.fillText('BLUEPRINTENVISION', 24, headerY + 16);
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('Exterior Visualizer', 24, headerY + 32);

      // Date + lighting on the right
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'right';
      ctx.fillText(`${lightingCondition} · ${timestamp}`, imgW - 24, headerY + 16);
      ctx.fillText('Color Specification', imgW - 24, headerY + 32);
      ctx.textAlign = 'left';

      // --- Section rows ---
      sections.forEach((section, i) => {
        const rowY = headerY + 44 + i * 52;

        // Alternating row background
        ctx.fillStyle = i % 2 === 0 ? '#0F172A' : '#111827';
        ctx.fillRect(0, rowY, imgW, 52);

        // Color swatch circle
        ctx.beginPath();
        ctx.arc(36, rowY + 26, 14, 0, Math.PI * 2);
        ctx.fillStyle = section.selectedColor.hex;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Section name
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText(section.name.toUpperCase(), 64, rowY + 20);

        // Color name + hue
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(`${section.selectedColor.name}  ·  ${section.selectedColor.hue}`, 64, rowY + 36);

        // Product line on right
        ctx.font = '10px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'right';
        ctx.fillText(`${section.selectedLine.tier} · ${section.selectedLine.line}`, imgW - 24, rowY + 26);
        ctx.textAlign = 'left';
      });

      // Footer disclaimer bar
      const footerBarH = 36;
      const footerBarY = headerY + 44 + sections.length * 52;
      ctx.fillStyle = '#0A0E17';
      ctx.fillRect(0, footerBarY, imgW, footerBarH);
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(0, footerBarY, imgW, 2);
      // "FOR ILLUSTRATION PURPOSES ONLY" stamp
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'left';
      ctx.fillText('FOR ILLUSTRATION PURPOSES ONLY', 24, footerBarY + 14);
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('Colors are digital approximations. Consult a representative for physical samples.', 24, footerBarY + 28);

      // Download
      const colorLabel = sections.map(s => s.selectedColor.name.replace(/\s+/g, '-').toLowerCase()).join('_');
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `blueprintenvision_spec_${colorLabel}_${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = resultImage;
  };

  // ---------------------------------------------------------------------------
  // Compress a mask data-URL to a small JPEG for the generate payload.
  // Masks are positional B&W guides — 512px is plenty; high res wastes bandwidth.
  // ---------------------------------------------------------------------------
  const compressMaskForGenerate = (dataUrl: string, maxPx = 512): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.80).split(',')[1]);
      };
      img.src = dataUrl;
    });

  // Map raw API error strings to customer-friendly messages
  const friendlyError = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('preflight_failure')) return 'This image doesn\'t appear to be a house. Please upload a clear exterior photo of your home.';
    if (lower.includes('quota')) return 'Our servers are under heavy load right now. Please try again in a few minutes.';
    if (lower.includes('safety')) return 'This image couldn\'t be processed. Please try a different photo.';
    if (lower.includes('not responding') || lower.includes('failed to fetch') || lower.includes('network')) return 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.';
    if (lower.includes('timeout') || lower.includes('aborted')) return 'The visualization is taking longer than expected. Please try again — sometimes a second attempt works.';
    if (lower.includes('invalid') || lower.includes('parse')) return 'Something unexpected happened. Please try again.';
    return msg;
  };

  const handleQuickGenerate = async () => {
    if (!selectedImage) { setError('Please upload a photo of your home to get started.'); return; }

    // Build zones: always include full-house siding (qz-main), plus any enabled accents
    const sidingZone = quickZones.find(z => z.id === 'qz-main')!;
    const gableZone = quickZones.find(z => z.id === 'qz-gable')!;
    const mainBodyName = gableZone.enabled
      ? 'Main body walls and lower wall sections only — do NOT apply to upper gables, dormers, or peaks'
      : 'All exterior siding (main body, upper gables, dormers, and all wall sections)';
    const zones = [
      { name: mainBodyName, lineName: sidingZone.selectedLine.line, colorName: sidingZone.selectedColor.name, colorHex: sidingZone.selectedColor.hex, hue: sidingZone.selectedColor.hue, style: (sidingZone.selectedLine as any).style || 'horizontal', textureStyle: sidingZone.selectedLine.textureStyle },
      ...(gableZone.enabled ? [{ name: 'Upper gables, dormers, and triangular peak sections ONLY — not the main walls', lineName: gableZone.selectedLine.line, colorName: gableZone.selectedColor.name, colorHex: gableZone.selectedColor.hex, hue: gableZone.selectedColor.hue, style: (gableZone.selectedLine as any).style || 'horizontal', textureStyle: gableZone.selectedLine.textureStyle }] : []),
      ...quickZones.filter(z => ['qz-shutters', 'qz-trim'].includes(z.id) && z.enabled).map(z => ({ name: z.name, lineName: 'Accent', colorName: z.selectedColor.name, colorHex: z.selectedColor.hex, hue: z.selectedColor.hue, style: 'horizontal' as const })),
    ];

    setIsQuickGenerating(true);
    setError(null);

    const MAX_RETRIES = 1;
    const TIMEOUT_MS = 90_000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const base64Data = selectedImage.split(',')[1];
        const mimeType = selectedImage.split(';')[0].split(':')[1];
        const res = await fetch('/api/quick-render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ imageBase64: base64Data, mimeType, zones }),
        });
        clearTimeout(timeoutId);

        const text = await res.text();
        if (!text) throw new Error('Backend server is not responding.');
        let data: any;
        try { data = JSON.parse(text); } catch { throw new Error('Unexpected server response.'); }
        if (!res.ok) throw new Error(data.error || 'Quick render failed.');
        setQuickResult(data.resultImage);
        setSliderPos(100);
        setIsQuickGenerating(false);
        return; // success — exit retry loop
      } catch (err: any) {
        if (err?.name === 'AbortError' && attempt < MAX_RETRIES) {
          console.warn(`[quick-render] Attempt ${attempt + 1} timed out, retrying...`);
          continue;
        }
        // Non-retriable or final attempt — show customer-friendly error
        if (attempt >= MAX_RETRIES) {
          const rawMsg = err?.message || 'Something went wrong. Please try again.';
          setError(friendlyError(rawMsg));
          setIsQuickGenerating(false);
          return;
        }
      }
    }
    setIsQuickGenerating(false);
  };

  const exportQuickDesign = () => {
    if (!quickResult) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    const zoneLabel = quickZones.filter(z => z.enabled).map(z => z.selectedColor.name.replace(/\s+/g, '-').toLowerCase()).join('_');

    const img = new Image();
    img.onload = () => {
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const barH = 44;

      const canvas = document.createElement('canvas');
      canvas.width = imgW;
      canvas.height = imgH + barH;
      const ctx = canvas.getContext('2d')!;

      // House image
      ctx.drawImage(img, 0, 0, imgW, imgH);

      // Disclaimer bar
      ctx.fillStyle = '#0A0E17';
      ctx.fillRect(0, imgH, imgW, barH);
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(0, imgH, imgW, 2);

      // Watermark label
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'left';
      ctx.fillText('FOR ILLUSTRATION PURPOSES ONLY', 16, imgH + 16);

      // Fine print
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('Colors are digital approximations. Request physical samples before purchasing.', 16, imgH + 30);

      // Blueprint AI + date on right
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#3B82F6';
      ctx.textAlign = 'right';
      ctx.fillText(`BLUEPRINTENVISION  ×  ${timestamp}`, imgW - 16, imgH + 20);
      ctx.textAlign = 'left';

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `blueprintenvision_quick_${zoneLabel}_${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = quickResult;
  };

  // ---------------------------------------------------------------------------
  // submitQuoteRequest — POSTs lead to /api/quote-request, then triggers export
  // ---------------------------------------------------------------------------
  const submitQuoteRequest = async () => {
    if (!quoteForm.name || !quoteForm.email || !quoteForm.phone || !quoteForm.address || !quoteForm.zipCode) {
      setQuoteApiError('Please fill in all required fields.');
      return;
    }
    setQuoteSubmitting(true);
    setQuoteApiError(null);

    const mainZone = quickZones.find(z => z.id === 'qz-main');
    const shutterZone = quickZones.find(z => z.id === 'qz-shutters');
    const trimZone = quickZones.find(z => z.id === 'qz-trim');

    const designSpec = appMode === 'quick'
      ? {
          mode: 'Quick',
          primaryLine: mainZone?.selectedLine.line,
          primaryColor: mainZone?.selectedColor.name,
          primaryHex: mainZone?.selectedColor.hex,
          shutters: shutterZone?.enabled ? shutterZone.selectedColor.name : null,
          trim: trimZone?.enabled ? trimZone.selectedColor.name : null,
        }
      : {
          mode: 'Advanced',
          sections: sections.map(s => ({ name: s.name, line: s.selectedLine.line, color: s.selectedColor.name, hex: s.selectedColor.hex })),
        };

    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quoteForm, designSpec }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit.');

      setQuoteSuccess(true);
      // Trigger the gated download
      if (appMode === 'quick') exportQuickDesign();
      else exportDesign();

      // Auto-dismiss modal after 4 seconds
      setTimeout(() => {
        setShowQuoteModal(false);
        setQuoteSuccess(false);
        setQuoteForm({ name: '', email: '', phone: '', address: '', zipCode: '', contactTime: 'Morning', projectTimeline: 'Within 1 Month', referralSource: 'Google', notes: '' });
      }, 4000);
    } catch (err: any) {
      setQuoteApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const generateSiding = async () => {
    if (!selectedImage) {
      setError('Please upload a photo of your home to get started.');
      return;
    }

    // --- Abort any in-flight generation request ---
    if (generateAbortRef.current) {
      generateAbortRef.current.abort();
    }
    const controller = new AbortController();
    generateAbortRef.current = controller;

    // Auto-timeout after 120 seconds
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    setIsProcessing(true);
    setError(null);

    try {
      // --- #1: Downscale source image to max 1536px before sending ---
      const scaledBase64 = await downscaleImage(selectedImage, 1536);

      // Save current section mask before generating
      const currentMaskData = canvasRef.current?.toDataURL();
      const updatedSections = sections.map(s =>
        s.id === currentSectionId ? { ...s, maskData: currentMaskData || null, selectedLine, selectedColor } : s
      );
      setSections(updatedSections);

      // --- #2: Compress masks to 512px for the generate payload ---
      const sectionsForPayload = await Promise.all(
        updatedSections.map(async (s) => ({
          ...s,
          maskData: s.maskData ? await compressMaskForGenerate(s.maskData) : null,
        }))
      );

      // API key stays on the server — call our backend proxy
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: scaledBase64,
          mimeType: 'image/jpeg',   // downscaleImage always outputs JPEG
          sections: sectionsForPayload,
          lightingCondition,
          isHighQuality: true,
          imageSize: '2K',
        }),
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed.');

      saveStateToHistory();
      setResultImage(data.resultImage);
      setSliderPos(100); // default to full after view
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        // Check if this was a timeout (not a user-initiated cancel)
        if (!generateAbortRef.current || generateAbortRef.current === controller) {
          setError(friendlyError('timeout'));
        }
        return;
      }
      console.error('Error generating siding:', err);
      setError(friendlyError(err?.message || 'Something went wrong. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#F8FAFC] font-sans selection:bg-[#3B82F6]/30 selection:text-[#60A5FA]">
      {/* Blueprint Grid Background (Dark Mode) */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Header */}
      <header className="border-b border-[#0EA5E9]/20 bg-[#060B18]/90 backdrop-blur-md sticky top-0 z-10 shadow-[0_1px_20px_rgba(14,165,233,0.08)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-mark.png"
              alt="Blueprint AI"
              className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(14,165,233,0.55)]"
            />
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">BLUEPRINT<span className="text-[#0EA5E9]">ENVISION</span></h1>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0EA5E9]/50">by Blueprint AI Consulting Co.</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-8 text-sm font-semibold text-[#94A3B8]">
            {selectedImage && (
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to start over? This will permanently clear your current project.')) {
                    await del('blueprint-siding-state');
                    window.location.reload();
                  }
                }}
                className="hover:text-red-400 text-red-500/80 transition-colors hidden md:flex items-center gap-2"
                title="Start Over"
              >
                <Trash2 className="w-4 h-4" />
                <span>Start Over</span>
              </button>
            )}

            <button
              onClick={() => {
                if (appMode === 'quick' ? !!quickResult : !!resultImage) {
                  setQuoteApiError(null);
                  setQuoteSuccess(false);
                  setShowQuoteModal(true);
                }
              }}
              disabled={appMode === 'quick' ? !quickResult : !resultImage}
              className={`px-3 md:px-5 py-2 rounded-md transition-all shadow-[0_0_10px_rgba(14,165,233,0.3)] active:scale-95 text-xs md:text-sm font-semibold flex items-center gap-2 ${
                (appMode === 'quick' ? quickResult : resultImage)
                  ? 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white'
                  : 'bg-[#1E293B] text-[#475569] cursor-not-allowed'
              }`}
              title={(appMode === 'quick' ? quickResult : resultImage) ? 'Request a free quote & download your visualization' : 'Generate a visualization first'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Get Free Quote &amp; Download</span>
              <span className="md:hidden">Get Quote</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 relative">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-4 space-y-6">

            {/* Mode Tabs */}
            <div className="flex gap-1 p-1 bg-[#0F172A] rounded-xl border border-[#1E293B]">
              <button onClick={() => { setAppMode('quick'); setError(null); }} className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${appMode === 'quick' ? 'bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>
                ⚡ Quick
              </button>
              <button onClick={() => { setAppMode('advanced'); setError(null); }} className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${appMode === 'advanced' ? 'bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>
                🎨 Advanced
              </button>
            </div>

            {/* 01 SOURCE ASSET — same in both modes */}
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-[#1E3A8A] text-[#60A5FA] rounded flex items-center justify-center text-xs font-bold">01</div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">Source Asset</h2>
              </div>
              <div onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-[#3B82F6] bg-[#1E3A8A]/20' : 'border-[#334155] hover:border-[#3B82F6] hover:bg-[#1E293B]'}`}>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                {selectedImage ? (
                  <div className="w-full">
                   <div className="relative w-full rounded-md overflow-hidden shadow-inner bg-[#0F172A] group">
                      <img src={selectedImage} alt="Uploaded" className="w-full h-auto max-h-72 object-contain" />

                      <div className="absolute inset-0 bg-[#0F172A]/75 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex items-center gap-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors shadow-lg">
                          <Upload className="w-3 h-3" /> Replace House Photo
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-2 text-center font-medium">Click or hover to replace photo</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#3B82F6] mb-3 opacity-80" />
                    <p className="font-bold text-sm text-[#E2E8F0]">Upload Site Photo</p>
                    <p className="text-[10px] text-[#64748B] mt-1 uppercase font-bold">JPG, PNG, WebP &mdash; auto-optimized</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 bg-[#1E293B] border border-[#334155] rounded text-[9px] font-mono font-bold text-[#94A3B8] shadow-sm">⌘V</kbd>
                      <span className="text-[9px] text-[#475569] font-medium">to paste a screenshot</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Image optimization feedback badge */}
            {imageOptimizeInfo && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg text-[10px] text-[#34D399] font-medium mt-1 animate-pulse-once">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {imageOptimizeInfo}
              </div>
            )}

            {/* ── AI Image Optimizer card ── */}
            {selectedImage && showEnhancePrompt && (
              <div className="bg-[#0F172A] rounded-xl border border-[#7C3AED]/40 p-4 shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#4C1D95] text-[#A78BFA] rounded flex items-center justify-center shrink-0">
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
                        onClick={enhanceImage}
                        className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:from-[#6D28D9] hover:to-[#4338CA] active:scale-[0.98] shadow-[0_0_16px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center gap-1.5"
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
                      <div className="w-10 h-10 border-2 border-[#4C1D95] border-t-[#A78BFA] rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Wand2 className="w-4 h-4 text-[#A78BFA]" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-[#A78BFA] uppercase tracking-widest">Optimizing Image</p>
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
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[#A78BFA] mb-1 text-center">Optimized ✦</p>
                        <img src={enhancedImage} alt="Optimized" className="w-full rounded-md object-cover h-20 border border-[#7C3AED]/50 shadow-[0_0_10px_rgba(124,58,237,0.3)]" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={acceptEnhancedImage}
                        className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:from-[#6D28D9] hover:to-[#4338CA] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3 h-3" /> Use Optimized
                      </button>
                      <button onClick={enhanceImage} className="px-3 py-2 rounded-lg text-[10px] font-bold text-[#A78BFA] hover:text-white border border-[#7C3AED]/40 hover:border-[#7C3AED] hover:bg-[#4C1D95]/30 transition-all" title="Run optimization again">
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

            {appMode === 'quick' ? (
              <>
                {/* 02 SIDING — applied to all exterior walls & gables */}
                <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-[#1E3A8A] text-[#60A5FA] rounded flex items-center justify-center text-xs font-bold">02</div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">Siding</h2>
                      <p className="text-[10px] text-[#64748B]">Applied to all exterior walls &amp; gables</p>
                    </div>
                  </div>
                  {/* Siding tier picker */}
                  {(() => {
                    const zone = quickZones.find(z => z.id === 'qz-main')!;
                    const gable = quickZones.find(z => z.id === 'qz-gable')!;
                    return (
                      <>
                        {/* Texture preview strip */}
                        <div className="mb-3 rounded-lg overflow-hidden relative h-[4.5rem] border border-[#334155] shadow-inner">
                          <img
                            src={zone.selectedLine.textureImage}
                            alt={zone.selectedLine.profileLabel}
                            className="w-full h-full object-cover opacity-70"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17]/80 via-[#0A0E17]/30 to-transparent" />
                          <div className="absolute inset-0 flex items-center px-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-[#60A5FA] leading-tight">{zone.selectedLine.line}</p>
                              <p className="text-[10px] font-medium text-[#E2E8F0] leading-tight mt-0.5">{zone.selectedLine.profileLabel}</p>
                              <p className="text-[8px] text-[#64748B] mt-0.5">{zone.selectedLine.colors.length} colors available</p>
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const mainColors = expandedColorZones.has('qz-main') ? zone.selectedLine.colors : zone.selectedLine.colors.slice(0, 8);
                          const hasMore = zone.selectedLine.colors.length > 8;
                          const isExpanded = expandedColorZones.has('qz-main');
                          // Ensure selected color is always visible
                          const selectedIdx = zone.selectedLine.colors.indexOf(zone.selectedColor);
                          const visibleColors = isExpanded ? zone.selectedLine.colors : [
                            ...zone.selectedLine.colors.slice(0, 8),
                            ...(selectedIdx >= 8 ? [zone.selectedLine.colors[selectedIdx]] : [])
                          ].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-1.5">
                                {(isExpanded ? zone.selectedLine.colors : visibleColors).map(color => (
                                  <button key={color.id}
                                    onClick={() => setQuickZones(prev => prev.map(z => z.id === 'qz-main' ? { ...z, selectedColor: color } : z))}
                                    onMouseEnter={() => { setSwatchPreviewHex(color.hex); setSwatchPreviewName(color.name); }}
                                    onMouseLeave={() => setSwatchPreviewHex(null)}
                                    className={`group relative flex items-stretch rounded-lg overflow-hidden transition-all text-left ${
                                      zone.selectedColor.id === color.id ? 'ring-2 ring-[#3B82F6] bg-[#1E293B]' : 'ring-1 ring-white/5 bg-[#0A0E17] hover:ring-white/20 hover:bg-[#111827]'
                                    }`}
                                  >
                                    <div className="w-8 shrink-0 relative overflow-hidden self-stretch" style={{ backgroundColor: color.hex }}>
                                      <img src={zone.selectedLine.textureImage} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20" aria-hidden="true" />
                                    </div>
                                    <div className="px-2 py-1.5 flex-1 min-w-0">
                                      <p className="text-[10px] font-semibold text-[#E2E8F0] leading-tight truncate">{color.name}</p>
                                      <p className="text-[8px] text-[#64748B] italic mt-0.5 leading-tight truncate">{color.hue}</p>
                                    </div>
                                    {zone.selectedColor.id === color.id && (
                                      <div className="flex items-center pr-1.5">
                                        <div className="w-3 h-3 bg-[#3B82F6] rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                              {hasMore && (
                                <button
                                  onClick={() => toggleColorZone('qz-main')}
                                  className="w-full mt-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#60A5FA] hover:text-[#93C5FD] transition-colors text-center border border-[#1E293B] rounded-lg hover:border-[#334155] hover:bg-[#111827]"
                                >
                                  {isExpanded ? '↑ Show fewer colors' : `↓ Show all ${zone.selectedLine.colors.length} colors`}
                                </button>
                              )}
                            </>
                          );
                        })()}
                        {/* ── Upper Gable optional zone ── */}
                        <div className="mt-3 pt-3 border-t border-[#1E293B]">
                          <div className="flex items-center gap-2 mb-2">
                            <button
                              onClick={() => setQuickZones(prev => prev.map(z => z.id === 'qz-gable' ? { ...z, enabled: !z.enabled } : z))}
                              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${gable.enabled ? 'bg-[#3B82F6]' : 'bg-[#1E293B] border border-[#334155]'}`}
                              aria-label="Toggle upper gable zone"
                            >
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${gable.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                            <span className={`text-xs font-bold transition-colors ${gable.enabled ? 'text-[#E2E8F0]' : 'text-[#475569]'}`}>Upper Gable</span>
                            <span className="text-[9px] text-[#475569] ml-auto">optional accent zone</span>
                          </div>
                          {gable.enabled && (
                            <>
                              {/* Gable texture strip */}
                              <div className="mb-2 rounded-lg overflow-hidden relative h-12 border border-[#334155] shadow-inner">
                                <img src={gable.selectedLine.textureImage} alt={gable.selectedLine.profileLabel} className="w-full h-full object-cover opacity-70" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17]/80 via-[#0A0E17]/30 to-transparent" />
                                <div className="absolute inset-0 flex items-center px-3">
                                  <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#A78BFA] leading-tight">{gable.selectedLine.line}</p>
                                    <p className="text-[10px] font-medium text-[#E2E8F0] leading-tight mt-0.5">{gable.selectedLine.profileLabel}</p>
                                  </div>
                                </div>
                              </div>
                              {/* Gable tier tabs */}
                              <div className="flex gap-1 mb-2">
                                {[SIDING_OPTIONS[2], VERTICAL_OPTIONS[0]].map(line => (
                                  <button key={line.line}
                                    onClick={() => setQuickZones(prev => prev.map(z => z.id === 'qz-gable' ? { ...z, selectedLine: line, selectedColor: line.colors[0] } : z))}
                                    className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors ${
                                      gable.selectedLine.line === line.line ? 'bg-[#7C3AED] text-white' : 'bg-[#1E293B] text-[#64748B] hover:text-[#94A3B8]'
                                    }`}
                                  >{line.line.replace('®', '').replace('™', '')}</button>
                                ))}
                              </div>
                              {/* Gable color grid */}
                              {(() => {
                                const gableExpanded = expandedColorZones.has('qz-gable');
                                const gableHasMore = gable.selectedLine.colors.length > 8;
                                const gableSelectedIdx = gable.selectedLine.colors.indexOf(gable.selectedColor);
                                const gableVisible = gableExpanded ? gable.selectedLine.colors : [
                                  ...gable.selectedLine.colors.slice(0, 8),
                                  ...(gableSelectedIdx >= 8 ? [gable.selectedLine.colors[gableSelectedIdx]] : [])
                                ].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
                                return (
                                  <>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {gableVisible.map(color => (
                                        <button key={color.id}
                                          onClick={() => setQuickZones(prev => prev.map(z => z.id === 'qz-gable' ? { ...z, selectedColor: color } : z))}
                                          onMouseEnter={() => { setSwatchPreviewHex(color.hex); setSwatchPreviewName(color.name); }}
                                          onMouseLeave={() => setSwatchPreviewHex(null)}
                                          className={`group relative flex items-stretch rounded-lg overflow-hidden transition-all text-left ${
                                            gable.selectedColor.id === color.id ? 'ring-2 ring-[#7C3AED] bg-[#1E293B]' : 'ring-1 ring-white/5 bg-[#0A0E17] hover:ring-white/20 hover:bg-[#111827]'
                                          }`}
                                        >
                                          <div className="w-8 shrink-0 relative overflow-hidden self-stretch" style={{ backgroundColor: color.hex }}>
                                            <img src={gable.selectedLine.textureImage} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20" aria-hidden="true" />
                                          </div>
                                          <div className="px-2 py-1.5 flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-[#E2E8F0] leading-tight truncate">{color.name}</p>
                                            <p className="text-[8px] text-[#64748B] italic mt-0.5 leading-tight truncate">{color.hue}</p>
                                          </div>
                                          {gable.selectedColor.id === color.id && (
                                            <div className="flex items-center pr-1.5">
                                              <div className="w-3 h-3 bg-[#7C3AED] rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>
                                            </div>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                    {gableHasMore && (
                                      <button
                                        onClick={() => toggleColorZone('qz-gable')}
                                        className="w-full mt-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#A78BFA] hover:text-[#C4B5FD] transition-colors text-center border border-[#1E293B] rounded-lg hover:border-[#334155] hover:bg-[#111827]"
                                      >
                                        {gableExpanded ? '↑ Show fewer colors' : `↓ Show all ${gable.selectedLine.colors.length} colors`}
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
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
                              <button onClick={() => setExpandedZoneId(expandedZoneId === zone.id ? null : zone.id)} className="flex items-center gap-1.5 group">
                                <div className="w-4 h-4 rounded-sm border border-white/20 shrink-0" style={{ backgroundColor: zone.selectedColor.hex }} />
                                <span className="text-[9px] text-[#94A3B8] group-hover:text-[#E2E8F0] truncate max-w-[72px] transition-colors">{zone.selectedColor.name}</span>
                                <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform duration-200 ${expandedZoneId === zone.id ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                          {zone.enabled && expandedZoneId === zone.id && (
                            <div className="border-t border-[#1E293B] bg-[#0A0E17]/80 p-3">
                              <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest mb-2">{paletteLabel}</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {palette.map(color => (
                                  <button key={color.id}
                                    onClick={() => setQuickZones(prev => prev.map(z => z.id === zone.id ? { ...z, selectedColor: color } : z))}
                                    onMouseEnter={() => { setSwatchPreviewHex(color.hex); setSwatchPreviewName(color.name); }}
                                    onMouseLeave={() => setSwatchPreviewHex(null)}
                                    className={`group relative flex items-stretch rounded-lg overflow-hidden transition-all text-left ${zone.selectedColor.id === color.id ? 'ring-2 ring-[#3B82F6] bg-[#1E293B]' : 'ring-1 ring-white/5 bg-[#0A0E17] hover:ring-white/20 hover:bg-[#111827]'}`}
                                  >
                                    <div className="w-8 shrink-0 relative overflow-hidden self-stretch" style={{ backgroundColor: color.hex }}>
                                <img src={selectedLine.textureImage} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20" aria-hidden="true" />
                              </div>
                                    <div className="px-2 py-1.5 flex-1 min-w-0">
                                      <p className="text-[10px] font-semibold text-[#E2E8F0] leading-tight truncate">{color.name}</p>
                                      <p className="text-[8px] text-[#64748B] italic mt-0.5 leading-tight truncate">{color.hue}</p>
                                    </div>
                                    {zone.selectedColor.id === color.id && (
                                      <div className="flex items-center pr-1.5">
                                        <div className="w-3 h-3 bg-[#3B82F6] rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>


                {/* Color accuracy disclaimer */}
                <div className="flex items-start gap-2 px-3 py-2.5 bg-[#0A0E17] border border-[#1E293B] rounded-lg">
                  <Info className="w-3 h-3 text-[#475569] shrink-0 mt-0.5" />
                  <p className="text-[8.5px] text-[#475569] leading-relaxed">
                    {TENANT.disclaimerText}
                  </p>
                </div>

                {/* Quick Generate Button */}
                <div className="flex gap-2 mt-4">
                  {quickResult && (
                    <button 
                      onClick={() => setQuickResult(null)} 
                      className="w-[120px] py-4 rounded-lg font-bold text-[#94A3B8] bg-[#1E293B] hover:bg-[#334155] hover:text-white transition-all text-[10px] tracking-widest uppercase border border-[#334155] flex flex-col items-center justify-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Back
                    </button>
                  )}
                  <button disabled={isQuickGenerating || !quickZones.some(z => z.enabled) || !selectedImage} onClick={handleQuickGenerate}
                    className={`flex-1 py-4 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs ${isQuickGenerating || !quickZones.some(z => z.enabled) || !selectedImage ? 'bg-[#1E293B] text-[#64748B] cursor-not-allowed border border-[#334155]' : quickResult ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.98] border border-[#60A5FA]/30 shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse' : 'bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-[#60A5FA]/30'}`}>
                    {isQuickGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Rendering...</> : quickResult ? <><Sparkles className="w-4 h-4" /> Re-Generate</> : <><Sparkles className="w-4 h-4" /> Generate Visualization</>}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* AI Section Separator (Advanced only) */}
                {selectedImage && (
                  <div className={`rounded-xl border p-5 shadow-lg relative overflow-hidden transition-all ${isDetectingSections ? 'bg-[#0F1E3D] border-[#3B82F6]/60' : 'bg-gradient-to-br from-[#111827] to-[#0F172A] border-[#1E3A8A]/60 hover:border-[#3B82F6]/60'}`}>
                    {isDetectingSections && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3B82F6]/10 to-transparent animate-[shimmer_1.5s_infinite] pointer-events-none" />}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg border ${isDetectingSections ? 'bg-[#3B82F6]/30 border-[#3B82F6]/50 animate-pulse' : 'bg-[#1E3A8A]/60 border-[#1E3A8A]'}`}><Sparkles className="w-4 h-4 text-[#60A5FA]" /></div>
                      <div><h3 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider">AI Section Separator</h3><p className="text-[10px] text-[#64748B]">Detect siding zones automatically</p></div>
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
                        <p className="text-[10px] text-[#64748B] leading-relaxed">Analyzes the house photo to identify <span className="text-[#94A3B8] font-medium">distinct siding zones</span> — main body, gable ends, garage bays — and generates precise masks for each, ready to color individually.</p>
                        <button onClick={detectAndMaskSections} disabled={isDetectingSections} className="w-full flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-all border border-[#3B82F6]/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                          <Sparkles className="w-3.5 h-3.5" /> Detect Siding Sections
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ACTIVE ZONES — sidebar list after detection */}
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
                          onClick={() => switchSection(section.id)}
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
                              onChange={(e) => { const n = e.target.value; setSections(prev => prev.map(s => s.id === section.id ? { ...s, name: n } : s)); }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none flex-1 border-b border-white/30 focus:border-white"
                            />
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider flex-1 truncate">{section.name}</span>
                          )}
                          {sections.length > 1 && (
                            <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                              className="opacity-0 group-hover:opacity-100 text-[#475569] hover:text-red-400 transition-all ml-auto shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* OPTIONAL ACCENT ZONES — toggleable extras */}
                {optionalSections.length > 0 && sections.length > 0 && (
                  <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#1E3A8A]/50 text-[#60A5FA]/70 rounded flex items-center justify-center text-xs font-bold">+</div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#64748B]">Accent Zones</h2>
                        <p className="text-[10px] text-[#475569]">Optional — click to add</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {optionalSections.map((opt) => {
                        const alreadyAdded = sections.some(s => s.name.toLowerCase() === opt.name.toLowerCase());
                        return (
                          <button
                            key={opt.name}
                            disabled={alreadyAdded}
                            onClick={async () => {
                              const newSection: Section = {
                                id: `opt-${Date.now()}-${opt.name}`,
                                name: opt.name,
                                maskData: null,
                                selectedLine: SIDING_OPTIONS[1],
                                selectedColor: SIDING_OPTIONS[1].colors[0],
                                maskTarget: opt.maskTarget,
                              };
                              setSections(prev => [...prev, newSection]);
                              setOptionalSections(prev => prev.filter(o => o.name !== opt.name));
                              // Auto-generate mask for this new section
                              try {
                                const maskImageBase64 = await downscaleImage(selectedImage!, 1024);
                                const maskRes = await fetch('/api/auto-mask', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ imageBase64: maskImageBase64, mimeType: 'image/jpeg', maskTarget: opt.maskTarget }),
                                });
                                const maskData = await maskRes.json();
                                if (maskData.maskBase64) {
                                  const sectionIdx = sections.length;
                                  const colorRGBA = SECTION_COLORS[sectionIdx % SECTION_COLORS.length];
                                  const tinted = await tintMask(maskData.maskBase64, colorRGBA);
                                  setSections(prev => prev.map(s => s.id === newSection.id ? { ...s, maskData: tinted } : s));
                                }
                              } catch (e) {
                                console.warn(`[optional-zone] mask gen failed for ${opt.name}:`, e);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                              alreadyAdded
                                ? 'bg-[#1E293B] border-[#334155] text-[#475569] cursor-not-allowed opacity-50'
                                : 'bg-[#0A0E17] border-[#334155] text-[#94A3B8] hover:border-[#3B82F6] hover:text-[#60A5FA] hover:bg-[#1E293B]'
                            }`}
                          >
                            + {opt.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 02 MATERIAL CONFIGURATION */}
                <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 bg-[#1E3A8A] text-[#60A5FA] rounded flex items-center justify-center text-xs font-bold">02</div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">Material Configuration</h2>
                  </div>
                  <div className="space-y-4">
                    {(() => {
                      // Detect if current section is a shutter or trim accent zone
                      const sectionNameLower = currentSection?.name?.toLowerCase() || '';
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
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                {accentColors.map(color => (
                                  <button key={color.id} onClick={() => { saveStateToHistory(); setSelectedColor(color); setSections(prev => prev.map(s => s.id === currentSectionId ? { ...s, selectedColor: color } : s)); }}
                                    className={`group relative flex items-stretch rounded-lg overflow-hidden transition-all text-left ${selectedColor.id === color.id ? 'ring-2 ring-[#3B82F6] bg-[#1E293B]' : 'ring-1 ring-white/5 bg-[#0A0E17] hover:ring-white/20 hover:bg-[#111827]'}`}>
                                    <div className="w-7 shrink-0" style={{ backgroundColor: color.hex }} />
                                    <div className="px-2 py-1.5 flex-1 min-w-0"><p className="text-[10px] font-semibold text-[#E2E8F0] leading-tight truncate">{color.name}</p><p className="text-[8px] text-[#64748B] italic mt-0.5 leading-tight truncate">{color.hue}</p></div>
                                    {selectedColor.id === color.id && (<div className="flex items-center pr-1.5"><div className="w-3 h-3 bg-[#3B82F6] rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div></div>)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Normal siding zone — show full tier/texture picker
                      return ALL_SIDING_OPTIONS.map((line) => {
                        const isSelectedLine = selectedLine.tier === line.tier;
                        return (
                          <div key={line.tier} className={`rounded-lg border transition-all overflow-hidden ${isSelectedLine ? 'border-[#3B82F6] bg-[#1E293B]' : 'border-[#334155] bg-[#0A0E17] hover:border-[#475569]'}`}>
                            <div className="cursor-pointer" onClick={() => { saveStateToHistory(); setSelectedLine(line); if (!isSelectedLine) { const firstColor = line.colors[0]; setSelectedColor(firstColor); setSections(prev => prev.map(s => s.id === currentSectionId ? { ...s, selectedLine: line, selectedColor: firstColor } : s)); } else { setSections(prev => prev.map(s => s.id === currentSectionId ? { ...s, selectedLine: line } : s)); }}}>
                              {/* Texture strip */}
                              <div className="relative h-10 overflow-hidden">
                                <img src={line.textureImage} alt={line.line} className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17]/80 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-between px-3">
                                  <div><span className={`text-[9px] font-bold uppercase tracking-widest ${isSelectedLine ? 'text-[#60A5FA]' : 'text-[#64748B]'}`}>{line.tier} Tier</span><h3 className="text-xs font-bold text-[#F8FAFC] leading-tight">{line.line}</h3></div>
                                  {isSelectedLine ? <Check className="w-3.5 h-3.5 text-[#3B82F6]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />}
                                </div>
                              </div>
                            </div>
                            {isSelectedLine && (
                              <div className="px-3 pb-3 pt-2 border-t border-[#334155]/50 bg-[#0F172A]/50">
                                {(() => {
                                  const zoneKey = `adv-${line.tier}`;
                                  const isExp = expandedColorZones.has(zoneKey);
                                  const selIdx = line.colors.findIndex(c => c.id === selectedColor.id);
                                  const visible = isExp ? line.colors : [
                                    ...line.colors.slice(0, 8),
                                    ...(selIdx >= 8 ? [line.colors[selIdx]] : [])
                                  ].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
                                  return (
                                    <>
                                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                                        {visible.map(color => (
                                          <button key={color.id} onClick={(e) => { e.stopPropagation(); saveStateToHistory(); setSelectedColor(color); setSections(prev => prev.map(s => s.id === currentSectionId ? { ...s, selectedColor: color } : s)); }}
                                            className={`group relative flex items-stretch rounded-lg overflow-hidden transition-all text-left ${selectedColor.id === color.id ? 'ring-2 ring-[#3B82F6] bg-[#1E293B]' : 'ring-1 ring-white/5 bg-[#0A0E17] hover:ring-white/20 hover:bg-[#111827]'}`}>
                                            <div className="w-7 shrink-0" style={{ backgroundColor: color.hex }} />
                                            <div className="px-2 py-1.5 flex-1 min-w-0"><p className="text-[10px] font-semibold text-[#E2E8F0] leading-tight truncate">{color.name}</p><p className="text-[8px] text-[#64748B] italic mt-0.5 leading-tight truncate">{color.hue}</p></div>
                                            {selectedColor.id === color.id && (<div className="flex items-center pr-1.5"><div className="w-3 h-3 bg-[#3B82F6] rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div></div>)}
                                          </button>
                                        ))}
                                      </div>
                                      {line.colors.length > 8 && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); toggleColorZone(zoneKey); }}
                                          className="w-full mt-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#60A5FA] hover:text-[#93C5FD] transition-colors text-center border border-[#1E293B] rounded-lg hover:border-[#334155] hover:bg-[#111827]"
                                        >
                                          {isExp ? '↑ Show fewer colors' : `↓ Show all ${line.colors.length} colors`}
                                        </button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                {/* Advanced Generate Button */}
                <div className="flex gap-2 mt-2">
                  {resultImage && (
                    <button 
                      onClick={() => setResultImage(null)} 
                      className="w-[120px] py-4 rounded-lg font-bold text-[#94A3B8] bg-[#1E293B] hover:bg-[#334155] hover:text-white transition-all text-[10px] tracking-widest uppercase border border-[#334155] flex flex-col items-center justify-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Masks
                    </button>
                  )}
                  <button disabled={isProcessing} onClick={generateSiding}
                    className={`flex-1 py-4 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs ${isProcessing ? 'bg-[#1E293B] text-[#64748B] cursor-not-allowed border border-[#334155]' : resultImage ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.98] border border-[#60A5FA]/30 shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse' : 'bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-[#60A5FA]/30'}`}>
                    {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : resultImage ? <><Sparkles className="w-4 h-4" /> Re-Generate</> : <><Sparkles className="w-4 h-4" /> Initialize Render</>}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-[#7F1D1D]/20 border border-[#DC2626] rounded-lg">
                <p className="text-[#FCA5A5] text-[10px] font-bold uppercase text-center">{error}</p>
              </div>
            )}
          </div>


          {/* Right Column: Technical Preview */}
          <div className="lg:col-span-8 sticky top-4 self-start">
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-1 flex flex-col shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>
              {/* Toolbar */}
              <div className="bg-[#0F172A] border-b border-[#1E293B] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Engine Active</span>
                  </div>
                  <div className="h-4 w-[1px] bg-[#334155]" />
                  <span className="text-[10px] font-bold text-[#E2E8F0] uppercase tracking-widest">
                    {appMode === 'quick'
                      ? `Spec: ${quickZones.find(z => z.id === 'qz-main')?.selectedLine.line ?? 'Siding'} · ${quickZones.find(z => z.id === 'qz-main')?.selectedColor.name ?? ''}`
                      : `Spec: ${selectedLine.line} - ${selectedColor.name}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleUndo} 
                    disabled={past.length === 0}
                    className={`p-1.5 rounded transition-colors ${past.length === 0 ? 'text-[#334155] cursor-not-allowed' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]'}`}
                    title="Undo"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleRedo} 
                    disabled={future.length === 0}
                    className={`p-1.5 rounded transition-colors ${future.length === 0 ? 'text-[#334155] cursor-not-allowed' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]'}`}
                    title="Redo"
                  >
                    <Redo className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-[1px] bg-[#334155] mx-1" />
                  <button className="p-1.5 hover:bg-[#1E293B] rounded transition-colors"><Settings className="w-3.5 h-3.5 text-[#94A3B8]" /></button>
                </div>
              </div>

              <div className="flex-1 relative bg-[#0A0E17] flex items-center justify-center overflow-hidden">
                {/* Visualizer Content */}
                <AnimatePresence mode="wait">
                  {(appMode === 'quick' ? quickResult : resultImage) ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full p-4 flex flex-col gap-3"
                    >
                      {/* ── Before / After Compare Slider ── */}
                      <div
                        className="relative w-full flex-1 min-h-0 rounded-lg overflow-hidden border border-[#334155] shadow-2xl bg-[#0F172A] cursor-ew-resize select-none"
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const update = (cx: number) =>
                            setSliderPos(Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100)));
                          update(e.clientX);
                          const onMove = (ev: MouseEvent) => update(ev.clientX);
                          const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        }}
                        onTouchStart={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const update = (cx: number) =>
                            setSliderPos(Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100)));
                          update(e.touches[0].clientX);
                          const onMove = (ev: TouchEvent) => update(ev.touches[0].clientX);
                          const onEnd = () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
                          window.addEventListener('touchmove', onMove, { passive: true } as any);
                          window.addEventListener('touchend', onEnd);
                        }}
                      >
                        {/* BEFORE — original photo (base layer) */}
                        {selectedImage && (
                          <img
                            src={selectedImage}
                            alt="Before"
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            draggable={false}
                          />
                        )}

                        {/* AFTER — rendered result clipped from left to sliderPos */}
                        <img
                          src={appMode === 'quick' ? quickResult! : resultImage!}
                          alt="After"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                          draggable={false}
                        />

                        {/* Vertical divider line */}
                        <div
                          className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.7)] z-10 pointer-events-none"
                          style={{ left: `${sliderPos}%` }}
                        />

                        {/* Circular drag handle */}
                        <div
                          className="absolute top-1/2 z-20 pointer-events-none"
                          style={{ left: `${sliderPos}%`, transform: "translate(-50%, -50%)" }}
                        >
                          <div className="w-10 h-10 rounded-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex items-center justify-center ring-2 ring-black/10">
                            <ArrowLeftRight className="w-4 h-4 text-[#0F172A]" />
                          </div>
                        </div>

                        {/* BEFORE label */}
                        <div className="absolute top-4 left-4 bg-[#0F172A]/85 backdrop-blur-md text-[#94A3B8] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow-lg border border-[#334155] pointer-events-none z-10">
                          BEFORE
                        </div>

                        {/* AFTER label */}
                        <div className="absolute top-4 right-4 bg-[#0EA5E9]/85 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow-lg border border-white/20 pointer-events-none z-10">
                          AFTER
                        </div>

                        {/* Drag hint — only shown when slider is at default center */}
                        {sliderPos === 100 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0F172A]/80 backdrop-blur-md text-[#94A3B8] text-[9px] font-medium px-4 py-2 rounded-full border border-[#334155] pointer-events-none z-10 whitespace-nowrap">
                            ← Drag to compare &nbsp;|&nbsp; Before ↔ After
                          </div>
                        )}

                        {/* Corner vignette */}
                        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.35)" }} />
                      </div>

                      {/* ── Post-render CTA ── */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                        className="w-full shrink-0"
                      >
                        <button
                          onClick={() => { setQuoteApiError(null); setQuoteSuccess(false); setShowQuoteModal(true); }}
                          className="w-full py-3.5 rounded-xl font-bold text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#0EA5E9] to-[#3B82F6] hover:from-[#0284C7] hover:to-[#2563EB] active:scale-[0.98] shadow-[0_0_24px_rgba(14,165,233,0.45)] hover:shadow-[0_0_32px_rgba(14,165,233,0.6)] border border-[#38BDF8]/30 transition-all duration-200"
                        >
                          <Sparkles className="w-4 h-4" />
                          Request Free Quote &amp; Download
                        </button>
                      </motion.div>
                    </motion.div>
                  ) : (isProcessing || isQuickGenerating) ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full p-8 flex flex-col items-center justify-center gap-8"
                    >
                      {/* Animated ring */}
                      <div className="relative shrink-0">
                        <div className="w-24 h-24 border-2 border-[#1E3A8A] border-t-[#60A5FA] rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.25)]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center border border-[#1E293B] shadow-lg">
                            <Sparkles className="w-6 h-6 text-[#60A5FA]" />
                          </div>
                        </div>
                      </div>

                      <div className="w-full max-w-sm text-center space-y-4">
                        {/* Title */}
                        <p className="font-bold text-sm uppercase tracking-[0.3em] text-[#60A5FA]">
                          {isQuickGenerating ? 'Rendering Visualization' : 'Processing Geometry'}
                        </p>

                        {/* Status message — rotates every 6s */}
                        <p className="text-[#94A3B8] text-[11px] font-medium tracking-wide transition-all duration-500">
                          {[
                            `Analyzing architectural geometry…`,
                            `Mapping siding textures to surfaces…`,
                            `Calibrating ${isQuickGenerating
                              ? (quickZones.find(z => z.id === 'qz-main')?.selectedColor.name ?? 'color')
                              : selectedColor.name} pigment values…`,
                            `Applying lighting & shadow model…`,
                            `Rendering photorealistic output…`,
                            `Finalizing material details…`,
                          ][Math.floor(elapsedSecs / 6) % 6]}
                        </p>

                        {/* Progress bar — physics-based: fast start, asymptotic near 100% */}
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#475569]">Progress</span>
                            <span className="text-[9px] font-bold text-[#64748B] tabular-nums">{String(Math.floor(elapsedSecs / 60)).padStart(2,'0')}:{String(elapsedSecs % 60).padStart(2,'0')}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden border border-[#334155]/50">
                            <div
                              className="h-full bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out"
                              style={{
                                // Asymptotic: fast to 85%, then crawls — never hits 100% until done
                                width: `${Math.min(96, 100 * (1 - Math.exp(-elapsedSecs / 38)))}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Spec hint */}
                        <p className="text-[#334155] text-[9px] uppercase tracking-widest font-bold">
                          {isQuickGenerating
                            ? (() => { const qm = quickZones.find(z => z.id === 'qz-main'); return qm ? `${qm.selectedLine.line} · ${qm.selectedColor.name}` : ''; })()
                            : `${selectedLine.line} — ${selectedColor.name}`
                          }
                        </p>
                      </div>
                    </motion.div>
                  ) : appMode === 'quick' && selectedImage ? (
                    <motion.div
                      key="quick-preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full p-4"
                    >
                      <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#334155] shadow-xl bg-[#0F172A]">
                        <img
                          src={selectedImage}
                          alt="Source"
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                        {/* Hover color preview chip — replaces misleading full-image tint */}
                        {swatchPreviewHex ? (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
                            <div
                              className="w-20 h-12 rounded-lg shadow-2xl border border-white/20"
                              style={{ backgroundColor: swatchPreviewHex }}
                            />
                            <div className="flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-full px-3 py-1.5 shadow-xl">
                              <div className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: swatchPreviewHex }} />
                              <span className="text-[10px] font-bold text-[#E2E8F0] uppercase tracking-wider whitespace-nowrap">
                                {swatchPreviewName} &nbsp;<span className="text-[#475569] font-normal normal-case tracking-normal">{swatchPreviewHex.toUpperCase()}</span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0F172A]/80 backdrop-blur-md border border-[#334155] rounded-full px-3 py-1.5 pointer-events-none">
                            <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Hover a color to preview · Click Generate to render</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : selectedImage ? (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full p-4 flex flex-col relative"
                    >

              {/* Navigation Bar and Section Chips now live INSIDE canvas container below */}

              <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-full px-3 py-1.5 shadow-xl z-20">
                <button 
                  onClick={() => setZoom(Math.max(1, zoom - 0.25))} 
                  className="p-1.5 rounded-full transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold text-[#E2E8F0] tracking-wider w-10 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <button 
                  onClick={() => setZoom(Math.min(5, zoom + 0.25))} 
                  className="p-1.5 rounded-full transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="h-4 w-[1px] bg-[#334155] mx-1" />
                <button 
                  onClick={() => { setIsPanMode(!isPanMode); if (isPanMode) setIsDraggingPan(false); }}
                  className={`p-1.5 rounded-full transition-colors ${isPanMode ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`}
                  title="Pan Mode (Hold Spacebar)"
                >
                  <Hand className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setZoom(1); setPan({x:0, y:0}); }}
                  className="p-1.5 rounded-full transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
                  title="Fit to Screen (Reset View)"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>





                      <div className="w-full h-full relative rounded-lg overflow-hidden border border-[#334155] shadow-xl bg-[#0F172A] flex items-center justify-center mt-4">
                        <div 
                          className="relative inline-block max-w-full max-h-full transition-transform duration-75"
                          style={{
                            aspectRatio: imageDimensions.width / imageDimensions.height,
                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                            transformOrigin: 'center',
                          }}
                        >
                          <img 
                            src={selectedImage} 
                            alt="Workspace" 
                            className="max-w-full max-h-full object-contain block pointer-events-none" 
                          />

                          {/* Live Color Swatch Preview — floating chip, no full-image tint */}
                          {appMode === 'quick' && swatchPreviewHex && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-10">
                              <div
                                className="w-20 h-12 rounded-lg shadow-2xl border border-white/20"
                                style={{ backgroundColor: swatchPreviewHex }}
                              />
                              <div className="flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-full px-3 py-1.5 shadow-xl">
                                <div className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: swatchPreviewHex }} />
                                <span className="text-[10px] font-bold text-[#E2E8F0] uppercase tracking-wider whitespace-nowrap">
                                  {swatchPreviewName} &nbsp;<span className="text-[#475569] font-normal normal-case tracking-normal">{swatchPreviewHex.toUpperCase()}</span>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* --- Section mask traces: faint persistent overlays for all detected zones --- */}
                          {sections.filter(s => s.maskData && s.id !== currentSectionId).map((section, idx) => {
                            const isHovered = hoveredSectionId === section.id;
                            return (
                              <img
                                key={`trace-${section.id}`}
                                src={section.maskData!}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-200"
                                style={{ opacity: isHovered ? 0.75 : 0.18, mixBlendMode: 'screen' }}
                              />
                            );
                          })}

                          {/* --- Active (current) section trace --- */}
                          {currentSection?.maskData && !hoveredSectionId && (
                            <img
                              src={currentSection.maskData}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                              style={{ opacity: 0.35, mixBlendMode: 'screen' }}
                            />
                          )}

                          {/* --- Hover highlight: bright pulse with zone label badge --- */}
                          {hoveredSectionId && (() => {
                            const hovered = sections.find(s => s.id === hoveredSectionId);
                            if (!hovered?.maskData) return null;
                            const idx = sections.findIndex(s => s.id === hoveredSectionId);
                            const [r, g, b] = SECTION_COLORS[idx % SECTION_COLORS.length];
                            return (
                              <>
                                <img
                                  src={hovered.maskData}
                                  alt=""
                                  aria-hidden="true"
                                  className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-pulse"
                                  style={{ opacity: 0.9, mixBlendMode: 'screen', filter: `drop-shadow(0 0 8px rgb(${r},${g},${b}))` }}
                                />
                                {/* Zone name badge */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                                  <div
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md shadow-xl border"
                                    style={{ backgroundColor: `rgba(${r},${g},${b},0.2)`, borderColor: `rgba(${r},${g},${b},0.6)` }}
                                  >
                                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: `rgb(${r},${g},${b})` }} />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-white">{hovered.name}</span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}


                           <canvas
                             ref={canvasRef}
                             width={imageDimensions.width}
                             height={imageDimensions.height}
                             className={`absolute inset-0 w-full h-full ${isPanMode ? (isDraggingPan ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                             style={{ touchAction: 'none', opacity: 0 }}
                             onMouseDown={(e) => { if (isPanMode) { setIsDraggingPan(true); panStartRef.current = { x: e.clientX, y: e.clientY, startPanX: pan.x, startPanY: pan.y }; } }}
                             onMouseMove={(e) => { if (isDraggingPan) { setPan({ x: panStartRef.current.startPanX + (e.clientX - panStartRef.current.x) / zoom, y: panStartRef.current.startPanY + (e.clientY - panStartRef.current.y) / zoom }); } }}
                             onMouseUp={() => { if (isDraggingPan) setIsDraggingPan(false); }}
                             onMouseLeave={() => { if (isDraggingPan) setIsDraggingPan(false); }}
                             onTouchStart={(e) => { if (isPanMode) { setIsDraggingPan(true); panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, startPanX: pan.x, startPanY: pan.y }; } }}
                             onTouchMove={(e) => { if (isDraggingPan) { setPan({ x: panStartRef.current.startPanX + (e.touches[0].clientX - panStartRef.current.x) / zoom, y: panStartRef.current.startPanY + (e.touches[0].clientY - panStartRef.current.y) / zoom }); } }}
                             onTouchEnd={() => { if (isDraggingPan) setIsDraggingPan(false); }}
                           />
                        </div>
                        
                        {isAutoMasking && (
                          <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="bg-[#1E293B] border border-[#3B82F6]/50 rounded-xl px-6 py-4 flex flex-col items-center gap-3 shadow-2xl">
                              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                              <p className="text-[#E2E8F0] font-medium text-sm">AI is defining sections...</p>
                            </div>
                          </div>
                        )}


                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center p-12"
                    >
                      <div className="w-24 h-24 bg-[#0F172A] rounded-2xl border border-[#1E293B] flex items-center justify-center mb-8 shadow-inner rotate-3">
                        <ImageIcon className="w-10 h-10 text-[#334155]" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-3 text-[#E2E8F0]">No Asset Detected</h4>
                      <p className="text-[#64748B] text-xs font-medium max-w-xs leading-relaxed mb-6">Please upload a site photograph in the 'Source Asset' panel to begin the visualization process.</p>
                      
                      <div className="flex flex-col gap-3 mt-2 border-t border-[#1E293B] pt-5 w-full">
                        <div className="flex items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">— Or test with a demo home —</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 w-full">
                          {[
                            { src: '/default-house.jpg',        label: 'Traditional Colonial', sub: 'Lap siding · 2-story' },
                            { src: '/demo-house-2.png',         label: 'Craftsman Bungalow',   sub: 'Mixed siding · dormers' },
                            { src: '/demo-brick-colonial.png',  label: 'Red Brick Colonial',   sub: 'Full brick · shutters' },
                            { src: '/demo-stone-craftsman.png', label: 'Stone & Shake',        sub: 'Mixed materials' },
                            { src: '/demo-stucco-med.png',      label: 'Stucco Mediterranean', sub: 'EIFS · arched details' },
                            { src: '/demo-victorian.png',       label: 'Victorian Complex',    sub: 'Multi-zone · ornate' },
                          ].map(({ src, label, sub }) => (
                            <button key={src} onClick={() => setSelectedImage(src)} className="group text-left focus:outline-none">
                              <div className="relative overflow-hidden rounded-lg border border-[#334155] group-hover:border-[#0EA5E9]/60 transition-all duration-200 shadow-lg">
                                <img src={src} alt={label} className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#060B18]/85 via-[#060B18]/20 to-transparent" />
                                <div className="absolute bottom-1.5 left-2 right-2">
                                  <p className="text-[9px] font-bold uppercase tracking-wider text-white leading-tight truncate">{label}</p>
                                  <p className="text-[8px] text-[#94A3B8] leading-tight truncate">{sub}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Bar */}
              <div className="bg-[#0F172A] border-t border-[#1E293B] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-widest">Resolution</span>
                    <span className="text-[10px] font-bold text-[#E2E8F0]">2048 x 2048 px</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-widest">Engine</span>
                    <span className="text-[10px] font-bold text-[#E2E8F0]">Blueprint Studio Pro</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-widest">System Status:</span>
                  <span className="text-[10px] font-bold text-[#10B981] uppercase">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Technical Specs Footer */}
      <footer className="bg-[#0F172A] border-t border-[#1E293B] text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#3B82F6] p-2 rounded-md">
                  <Layout className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-xl tracking-tight">BLUEPRINT<span className="text-[#3B82F6]">ENVISION</span></h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#475569] mt-0.5">Powered by Blueprint AI</p>
                </div>
              </div>
              <p className="text-[#94A3B8] text-sm leading-relaxed max-w-md">
                your installer Exteriors uses BlueprintEnvision — powered by Blueprint AI — to help homeowners see exactly how new siding, shutters, trim, and accents will look on their home before a single panel is installed.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] mb-6">Capabilities</h3>
              <ul className="space-y-3 text-sm text-[#94A3B8]">
                <li className="hover:text-[#E2E8F0] transition-colors cursor-pointer">Geometric Preservation</li>
                <li className="hover:text-[#E2E8F0] transition-colors cursor-pointer">Material Mapping</li>
                <li className="hover:text-[#E2E8F0] transition-colors cursor-pointer">Lighting Consistency</li>
                <li className="hover:text-[#E2E8F0] transition-colors cursor-pointer">Batch Processing</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] mb-6">Legal</h3>
              <ul className="space-y-3 text-[11px] text-[#64748B] leading-relaxed">
                <li><span className="text-[#475569] font-semibold block mb-0.5">Visualization Accuracy</span>Results are AI-generated approximations for inspiration only.</li>
                <li><span className="text-[#475569] font-semibold block mb-0.5">Trademarks</span>All product names and color identifiers are proprietary to BlueprintEnvision.</li>
                <li><span className="text-[#475569] font-semibold block mb-0.5">Image Privacy</span>Uploaded photos are processed by Google Gemini AI. Not stored beyond your session.</li>
              </ul>
            </div>
          </div>

          {/* Full legal disclaimer block */}
          <div className="border-t border-[#1E293B] mt-12 pt-8">
            <p className="text-[9px] text-[#374151] leading-relaxed max-w-5xl">
              <span className="text-[#475569] font-semibold">DISCLAIMER: </span>
              Visualizations produced by this tool are artificially generated approximations intended solely for illustrative purposes. Actual siding color, texture, profile, and appearance will vary based on product specification, installation conditions, ambient lighting, and other factors. These images do not constitute a warranty, guarantee, or binding representation of any product or outcome.
              {' '}Color availability varies by region and installer. Request physical product samples before making any purchasing decision.
              {' '}Photos uploaded to this tool are transmitted to Google LLC's Gemini AI service for processing and are not retained, stored, or shared by Blueprint AI or your installer Exteriors beyond the active visualization session.
            </p>
          </div>

          <div className="border-t border-[#1E293B] mt-8 pt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
              <p>© 2026 BLUEPRINTENVISION. POWERED BY <span className="text-[#3B82F6]">BLUEPRINT AI</span>.</p>
              <div className="flex gap-6">
                <span>v2.5.0-DARK</span>
                <span>US-WEST-1</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[9px] text-[#374151]">
              <span>By using this tool, you confirm you are 13 years of age or older and agree to the terms below.</span>
              <button onClick={() => setShowToS(true)} className="text-[#475569] hover:text-[#94A3B8] underline underline-offset-2 transition-colors">Terms of Use</button>
              <span className="text-[#1E293B]">|</span>
              <button onClick={() => setShowPrivacy(true)} className="text-[#475569] hover:text-[#94A3B8] underline underline-offset-2 transition-colors">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
      {/* Info Modal */}
      <AnimatePresence>
        {infoSectionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setInfoSectionId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-[#1E293B] flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Section Details</h3>
                <button onClick={() => setInfoSectionId(null)} className="text-[#94A3B8] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {(() => {
                  const section = sections.find(s => s.id === infoSectionId);
                  if (!section) return null;
                  return (
                    <>
                      <div>
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Mask Preview</span>
                        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-2 flex items-center justify-center h-24">
                          {section.maskData ? (
                            <img src={section.maskData} alt="Mask Preview" className="max-h-full max-w-full object-contain mix-blend-screen" />
                          ) : (
                            <span className="text-[#64748B] text-xs">No mask defined</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Name</span>
                        <span className="text-white font-medium">{section.name}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Target Area</span>
                        <span className="text-white font-medium">{section.maskTarget}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Selected Siding</span>
                        <span className="text-white font-medium">{section.selectedLine.line} — {section.selectedLine.tier} Tier</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Selected Color</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-5 h-5 rounded-full border border-[#334155] shrink-0" style={{ backgroundColor: section.selectedColor.hex }} />
                          <div>
                            <span className="text-white font-medium text-sm">{section.selectedColor.name}</span>
                            <p className="text-[#64748B] text-[10px] italic mt-0.5">{section.selectedColor.hue}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 mt-4 border-t border-[#1E293B]">
                        <button
                          onClick={() => {
                            switchSection(section.id);
                            setInfoSectionId(null);
                          }}
                          className="w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition-colors"
                        >
                          Edit Section
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* Quote Request Modal                                                  */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showQuoteModal && (
          <motion.div
            key="quote-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !quoteSubmitting) { setShowQuoteModal(false); } }}
          >
            <motion.div
              key="quote-modal-panel"
              initial={{ scale: 0.95, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '92vh' }}
            >
              {/* Modal Header */}
              <div className="bg-[#0A0E17] border-b border-[#1E293B] px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <div className="text-xs font-bold text-[#60A5FA] uppercase tracking-widest">your installer Exteriors</div>
                  <div className="text-base font-bold text-[#E2E8F0] mt-0.5">Request a Free Quote</div>
                </div>
                <button onClick={() => { if (!quoteSubmitting) setShowQuoteModal(false); }} className="p-2 rounded-full text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {quoteSuccess ? (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 px-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center mb-6"
                    >
                      <Check className="w-10 h-10 text-[#10B981]" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-[#E2E8F0] mb-3">Request Sent!</h3>
                    <p className="text-[#94A3B8] text-sm leading-relaxed mb-2">The your installer Exteriors team has your request and will reach out within <strong className="text-white">24 business hours</strong>.</p>
                    <p className="text-[#64748B] text-xs">Your visualization is downloading now…</p>
                  </motion.div>
                ) : (
                  <div className="px-6 py-5 space-y-5">
                    {/* Design Preview Card */}
                    {(() => {
                      const mainZ = quickZones.find(z => z.id === 'qz-main');
                      const shutZ = quickZones.find(z => z.id === 'qz-shutters');
                      const trimZ = quickZones.find(z => z.id === 'qz-trim');
                      return (
                        <div className="bg-[#1E293B]/60 border border-[#334155] rounded-xl p-4">
                          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3">Your Visualized Design</div>
                          {appMode === 'quick' && mainZ ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-white/10 shrink-0" style={{ background: mainZ.selectedColor.hex }} />
                                <div>
                                  <div className="text-sm font-bold text-[#E2E8F0]">{mainZ.selectedLine.line} — {mainZ.selectedColor.name}</div>
                                  <div className="text-[10px] text-[#64748B]">{mainZ.selectedColor.hue}</div>
                                </div>
                              </div>
                              {shutZ?.enabled && <div className="text-xs text-[#94A3B8] pl-11">Shutters: {shutZ.selectedColor.name}</div>}
                              {trimZ?.enabled && <div className="text-xs text-[#94A3B8] pl-11">Trim: {trimZ.selectedColor.name}</div>}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {sections.map(s => (
                                <div key={s.id} className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full border border-white/10 shrink-0" style={{ background: s.selectedColor.hex }} />
                                  <div className="text-xs text-[#E2E8F0]">{s.name} — {s.selectedLine.line} / {s.selectedColor.name}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Full Name */}
                      <div className="col-span-full">
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Full Name <span className="text-[#EF4444]">*</span></label>
                        <input type="text" placeholder="Jane Smith" value={quoteForm.name} onChange={e => setQuoteForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                      </div>
                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Email <span className="text-[#EF4444]">*</span></label>
                        <input type="email" placeholder="jane@email.com" value={quoteForm.email} onChange={e => setQuoteForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                      </div>
                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Phone <span className="text-[#EF4444]">*</span></label>
                        <input type="tel" placeholder="(555) 123-4567" value={quoteForm.phone} onChange={e => setQuoteForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                      </div>
                      {/* Street Address */}
                      <div className="col-span-full">
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Property Address <span className="text-[#EF4444]">*</span></label>
                        <input type="text" placeholder="123 Maple St, Anytown" value={quoteForm.address} onChange={e => setQuoteForm(f => ({ ...f, address: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                      </div>
                      {/* Zip Code */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Zip Code <span className="text-[#EF4444]">*</span></label>
                        <input type="text" placeholder="12345" maxLength={10} value={quoteForm.zipCode} onChange={e => setQuoteForm(f => ({ ...f, zipCode: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                      </div>
                      {/* Best Time */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Best Time to Contact</label>
                        <select value={quoteForm.contactTime} onChange={e => setQuoteForm(f => ({ ...f, contactTime: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] transition-colors">
                          {['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)', 'Anytime'].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      {/* Project Timeline */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Project Timeline</label>
                        <select value={quoteForm.projectTimeline} onChange={e => setQuoteForm(f => ({ ...f, projectTimeline: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] transition-colors">
                          {['ASAP', 'Within 1 Month', '1–3 Months', '3–6 Months', 'Just Exploring'].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      {/* How did you hear */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">How Did You Find Us?</label>
                        <select value={quoteForm.referralSource} onChange={e => setQuoteForm(f => ({ ...f, referralSource: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] transition-colors">
                          {['Google', 'Facebook / Instagram', 'Referral from a Friend', 'Nextdoor', 'Drive By / Sign', 'Repeat Customer', 'Other'].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      {/* Notes */}
                      <div className="col-span-full">
                        <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Additional Notes <span className="text-[#475569] font-normal normal-case">(optional)</span></label>
                        <textarea rows={3} placeholder="Any details about your project…" value={quoteForm.notes} onChange={e => setQuoteForm(f => ({ ...f, notes: e.target.value }))}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none" />
                      </div>
                    </div>

                    {quoteApiError && (
                      <div className="p-3 bg-[#7F1D1D]/20 border border-[#DC2626] rounded-lg">
                        <p className="text-[#FCA5A5] text-xs font-bold text-center">{quoteApiError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              {!quoteSuccess && (
                <div className="px-6 py-4 border-t border-[#1E293B] shrink-0">
                  <button
                    onClick={submitQuoteRequest}
                    disabled={quoteSubmitting}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                      quoteSubmitting
                        ? 'bg-[#1E293B] text-[#64748B] cursor-not-allowed'
                        : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.98]'
                    }`}
                  >
                    {quoteSubmitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending Request…</>
                      : <><Sparkles className="w-4 h-4" /> Send Request &amp; Download My Visualization</>}
                  </button>
                  <p className="text-[10px] text-[#475569] text-center mt-2">Your visualization download will start automatically. No payment required.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showToS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowToS(false)}
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
                  <p className="text-[10px] text-[#64748B] mt-0.5">BlueprintEnvision — Effective 2026</p>
                </div>
                <button onClick={() => setShowToS(false)} className="text-[#94A3B8] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 text-[11px] text-[#94A3B8] leading-relaxed">
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">1. Permitted Use</h4>
                  <p>This tool is provided solely for personal, non-commercial home improvement visualization purposes. You may not copy, reproduce, resell, or distribute outputs for commercial gain without written permission from Blueprint AI.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">2. No Warranty</h4>
                  <p>Visualizations are AI-generated approximations provided "as is" without any warranty of accuracy, completeness, or fitness for a particular purpose. No output constitutes a guarantee or binding representation of any product, price, or outcome.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">3. Trademarks</h4>
                  <p>All color values are representative approximations. Request physical samples before purchasing.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">4. Image & Privacy</h4>
                  <p>By uploading images, you confirm you own or have the right to use them for this purpose. Uploaded images are transmitted to Google LLC's Gemini AI service for processing. They are not stored, retained, or shared by Blueprint AI or the providing contractor beyond the active session.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">5. Age Requirement</h4>
                  <p>Use of this tool requires you to be at least 13 years of age. By using this tool, you represent that you meet this requirement.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">6. Limitation of Liability</h4>
                  <p>To the maximum extent permitted by law, Blueprint AI and the providing contractor shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this tool or reliance on any visualization output.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">7. Changes</h4>
                  <p>These terms may be updated at any time. Continued use of the tool constitutes acceptance of the current terms.</p>
                </section>
              </div>
              <div className="p-4 border-t border-[#1E293B] shrink-0">
                <button
                  onClick={() => setShowToS(false)}
                  className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowPrivacy(false)}
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
                  <p className="text-[10px] text-[#64748B] mt-0.5">BlueprintEnvision — Effective 2026</p>
                </div>
                <button onClick={() => setShowPrivacy(false)} className="text-[#475569] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar text-[11px] text-[#94A3B8] leading-relaxed space-y-4">
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">1. Information We Collect</h4>
                  <p>We collect information you provide directly, including your name, email address, phone number, project address, and photos of your home uploaded for visualization.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">2. How We Use It</h4>
                  <p>We use your contact information strictly to provide your requested quote, exterior visualization, and follow-up communication through the contracting partner providing this tool.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">3. AI Processing</h4>
                  <p>Uploaded home photos are securely transmitted to Google Gemini AI to generate the visual simulation. They are not stored permanently beyond your active session and are not used to train global AI models.</p>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider mb-1">4. Data Sharing</h4>
                  <p>Your information is shared with the specific contractor providing this tool. We do not sell your data to third parties.</p>
                </section>
              </div>
              <div className="p-4 border-t border-[#1E293B] shrink-0">
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
