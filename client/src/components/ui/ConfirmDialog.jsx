import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  loading = false,
  requireReason = false,
  reasonLabel = 'Reason (optional)',
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontFamily: 'Outfit', fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        {description && <DialogContentText sx={{ mb: requireReason ? 2 : 0 }}>{description}</DialogContentText>}
        {requireReason && (
          <TextField
            autoFocus
            fullWidth
            label={reasonLabel}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          disabled={loading}
          onClick={() => onConfirm(requireReason ? reason.trim() : undefined)}
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
