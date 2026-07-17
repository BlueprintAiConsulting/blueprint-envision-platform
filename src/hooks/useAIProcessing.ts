import { useState, useRef, useCallback } from 'react';
import { Section, SidingLine, SidingColor, QuickZone, QuickRoofZone } from '../types';
import { API_BASE } from '../utils/apiConfig';

export function useAIProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQuickGenerating, setIsQuickGenerating] = useState(false);
  const [isDetectingSections, setIsDetectingSections] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateAbortRef = useRef<AbortController | null>(null);

  const friendlyError = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('preflight_failure')) return 'This image doesn\'t appear to be a house. Please upload a clear exterior photo of your home.';
    if (lower.includes('quota')) return 'Our servers are under heavy load right now. Please try again in a few minutes.';
    if (lower.includes('safety')) return 'This image couldn\'t be processed. Please try a different photo.';
    if (lower.includes('not responding') || lower.includes('failed to fetch') || lower.includes('network')) return 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.';
    if (lower.includes('timeout') || lower.includes('aborted')) return 'The visualization is taking longer than expected. Please try again — sometimes a second attempt works.';
    return msg;
  };

  const handleQuickGenerate = async (selectedImage: string, zones: any[]) => {
    setIsQuickGenerating(true);
    setError(null);
    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      const res = await fetch(`${API_BASE}/api/quick-render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType, zones }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quick render failed.');
      return data.resultImage;
    } catch (err: any) {
      setError(friendlyError(err.message));
      return null;
    } finally {
      setIsQuickGenerating(false);
    }
  };

  const handleRoofQuickGenerate = async (selectedImage: string, zones: any[]) => {
      setIsQuickGenerating(true);
      setError(null);
      try {
        const base64Data = selectedImage.split(',')[1];
        const mimeType = selectedImage.split(';')[0].split(':')[1];
        const res = await fetch(`${API_BASE}/api/roof-quick-render`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data, mimeType, zones }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Roof quick render failed.');
        return data.resultImage;
      } catch (err: any) {
        setError(friendlyError(err.message));
        return null;
      } finally {
        setIsQuickGenerating(false);
      }
    };

  return {
    isProcessing,
    setIsProcessing,
    isQuickGenerating,
    setIsQuickGenerating,
    isDetectingSections,
    setIsDetectingSections,
    detectionProgress,
    setDetectionProgress,
    error,
    setError,
    handleQuickGenerate,
    handleRoofQuickGenerate
  };
}
