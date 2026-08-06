import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
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
  reasonPresets = [],
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
          <Stack spacing={1.25}>
            {reasonPresets.length > 0 && (
              <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
                {reasonPresets.map((preset) => (
                  <Chip
                    key={preset}
                    size="small"
                    label={preset}
                    color={reason === preset ? 'secondary' : 'default'}
                    variant={reason === preset ? 'filled' : 'outlined'}
                    onClick={() => setReason(preset)}
                    clickable
                  />
                ))}
              </Stack>
            )}
            <TextField
              autoFocus={!reasonPresets.length}
              fullWidth
              label={reasonLabel}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={2}
              placeholder={reasonPresets.length ? 'Or write a custom reason…' : undefined}
            />
          </Stack>
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
