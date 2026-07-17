import { useState, useCallback, useRef } from 'react';

interface Pan {
  x: number;
  y: number;
}

export function useZoomPan() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  
  const panStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(5, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(1, prev - 0.25));
  }, []);

  const startPan = useCallback((clientX: number, clientY: number) => {
    if (!isPanMode) return;
    setIsDraggingPan(true);
    panStartRef.current = { x: clientX, y: clientY, startPanX: pan.x, startPanY: pan.y };
  }, [isPanMode, pan]);

  const movePan = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingPan) return;
    setPan({
      x: panStartRef.current.startPanX + (clientX - panStartRef.current.x) / zoom,
      y: panStartRef.current.startPanY + (clientY - panStartRef.current.y) / zoom
    });
  }, [isDraggingPan, zoom]);

  const endPan = useCallback(() => {
    setIsDraggingPan(false);
  }, []);

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    isPanMode,
    setIsPanMode,
    isDraggingPan,
    resetView,
    handleZoomIn,
    handleZoomOut,
    startPan,
    movePan,
    endPan
  };
}
