import { ArrowOutward, CheckCircleOutline, RadioButtonUnchecked } from '@mui/icons-material';
import { Alert, Box, Button, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../api/client';
import { Page, PageHeader } from '../../components/ui/Primitives';
import { useAuth } from '../../context/AuthContext';
import { applicantReadiness } from '../../utils/applicantCompleteness';

function ChecklistCard({ title, checklist, actionLabel, actionTo }) {
  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, height: '100%', bgcolor: 'rgba(255,255,255,0.96)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} gap={1}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="body2" fontWeight={700} color="secondary.main">
          {checklist.percent}%
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" color="secondary" value={checklist.percent} sx={{ mb: 2 }} />
      <List dense disablePadding>
        {checklist.items.map((item) => (
          <ListItem key={item.id} disableGutters sx={{ py: 0.4 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              {item.done ? (
                <CheckCircleOutline color="success" fontSize="small" />
              ) : (
                <RadioButtonUnchecked color={item.required ? 'warning' : 'disabled'} fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.required ? 'Required' : 'Optional'}
              primaryTypographyProps={{ fontWeight: item.done ? 500 : 700, fontSize: 14 }}
              secondaryTypographyProps={{ fontSize: 11 }}
            />
          </ListItem>
        ))}
      </List>
      <Button component={Link} to={actionTo} variant="outlined" sx={{ mt: 2 }} endIcon={<ArrowOutward />}>
        {actionLabel}
      </Button>
    </Paper>
  );
}

export function ApplicantHomePage() {
  const { user } = useAuth();
  const readiness = applicantReadiness(user);
  const { data: apps } = useQuery({
    queryKey: ['applicant-applications'],
    queryFn: () => applicationsApi.mine().then((r) => r.data || []),
  });
  const appCount = (apps || []).length;

  return (
    <Page>
      <PageHeader
        eyebrow="APPLICANT HOME"
        title={`Welcome back, ${(user?.name || 'there').split(' ')[0]}.`}
        subtitle="Complete your profile and resume, then apply with confidence."
        actions={
          <Button component={Link} to="/jobs" variant="contained" color="secondary" endIcon={<ArrowOutward />}>
            Browse roles
          </Button>
        }
      />

      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3, bgcolor: 'rgba(255,255,255,0.96)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              Overall readiness
            </Typography>
            <Typography variant="h2" mt={0.5}>
              {readiness.percent}%
            </Typography>
            <LinearProgress variant="determinate" color="secondary" value={readiness.percent} sx={{ mt: 1.5, maxWidth: 420 }} />
            <Typography variant="body2" color="text.secondary" mt={1.25}>
              {readiness.readyToApply
                ? 'You’re ready to apply — profile and resume required details are complete.'
                : 'Finish the required items below before recruiters review your applications.'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Button component={Link} to="/applicant/profile" variant="outlined">
              Edit profile
            </Button>
            <Button component={Link} to="/applicant/resume" variant="outlined">
              Edit resume
            </Button>
            <Button component={Link} to="/applicant/applications" variant="outlined">
              Applications ({appCount})
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {!readiness.readyToApply && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Missing required details:{' '}
          {[...readiness.profile.missingRequired, ...readiness.resume.missingRequired]
            .map((item) => item.label)
            .join(', ') || 'Complete profile and resume.'}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="stretch">
        <Box sx={{ flex: 1 }}>
          <ChecklistCard
            title="Profile details"
            checklist={readiness.profile}
            actionLabel="Complete profile"
            actionTo="/applicant/profile"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ChecklistCard
            title="Resume details"
            checklist={readiness.resume}
            actionLabel="Complete resume"
            actionTo="/applicant/resume"
          />
        </Box>
      </Stack>
    </Page>
  );
}
