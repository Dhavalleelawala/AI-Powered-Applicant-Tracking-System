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
import { EmptyState, ErrorState, LoadingRows, Page, PageHeader, PageSkeleton, QueryState } from '../components/ui/Primitives';
import { useUrlFilters } from '../hooks/useUrlFilters';

export function LandingPage() {
  return (
    <>
      <Box className="landing-hero" component="section" aria-label="Rolefit">
        <Box className="landing-hero__atmosphere" aria-hidden />
        <Box className="landing-hero__ledger" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </Box>
        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 11, md: 14 } }}>
          <Typography
            className="reveal landing-hero__brand"
            component="h1"
            sx={{
              fontFamily: 'Outfit',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              lineHeight: 0.92,
              fontSize: { xs: 'clamp(3.4rem, 14vw, 5rem)', md: 'clamp(5.5rem, 11vw, 8.5rem)' },
              color: '#F7F8FB',
            }}
          >
            Rolefit
          </Typography>
          <Typography
            className="reveal-delay"
            component="p"
            sx={{
              mt: { xs: 3, md: 4 },
              maxWidth: 420,
              fontFamily: 'Outfit',
              fontWeight: 650,
              letterSpacing: '-0.03em',
              fontSize: { xs: '1.35rem', md: '1.65rem' },
              lineHeight: 1.25,
              color: '#F7F8FB',
            }}
          >
            Hiring clarity, at human speed.
          </Typography>
          <Typography
            className="reveal-delay"
            sx={{ maxWidth: 400, mt: 2, fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.7, color: '#B8C0CC' }}
          >
            Rank resumes with evidence, then move the pipeline without the noise.
          </Typography>
          <Stack className="reveal-late" direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={4.5}>
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
              Find work
            </Button>
          </Stack>
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={6}>
            <Button component={Link} to="/register/applicant" variant="outlined" color="primary">
              Join as an applicant
            </Button>
            <Button component={Link} to="/jobs" color="secondary" endIcon={<ArrowOutward />}>
              Browse open roles
            </Button>
          </Stack>
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
      <Paper
        className="filter-bar filter-bar--sticky"
        sx={{ p: { xs: 2, md: 2.25 }, mb: 2.5 }}
        component="form"
        onSubmit={(e) => e.preventDefault()}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            value={values.q}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Search by title or skill"
            fullWidth
            inputProps={{ 'aria-label': 'Search jobs' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Location"
            value={values.location}
            onChange={(e) => setFilter('location', e.target.value)}
            sx={{ minWidth: { md: 150 } }}
          />
          <TextField
            label="Department"
            value={values.department}
            onChange={(e) => setFilter('department', e.target.value)}
            sx={{ minWidth: { md: 140 } }}
          />
          <TextField
            select
            label="Type"
            value={values.employmentType}
            onChange={(e) => setFilter('employmentType', e.target.value)}
            sx={{ minWidth: { md: 140 } }}
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
        <ErrorState error={error} onRetry={refetch} title="Couldn’t load roles" />
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={1.5} aria-live="polite">
            {isLoading ? 'Loading roles…' : `${jobs.length} role${jobs.length === 1 ? '' : 's'}${isFetching ? ' · updating' : ''}`}
          </Typography>
          <QueryState
            isLoading={isLoading}
            error={null}
            isEmpty={!jobs.length}
            loading={
              <Box className="job-list">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={96} sx={{ mb: 1.25, borderRadius: 2 }} />
                ))}
              </Box>
            }
            empty={
              <EmptyState
                title="No roles match that search."
                text="Try a different title, skill, or clear filters to see everything open."
                actionLabel={activeCount ? 'Clear filters' : undefined}
                onAction={activeCount ? clearFilters : undefined}
              />
            }
          >
            <Box className="job-list" role="list">
              {jobs.map((job) => (
                <JobRow key={job.id || job._id} job={job} />
              ))}
            </Box>
          </QueryState>
        </>
      )}
    </Page>
  );
}

/** Editorial list row — title-led, no card chrome. */
export function JobCard({ job }) {
  return <JobRow job={job} />;
}

function JobRow({ job }) {
  const id = job.id || job._id;
  const company = job.companyName || job.company?.name || job.companyId?.name || 'Rolefit partner';
  const skills = (job.requiredSkills || []).slice(0, 5);

  return (
    <Box
      component={Link}
      to={`/jobs/${id}`}
      role="listitem"
      className="job-row"
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.5, md: 3 }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: 'Outfit',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              fontSize: { xs: '1.2rem', md: '1.35rem' },
              lineHeight: 1.2,
            }}
          >
            {job.title}
          </Typography>
          <Typography color="text.secondary" mt={0.75} sx={{ fontSize: 14 }}>
            {company}
            <Box component="span" sx={{ mx: 0.85, opacity: 0.45 }}>
              ·
            </Box>
            {job.location || 'Flexible'}
            <Box component="span" sx={{ mx: 0.85, opacity: 0.45 }}>
              ·
            </Box>
            {job.employmentType || 'Full-time'}
            {job.department ? (
              <>
                <Box component="span" sx={{ mx: 0.85, opacity: 0.45 }}>
                  ·
                </Box>
                {job.department}
              </>
            ) : null}
          </Typography>
          {(skills.length > 0 || job.priority) && (
            <Stack direction="row" gap={0.75} mt={1.25} flexWrap="wrap" useFlexGap>
              {job.priority && job.priority !== 'medium' && (
                <Chip
                  size="small"
                  color={job.priority === 'critical' ? 'error' : job.priority === 'high' ? 'warning' : 'default'}
                  label={job.priority}
                />
              )}
              {skills.map((s) => (
                <Chip key={s} size="small" label={s} variant="outlined" />
              ))}
            </Stack>
          )}
        </Box>
        <Typography
          className="job-row__cta"
          sx={{
            color: 'secondary.dark',
            fontWeight: 700,
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          View role <ArrowOutward sx={{ fontSize: 16 }} />
        </Typography>
      </Stack>
    </Box>
  );
}

