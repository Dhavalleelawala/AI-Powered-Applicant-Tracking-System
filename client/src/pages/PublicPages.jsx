import { ArrowOutward, Bookmark, BookmarkBorder, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDeferredValue, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi, jobsApi, applicationsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState, Page, PageHeader } from '../components/ui/Primitives';
import { useUrlFilters } from '../hooks/useUrlFilters';

export function LandingPage() {
  return (
    <>
      <Box
        sx={{
          minHeight: 'calc(100vh - 68px)',
          bgcolor: 'primary.main',
          color: '#F7F8FB',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 75% 55% at 82% 18%, rgba(255,92,53,0.28), transparent 58%), radial-gradient(ellipse 45% 40% at 8% 88%, rgba(62,107,138,0.18), transparent 55%)',
          }}
        />
        <Box
          className="hero-orb"
          sx={{
            position: 'absolute',
            width: { xs: 300, md: 560 },
            height: { xs: 300, md: 560 },
            borderRadius: '50%',
            border: '1px solid rgba(255,92,53,.28)',
            right: { xs: '-28%', md: '-8%' },
            top: { xs: '-16%', md: '-20%' },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.35,
            backgroundImage:
              'linear-gradient(rgba(247,248,251,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(247,248,251,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 10, md: 8 } }}>
          <Typography
            className="reveal"
            sx={{ color: 'secondary.main', fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '.14em', fontSize: 13 }}
          >
            ROLEFIT
          </Typography>
          <Typography className="reveal" variant="h1" sx={{ maxWidth: 860, mt: 2.25 }}>
            Hiring clarity,
            <br />
            at human speed.
          </Typography>
          <Typography
            className="reveal-delay"
            sx={{ maxWidth: 460, fontSize: { xs: '1.05rem', md: '1.2rem' }, lineHeight: 1.7, mt: 3.5, color: '#B8C0CC' }}
          >
            Semantic ranking meets a focused pipeline, so every candidate gets the attention they deserve.
          </Typography>
          <Stack className="reveal-late" direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={4.5} alignItems={{ sm: 'center' }}>
            <Button variant="contained" color="secondary" component={Link} to="/register/recruiter" endIcon={<ArrowOutward />} size="large">
              Start hiring
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/jobs"
              size="large"
              sx={{ color: '#F7F8FB', borderColor: '#5A6578', '&:hover': { borderColor: '#F7F8FB', bgcolor: 'rgba(247,248,251,0.06)' } }}
            >
              Explore open roles
            </Button>
          </Stack>
          <Typography className="reveal-late" mt={2.5} variant="body2" sx={{ color: '#8B95A5' }}>
            Looking for work?{' '}
            <Box component={Link} to="/register/applicant" sx={{ color: '#FF8A6A', textDecoration: 'none', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
              Join as an applicant
            </Box>
          </Typography>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: { xs: 8, md: 11 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ color: 'secondary.main', fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '.12em', fontSize: 12, mb: 1.5 }}>
            HOW IT WORKS
          </Typography>
          <Typography variant="h2" maxWidth={640}>
            One clear path from role to decision.
          </Typography>
          <Grid container spacing={{ xs: 4, md: 6 }} mt={1}>
            {[
              ['Post with intent', 'Describe the role once. Rolefit keeps skills, urgency, and openings in one place.'],
              ['Rank with evidence', 'AI scores each resume against the job — or a sharp heuristic when no key is set.'],
              ['Move the pipeline', 'Kanban stages, notes, and bulk actions keep hiring conversations moving.'],
            ].map(([title, text], index) => (
              <Grid item xs={12} md={4} key={title}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.16em' }}>
                  0{index + 1}
                </Typography>
                <Typography variant="h3" mt={1.25}>
                  {title}
                </Typography>
                <Typography color="text.secondary" mt={1.25} sx={{ lineHeight: 1.7, maxWidth: 320 }}>
                  {text}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export function JobsPage() {
  const filterDefaults = useMemo(
    () => ({ q: '', location: '', department: '', employmentType: '' }),
    []
  );
  const { values, setFilter, clearFilters, activeCount } = useUrlFilters(filterDefaults);
  const deferredSearch = useDeferredValue(values.q);
  const params = useMemo(
    () => ({
      q: deferredSearch || undefined,
      location: values.location || undefined,
      department: values.department || undefined,
      employmentType: values.employmentType || undefined,
    }),
    [deferredSearch, values.location, values.department, values.employmentType]
  );
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.list(params).then((r) => r.data),
  });
  const jobs = data || [];

  return (
    <Page>
      <PageHeader
        eyebrow="OPEN ROLES"
        title="Find a role with room to grow."
        subtitle="Search by craft, place, or team — then apply in minutes."
      />
      <Paper className="filter-bar" sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }} component="form" onSubmit={(e) => e.preventDefault()}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            value={values.q}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Search by title or skill"
            fullWidth
            inputProps={{ 'aria-label': 'Search jobs' }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <TextField
            label="Location"
            value={values.location}
            onChange={(e) => setFilter('location', e.target.value)}
            sx={{ minWidth: { md: 160 } }}
          />
          <TextField
            label="Department"
            value={values.department}
            onChange={(e) => setFilter('department', e.target.value)}
            sx={{ minWidth: { md: 150 } }}
          />
          <TextField
            select
            label="Type"
            value={values.employmentType}
            onChange={(e) => setFilter('employmentType', e.target.value)}
            sx={{ minWidth: { md: 150 } }}
          >
            <MenuItem value="">All types</MenuItem>
            {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          {activeCount > 0 && (
            <Button onClick={clearFilters} sx={{ whiteSpace: 'nowrap' }}>
              Clear ({activeCount})
            </Button>
          )}
        </Stack>
      </Paper>
      {error ? (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>}>
          {String(error)}
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2} aria-live="polite">
            {isLoading ? 'Loading roles…' : `${jobs.length} role${jobs.length === 1 ? '' : 's'}${isFetching ? ' · updating' : ''}`}
          </Typography>
          <Grid container spacing={2}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Skeleton variant="rounded" height={190} />
                  </Grid>
                ))
              : jobs.length
                ? jobs.map((job) => (
                    <Grid item xs={12} md={6} key={job.id || job._id}>
                      <JobCard job={job} />
                    </Grid>
                  ))
                : (
                  <Grid item xs={12}>
                    <EmptyState
                      title="No roles match that search."
                      text="Try a different title, skill, or clear filters to see everything open."
                      actionLabel={activeCount ? 'Clear filters' : 'Browse later'}
                      actionTo="/jobs"
                    />
                    {activeCount > 0 && (
                      <Box textAlign="center" mt={2}>
                        <Button onClick={clearFilters} variant="outlined">
                          Clear filters
                        </Button>
                      </Box>
                    )}
                  </Grid>
                )}
          </Grid>
        </>
      )}
    </Page>
  );
}

