import { Box, Button, Chip, Container, Paper, Skeleton, Stack, Typography } from '@mui/material';
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
              fontFamily: 'Syne',
              fontWeight: 800,
              letterSpacing: '0.12em',
              fontSize: 11,
              mb: 1.25,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h2" fontSize={{ xs: 34, md: 48 }} sx={{ letterSpacing: '-0.04em' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" mt={1.5} sx={{ maxWidth: 540, lineHeight: 1.65, fontSize: { md: 17 } }}>
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
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        px: 2,
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.45)',
      }}
    >
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
    <Stack spacing={1.75}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={height} sx={{ borderRadius: 2.5 }} />
      ))}
    </Stack>
  );
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
    { key: 'applied', label: 'Applied', color: '#3A6B8C' },
    { key: 'interview', label: 'Interview', color: '#C47B2D' },
    { key: 'offered', label: 'Offered', color: '#2F7D57' },
    { key: 'rejected', label: 'Rejected', color: '#B84335' },
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
