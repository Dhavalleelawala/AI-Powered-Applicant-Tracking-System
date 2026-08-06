import { useEffect } from 'react';

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

/**
 * Pipeline / ranking hotkeys when a candidate card is focused.
 * A = advance · R = reject · Enter/Space = open drawer · ? = toggle help (caller)
 */
export function useHiringHotkeys({
  enabled = true,
  drawerOpen = false,
  onAdvance,
  onReject,
  onOpen,
  onCloseDrawer,
  onToggleHelp,
}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (event) => {
      if (isTypingTarget(event.target)) return;

      if (drawerOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          onCloseDrawer?.();
        }
        return;
      }

      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        onToggleHelp?.();
        return;
      }

      const card = event.target instanceof HTMLElement ? event.target.closest('[data-hiring-card]') : null;
      if (!card) return;

      const id = card.getAttribute('data-application-id');
      const stage = card.getAttribute('data-stage') || '';
      const next = card.getAttribute('data-next-stage') || '';
      if (!id) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen?.(id);
        return;
      }
      if ((event.key === 'a' || event.key === 'A') && next) {
        event.preventDefault();
        onAdvance?.(id, next, stage);
        return;
      }
      if ((event.key === 'r' || event.key === 'R') && stage !== 'rejected') {
        event.preventDefault();
        onReject?.(id, stage);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, drawerOpen, onAdvance, onReject, onOpen, onCloseDrawer, onToggleHelp]);
}
