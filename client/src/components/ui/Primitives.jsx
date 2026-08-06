import { Box, Button, Chip, Container, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function Page({ children, maxWidth = 'lg', narrow = false, className = 'page-enter' }) {
  return (
    <Container maxWidth={narrow ? 'sm' : maxWidth} className={className} sx={{ py: { xs: 5, md: 7 } }}>
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
      mb={4}
    >
      <Box sx={{ maxWidth: 720 }}>
        {eyebrow && (
          <Typography
            sx={{
              color: 'secondary.main',
              fontFamily: 'Syne',
              fontWeight: 800,
              letterSpacing: '0.1em',
              fontSize: 12,
              mb: 1,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h2" fontSize={{ xs: 36, md: 52 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" mt={1.25} sx={{ maxWidth: 560, lineHeight: 1.6 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export function EmptyState({ title, text, actionLabel, actionTo }) {
  return (
    <Paper
      sx={{
        p: { xs: 4, md: 6 },
        textAlign: 'center',
        borderStyle: 'dashed',
        bgcolor: 'rgba(255,255,255,0.7)',
      }}
    >
      <Typography variant="h3" fontSize={28}>
        {title}
      </Typography>
      <Typography color="text.secondary" mt={1} mx="auto" maxWidth={420}>
        {text}
      </Typography>
      {actionLabel && actionTo && (
        <Button component={Link} to={actionTo} variant="contained" color="secondary" sx={{ mt: 3 }}>
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}

export function LoadingRows({ count = 3, height = 88 }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={height} sx={{ borderRadius: 2 }} />
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
    <Paper sx={{ p: 2.75, height: '100%', bgcolor: 'rgba(255,255,255,0.85)' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h2" fontSize={{ xs: 36, md: 44 }} mt={0.5} sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
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
      sx={{ display: 'block', mb: 1.5, letterSpacing: '0.14em' }}
    >
      {children}
    </Typography>
  );
}
