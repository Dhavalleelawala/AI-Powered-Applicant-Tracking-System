import { Alert, Box, Button, Chip, Container, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function Page({ children, maxWidth = 'lg', narrow = false, className = 'page-enter' }) {
  return (
    <Container maxWidth={narrow ? 'sm' : maxWidth} className={className} sx={{ py: { xs: 4.5, md: 6.5 } }}>
      {children}
    </Container>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ md: 'flex-end' }}
      gap={2.5}
      mb={{ xs: 3.5, md: 4.5 }}
    >
      <Box sx={{ maxWidth: 720 }}>
        {eyebrow && (
          <Typography
            sx={{
              color: 'secondary.main',
              fontFamily: 'Outfit',
              fontWeight: 700,
              letterSpacing: '0.14em',
              fontSize: 11,
              mb: 1.25,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h2" sx={{ maxWidth: 720 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" mt={1.5} sx={{ maxWidth: 540, lineHeight: 1.65, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ pb: { md: 0.5 } }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export function EmptyState({ title, text, actionLabel, actionTo, onAction }) {
  return (
    <Box className="rf-feedback rf-feedback--empty">
      <Typography variant="h3" fontSize={{ xs: 24, md: 30 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" mt={1.25} mx="auto" maxWidth={420} sx={{ lineHeight: 1.65 }}>
        {text}
      </Typography>
      {actionLabel && (actionTo || onAction) && (
        <Button
          component={actionTo ? Link : 'button'}
          to={actionTo}
          onClick={onAction}
          variant="contained"
          color="secondary"
          sx={{ mt: 3.5 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

export function LoadingRows({ count = 3, height = 96 }) {
  return (
    <Stack spacing={1.75} className="rf-feedback rf-feedback--loading" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={height} sx={{ borderRadius: 2.5 }} />
      ))}
    </Stack>
  );
}

/** Compact page-level skeleton for detail screens. */
export function PageSkeleton({ lines = 3 }) {
  return (
    <Stack spacing={1.5} className="rf-feedback rf-feedback--loading" aria-busy="true" aria-label="Loading">
      <Skeleton height={36} width="32%" />
      <Skeleton height={56} width="70%" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} height={index === lines - 1 ? 200 : 72} />
      ))}
    </Stack>
  );
}

export function ErrorState({ error, onRetry, title = 'Something went wrong', sx }) {
  return (
    <Alert
      className="rf-feedback rf-feedback--error"
      severity="error"
      sx={{ borderRadius: 2, ...sx }}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : null
      }
    >
      <Typography component="span" fontWeight={700} display="block" sx={{ mb: 0.35 }}>
        {title}
      </Typography>
      {String(error || 'Please try again in a moment.')}
    </Alert>
  );
}

export function SuccessBanner({ children, sx, onClose }) {
  return (
    <Alert className="rf-feedback rf-feedback--success" severity="success" sx={{ borderRadius: 2, mb: 2.5, ...sx }} onClose={onClose}>
      {children}
    </Alert>
  );
}

export function InfoBanner({ children, sx, action }) {
  return (
    <Alert className="rf-feedback rf-feedback--info" severity="info" sx={{ borderRadius: 2, mb: 2, ...sx }} action={action}>
      {children}
    </Alert>
  );
}

export function WarningBanner({ children, sx, action }) {
  return (
    <Alert className="rf-feedback rf-feedback--warning" severity="warning" sx={{ borderRadius: 2, mb: 2, ...sx }} action={action}>
      {children}
    </Alert>
  );
}

/**
 * Standard query render path: error → loading → empty → content.
 * Keeps pages from inventing one-off Alert/Skeleton stacks.
 */
export function QueryState({ isLoading, error, onRetry, isEmpty, empty, loading, children, errorTitle }) {
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} title={errorTitle} />;
  }
  if (isLoading) {
    return loading || <LoadingRows />;
  }
  if (isEmpty) {
    return empty || null;
  }
  return children;
}

export function StageChip({ stage }) {
  const color =
    ({ interview: 'warning', offered: 'success', rejected: 'error', applied: 'info' })[stage] || 'default';
  return <Chip label={stage || 'applied'} size="small" color={color} sx={{ textTransform: 'capitalize' }} />;
}

export function StatTile({ label, value, hint }) {
  return (
    <Paper className="stat-accent" sx={{ p: 2.75, height: '100%', bgcolor: 'rgba(255,255,255,0.92)', pl: 3 }}>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="h2" fontSize={{ xs: 34, md: 42 }} mt={0.75} sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

export function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ display: 'block', mb: 1.75, letterSpacing: '0.14em', fontSize: 11 }}
    >
      {children}
    </Typography>
  );
}

export function FunnelBars({ funnel = {} }) {
  const stages = [
    { key: 'applied', label: 'Applied', color: '#3E6B8A' },
    { key: 'interview', label: 'Interview', color: '#D97706' },
    { key: 'offered', label: 'Offered', color: '#0F8A5F' },
    { key: 'rejected', label: 'Rejected', color: '#D64545' },
  ];
  const max = Math.max(1, ...stages.map((s) => Number(funnel[s.key]) || 0));

  return (
    <Stack spacing={2}>
      {stages.map((stage) => {
        const count = Number(funnel[stage.key]) || 0;
        const width = `${Math.round((count / max) * 100)}%`;
        return (
          <Box key={stage.key}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                {stage.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {count}
              </Typography>
            </Stack>
            <Box className="funnel-track">
              <Box className="funnel-fill" sx={{ width, background: stage.color }} />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