export function JobCard({ job }) {
  const id = job.id || job._id;
  const company = job.companyName || job.company?.name || job.companyId?.name || 'Rolefit partner';
  return (
    <Link to={`/jobs/${id}`} className="job-card-link">
      <Paper
        className="surface-hover"
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'rgba(255,255,255,0.94)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: 'secondary.main',
            opacity: 0,
            transition: 'opacity .2s ease',
          },
          '&:hover::after': { opacity: 1 },
        }}
      >
        <Typography color="text.secondary" variant="body2" fontWeight={600}>
          {company}
        </Typography>
        <Typography variant="h3" fontSize={{ xs: 22, md: 24 }} mt={0.75} sx={{ letterSpacing: '-0.03em' }}>
          {job.title}
        </Typography>
        <Typography color="text.secondary" mt={1.25} sx={{ fontSize: 14 }}>
          {job.location || 'Flexible'} · {job.employmentType || 'Full-time'}
        </Typography>
        <Stack direction="row" gap={0.75} mt={2} flexWrap="wrap" useFlexGap>
          {job.department && <Chip size="small" label={job.department} variant="outlined" />}
          {job.openings != null && <Chip size="small" label={`${job.openings} opening${job.openings === 1 ? '' : 's'}`} />}
          {job.priority && job.priority !== 'medium' && (
            <Chip size="small" color={job.priority === 'critical' ? 'error' : job.priority === 'high' ? 'warning' : 'default'} label={job.priority} />
          )}
          {(job.requiredSkills || []).slice(0, 4).map((s) => (
            <Chip key={s} size="small" label={s} color="secondary" variant="outlined" />
          ))}
        </Stack>
        <Typography
          sx={{
            mt: 'auto',
            pt: 3,
            color: 'secondary.dark',
            fontWeight: 700,
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          View role <ArrowOutward sx={{ fontSize: 16 }} />
        </Typography>
      </Paper>
    </Link>
  );
}

