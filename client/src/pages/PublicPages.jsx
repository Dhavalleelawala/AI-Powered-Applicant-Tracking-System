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
import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi, jobsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState, Page, PageHeader } from '../components/ui/Primitives';

export function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 72px)',
        bgcolor: 'primary.main',
        color: '#F7F4EF',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        className="hero-glow"
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 55% at 78% 20%, rgba(31,167,160,0.28), transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(127,224,217,0.12), transparent 55%)',
        }}
      />
      <Box
        className="hero-orb"
        sx={{
          position: 'absolute',
          width: { xs: 320, md: 580 },
          height: { xs: 320, md: 580 },
          borderRadius: '50%',
          border: '1px solid rgba(31,167,160,.35)',
          right: { xs: '-30%', md: '-10%' },
          top: { xs: '-18%', md: '-22%' },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 460,
          height: 460,
          borderRadius: '50%',
          bgcolor: 'rgba(31,167,160,.1)',
          filter: 'blur(2px)',
          left: '55%',
          bottom: '-45%',
          display: { xs: 'none', md: 'block' },
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 10, md: 8 } }}>
        <Typography
          className="reveal"
          sx={{ color: 'secondary.main', fontFamily: 'Syne', fontWeight: 800, letterSpacing: '.12em', fontSize: 14 }}
        >
          ROLEFIT
        </Typography>
        <Typography className="reveal" variant="h1" sx={{ maxWidth: 820, fontSize: { xs: 52, sm: 72, md: 100 }, mt: 2 }}>
          Hiring clarity,
          <br />
          at human speed.
        </Typography>
        <Typography className="reveal-delay" sx={{ maxWidth: 480, fontSize: { xs: 17, md: 19 }, lineHeight: 1.65, mt: 3.5, color: '#D5DDD8' }}>
          Semantic ranking meets a focused pipeline, so every candidate gets the attention they deserve.
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
            sx={{ color: '#F7F4EF', borderColor: '#7E958D', '&:hover': { borderColor: '#F7F4EF', bgcolor: 'rgba(247,244,239,0.06)' } }}
          >
            Explore open roles
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export function JobsPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const deferredSearch = useDeferredValue(search);
  const params = useMemo(
    () => ({
      q: deferredSearch || undefined,
      location: location || undefined,
      department: department || undefined,
      employmentType: employmentType || undefined,
    }),
    [deferredSearch, location, department, employmentType]
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
      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3, bgcolor: 'rgba(255,255,255,0.9)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or skill"
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} sx={{ minWidth: { md: 160 } }} />
          <TextField label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} sx={{ minWidth: { md: 150 } }} />
          <TextField select label="Type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} sx={{ minWidth: { md: 150 } }}>
            <MenuItem value="">All types</MenuItem>
            {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>
      {error ? (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>}>
          {String(error)}
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
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
                      text="Try a different title, skill, or check back soon."
                      actionLabel="Clear filters"
                      actionTo="/jobs"
                    />
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
    <Paper
      className="surface-hover"
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(255,255,255,0.92)',
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {company}
      </Typography>
      <Typography variant="h3" fontSize={24} mt={0.75}>
        {job.title}
      </Typography>
      <Typography color="text.secondary" mt={1}>
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
      <Button component={Link} to={`/jobs/${id}`} endIcon={<ArrowOutward />} sx={{ mt: 'auto', alignSelf: 'flex-start', pt: 3 }}>
        View role
      </Button>
    </Paper>
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
      <Typography variant="h2" fontSize={{ xs: 40, md: 58 }} mt={1}>
        {job.title}
      </Typography>
      <Typography color="text.secondary" mt={2}>
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} mt={4}>
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
        <Typography color="secondary.main" fontFamily="Syne" fontWeight={800} letterSpacing=".1em">
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