function ApplyActions({ jobId, existingApp, saved, toggleSaved, user, nav, applyPath }) {
  if (user?.role === 'recruiter') {
    return (
      <Button variant="contained" color="secondary" size="large" fullWidth component={Link} to="/recruiter">
        Open recruiter dashboard
      </Button>
    );
  }
  if (existingApp) {
    return (
      <Button variant="contained" color="secondary" size="large" fullWidth component={Link} to="/applicant/applications">
        View my application
      </Button>
    );
  }
  return (
    <Stack spacing={1.25}>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        fullWidth
        onClick={() => (user?.role === 'applicant' ? nav(applyPath) : nav('/login', { state: { from: applyPath } }))}
      >
        Apply for this role
      </Button>
      {user?.role === 'applicant' && (
        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={saved ? <Bookmark /> : <BookmarkBorder />}
          disabled={toggleSaved.isPending}
          onClick={() => toggleSaved.mutate()}
        >
          {saved ? 'Saved' : 'Save job'}
        </Button>
      )}
      {!user && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Sign in as an applicant to apply or save.
        </Typography>
      )}
    </Stack>
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
      <Page>
        <PageSkeleton lines={3} />
      </Page>
    );
  }
  if (error) {
    return (
      <Page narrow>
        <ErrorState error={error} onRetry={refetch} title="Couldn’t load this role" />
      </Page>
    );
  }

  const job = data;
  const applyPath = `/applicant/jobs/${jobId}/apply`;
  const saved = user?.savedJobs?.some((id) => String(id) === String(jobId));
  const company = job.companyName || job.company?.name || job.companyId?.name;

  return (
    <Page>
      <Button component={Link} to="/jobs" sx={{ mb: 2.5, px: 0 }}>
        ← All roles
      </Button>

      <Box className="job-detail">
        <Box className="job-detail__main">
          <Typography color="secondary.main" fontWeight={700} letterSpacing="0.04em">
            {company}
          </Typography>
          <Typography variant="h2" fontSize={{ xs: 36, md: 52 }} mt={1} sx={{ letterSpacing: '-0.045em', maxWidth: 720 }}>
            {job.title}
          </Typography>
          <Typography color="text.secondary" mt={2} sx={{ fontSize: 17 }}>
            {job.location || 'Flexible'} · {job.employmentType || 'Full-time'}
            {job.department ? ` · ${job.department}` : ''}
          </Typography>

          <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap mt={3}>
            {job.openings != null && <Chip label={`${job.openings} opening${job.openings === 1 ? '' : 's'}`} />}
            {job.priority && (
              <Chip
                label={job.priority}
                color={job.priority === 'critical' ? 'error' : job.priority === 'high' ? 'warning' : 'default'}
              />
            )}
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
              You’re signed in as a recruiter. Use your dashboard to manage pipelines — applicants apply from a candidate
              account.
            </Alert>
          )}

          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 3.5 }}>
            <ApplyActions
              jobId={jobId}
              existingApp={existingApp}
              saved={saved}
              toggleSaved={toggleSaved}
              user={user}
              nav={nav}
              applyPath={applyPath}
            />
            {toggleSaved.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {String(toggleSaved.error)}
              </Alert>
            )}
          </Box>

          <Typography
            component="h3"
            sx={{ mt: 5, mb: 2, fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em' }}
          >
            About this role
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.85, color: 'text.primary', maxWidth: 680 }}>
            {job.description}
          </Typography>
        </Box>

        <Box className="job-detail__rail" component="aside" aria-label="Apply">
          <Typography variant="body2" color="text.secondary" fontWeight={700} mb={0.5}>
            Next step
          </Typography>
          <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', mb: 2 }}>
            {existingApp ? 'You’re already in the pipeline' : 'Put yourself forward'}
          </Typography>
          <ApplyActions
            jobId={jobId}
            existingApp={existingApp}
            saved={saved}
            toggleSaved={toggleSaved}
            user={user}
            nav={nav}
            applyPath={applyPath}
          />
          {toggleSaved.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {String(toggleSaved.error)}
            </Alert>
          )}
          {(job.requiredSkills || []).length > 0 && (
            <Box mt={3} pt={2.5} borderTop="1px solid" borderColor="divider">
              <Typography variant="body2" color="text.secondary" fontWeight={700} mb={1}>
                Skills they look for
              </Typography>
              <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
                {(job.requiredSkills || []).map((s) => (
                  <Chip key={s} size="small" label={s} variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
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
        <Typography
          sx={{
            fontFamily: 'Outfit',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            fontSize: { xs: 40, md: 56 },
            color: 'primary.main',
          }}
        >
          Rolefit
        </Typography>
        <Typography variant="h3" mt={2}>
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