export function JobDetailPage() {
  const { jobId } = useParams();
  const { token, user, login } = useAuth();
  const { showToast } = useToast();
  const nav = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId).then((r) => r.data),
  });
  const { data: myApps } = useQuery({
    queryKey: ['applicant-applications'],
    enabled: user?.role === 'applicant',
    queryFn: () => applicationsApi.mine().then((r) => r.data),
  });
  const existingApp = (myApps || []).find(
    (app) => String(app.jobId) === String(jobId) || String(app.job?.id) === String(jobId)
  );
  const toggleSaved = useMutation({
    mutationFn: () => authApi.toggleSavedJob(jobId),
    onSuccess: (response) => {
      const savedJobs = response.data?.savedJobs || [];
      login({ token, user: { ...user, savedJobs } });
      showToast(response.data?.saved ? 'Role saved' : 'Role removed from saved');
    },
  });

  if (isLoading) {
    return (
      <Page narrow>
        <Skeleton height={48} width="40%" />
        <Skeleton height={80} />
        <Skeleton height={220} sx={{ mt: 2 }} />
      </Page>
    );
  }
  if (error) {
    return (
      <Page narrow>
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>}>
          {String(error)}
        </Alert>
      </Page>
    );
  }

  const job = data;
  const applyPath = `/applicant/jobs/${jobId}/apply`;
  const saved = user?.savedJobs?.some((id) => String(id) === String(jobId));

  return (
    <Page narrow>
      <Button component={Link} to="/jobs" sx={{ mb: 2, px: 0 }}>
        ← All roles
      </Button>
      <Typography color="secondary.main" fontWeight={700}>
        {job.companyName || job.company?.name || job.companyId?.name}
      </Typography>
      <Typography variant="h2" fontSize={{ xs: 40, md: 56 }} mt={1} sx={{ letterSpacing: '-0.045em', maxWidth: 720 }}>
        {job.title}
      </Typography>
      <Typography color="text.secondary" mt={2} sx={{ fontSize: 17 }}>
        {job.location} · {job.employmentType}
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap mt={3}>
        {job.department && <Chip label={job.department} />}
        {job.openings != null && <Chip label={`${job.openings} opening${job.openings === 1 ? '' : 's'}`} />}
        {job.priority && <Chip label={job.priority} color={job.priority === 'critical' ? 'error' : job.priority === 'high' ? 'warning' : 'default'} />}
        {(job.requiredSkills || []).map((s) => (
          <Chip key={s} label={s} color="secondary" variant="outlined" />
        ))}
      </Stack>
      {existingApp && user?.role === 'applicant' && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You already applied on {new Date(existingApp.createdAt).toLocaleDateString()} · Stage:{' '}
          <strong style={{ textTransform: 'capitalize' }}>{existingApp.stage}</strong>
          {existingApp.aiAnalysis?.matchScore != null ? ` · ${existingApp.aiAnalysis.matchScore}% match` : ''}
        </Alert>
      )}
      {user?.role === 'recruiter' && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You’re signed in as a recruiter. Use your dashboard to manage pipelines — applicants apply from a candidate account.
        </Alert>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} mt={4}>
        {user?.role === 'recruiter' ? (
          <Button variant="contained" color="secondary" size="large" component={Link} to="/recruiter">
            Open recruiter dashboard
          </Button>
        ) : existingApp ? (
          <Button variant="contained" color="secondary" size="large" component={Link} to="/applicant/applications">
            View my application
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() =>
              user?.role === 'applicant'
                ? nav(applyPath)
                : nav('/login', { state: { from: applyPath } })
            }
          >
            Apply for this role
          </Button>
        )}
        {user?.role === 'applicant' && (
          <Button
            variant="outlined"
            size="large"
            startIcon={saved ? <Bookmark /> : <BookmarkBorder />}
            disabled={toggleSaved.isPending}
            onClick={() => toggleSaved.mutate()}
          >
            {saved ? 'Saved' : 'Save job'}
          </Button>
        )}
      </Stack>
      {toggleSaved.error && <Alert severity="error" sx={{ mt: 2 }}>{String(toggleSaved.error)}</Alert>}
      <Typography sx={{ mt: 6, whiteSpace: 'pre-line', lineHeight: 1.85, color: 'text.primary' }}>{job.description}</Typography>
    </Page>
  );
}

export function Empty({ title, text }) {
  return <EmptyState title={title} text={text} />;
}

export function NotFoundPage() {
  return (
    <Page narrow>
      <Box textAlign="center" py={6}>
        <Typography color="secondary.main" fontFamily="Outfit" fontWeight={700} letterSpacing=".1em">
          ROLEFIT
        </Typography>
        <Typography variant="h2" fontSize={{ xs: 40, md: 56 }} mt={2}>
          This page is off the map.
        </Typography>
        <Typography color="text.secondary" mt={2}>
          The link may be outdated, or the role may have closed.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center" mt={4}>
          <Button component={Link} to="/jobs" variant="contained" color="secondary">
            Browse roles
          </Button>
          <Button component={Link} to="/">
            Home
          </Button>
        </Stack>
      </Box>
    </Page>
  );
}
