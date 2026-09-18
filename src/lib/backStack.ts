import { useEffect, useId, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

type Layer = { id: string; close: () => void };

const stack: Layer[] = [];
let listening = false;

function webHistory(): History | null {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined') return null;
  return window.history;
}

function closeTop(): boolean {
  const top = stack.pop();
  if (!top) return false;
  top.close();
  return true;
}

function ensureListeners() {
  if (listening) return;
  listening = true;
  BackHandler.addEventListener('hardwareBackPress', () => closeTop());
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      closeTop();
    });
  }
}

/**
 * Registers a screen that system back / swipe-back should close
 * before the app exits. Last registered layer wins.
 */
export function useBackLayer(active: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  const id = useId();

  useEffect(() => {
    ensureListeners();
    if (!active) return;
    const layer: Layer = { id, close: () => closeRef.current() };
    stack.push(layer);
    webHistory()?.pushState({ foco: id }, '');
    return () => {
      const index = stack.lastIndexOf(layer);
      if (index >= 0) stack.splice(index, 1);
    };
  }, [active, id]);

  return {
    handleClose: () => {
      if (active && webHistory()) {
        window.history.back();
        return;
      }
      close();
    },
  };
}
