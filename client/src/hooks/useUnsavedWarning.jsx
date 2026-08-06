import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

/** Warn on browser refresh/close when `when` is true. */
export function useBeforeUnloadWarning(when) {
  useEffect(() => {
    if (!when) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);
}

/** Confirm before leaving a dirty form via an in-app action (e.g. Cancel). */
export function useLeaveConfirm() {
  const [pending, setPending] = useState(null);

  const requestLeave = (action) => {
    setPending(() => action);
  };

  const dialog = (
    <ConfirmDialog
      open={Boolean(pending)}
      title="Discard unsaved changes?"
      description="You have edits that haven’t been saved. Leave this page anyway?"
      confirmLabel="Leave page"
      cancelLabel="Keep editing"
      confirmColor="error"
      onClose={() => setPending(null)}
      onConfirm={() => {
        const action = pending;
        setPending(null);
        action?.();
      }}
    />
  );

  return { requestLeave, dialog };
}
