import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T) {
  const [current, setCurrent] = useState<T>(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const saveState = useCallback(() => {
    setPast(prev => [...prev, current]);
    setFuture([]);
  }, [current]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, prev.length - 1));
    setFuture(prev => [current, ...prev]);
    setCurrent(previous);
    return previous;
  }, [past, current]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, current]);
    setCurrent(next);
    return next;
  }, [future, current]);

  return {
    state: current,
    setState: setCurrent,
    saveState,
    undo,
    redo,
    past,
    future,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
}
