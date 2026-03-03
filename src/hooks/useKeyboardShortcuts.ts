import { useEffect, useCallback } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  preventDefault?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { key: 'Escape', handler: () => closeModal() },
 *   { key: 's', ctrl: true, handler: () => save(), preventDefault: true },
 *   { key: 'k', ctrl: true, handler: () => openSearch(), preventDefault: true },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable;

    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      // Allow Escape in inputs, but block others
      if (isInput && shortcut.key !== 'Escape') continue;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        shortcut.handler();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook for Escape key to close modals/dialogs
 */
export function useEscapeKey(handler: () => void, enabled = true) {
  useKeyboardShortcuts(enabled ? [{ key: 'Escape', handler }] : []);
}

/**
 * Hook for Ctrl+S to save
 */
export function useSaveShortcut(handler: () => void, enabled = true) {
  useKeyboardShortcuts(enabled ? [{ key: 's', ctrl: true, handler }] : []);
}

export default useKeyboardShortcuts;
