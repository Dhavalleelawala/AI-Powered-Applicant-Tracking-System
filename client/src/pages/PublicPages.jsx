import { ArrowOutward, Search } from '@mui/icons-material';
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
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi, jobsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 70px)',
        bgcolor: 'primary.main',
        color: '#F7F4EF',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        className="hero-orb"
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          border: '1px solid rgba(31,167,160,.35)',
          right: '-12%',
          top: '-25%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          bgcolor: 'rgba(31,167,160,.12)',
          filter: 'blur(2px)',
          left: '52%',
          bottom: '-50%',
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 12, md: 8 } }}>
        <Typography
          className="reveal"
          sx={{ color: 'secondary.main', fontFamily: 'Syne', fontWeight: 800, letterSpacing: '.08em', fontSize: 15 }}
        >
          ROLEFIT
        </Typography>
        <Typography className="reveal" variant="h1" sx={{ maxWidth: 800, fontSize: { xs: 56, md: 104 }, lineHeight: 0.94, mt: 2 }}>
          Hiring clarity,
          <br />
          at human speed.
        </Typography>
        <Typography className="reveal-delay" sx={{ maxWidth: 490, fontSize: 19, lineHeight: 1.6, mt: 4, color: '#D5DDD8' }}>
          Semantic ranking meets a focused pipeline, so every candidate gets the attention they deserve.
        </Typography>
        <Stack className="reveal-delay" direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={4}>
          <Button variant="contained" color="secondary" component={Link} to="/register/recruiter" endIcon={<ArrowOutward />}>
            Start hiring
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/jobs"
            sx={{ color: '#F7F4EF', borderColor: '#7E958D', '&:hover': { borderColor: '#F7F4EF' } }}
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
  const params = useMemo(
    () => ({
      q: search || undefined,
      location: location || undefined,
      department: department || undefined,
      employmentType: employmentType || undefined,
    }),
    [search, location, department, employmentType]
  );
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.list(params).then((r) => r.data),
  });
  const jobs = data || [];

  return (
    <Container maxWidth="lg" sx={{ py: 7 }}>
      <Typography variant="h2" fontSize={{ xs: 40, md: 58 }}>
        Find a role with room to grow.
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mt={4} alignItems={{ md: 'center' }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or skill"
          sx={{ width: '100%', maxWidth: 420 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
        <TextField
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <TextField
          select
          label="Type"
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All types</MenuItem>
          {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      {error ? (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>} sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Skeleton variant="rounded" height={180} />
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
                  <Empty title="No roles match that search." text="Try a different title, skill, or check back soon." />
                </Grid>
              )}
        </Grid>
      )}
    </Container>
  );
}

export function JobCard({ job }) {
  const id = job.id || job._id;
  const company = job.companyName || job.company?.name || job.companyId?.name || 'Rolefit partner';
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': { borderColor: 'secondary.main' },
        transition: '.2s',
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {company}
      </Typography>
      <Typography variant="h3" fontSize={24} mt={0.5}>
        {job.title}
      </Typography>
      <Typography color="text.secondary" mt={1}>
        {job.location || 'Flexible'} · {job.employmentType || 'Full-time'}
      </Typography>
      <Stack direction="row" gap={0.75} mt={2} flexWrap="wrap">
        {job.department && <Chip size="small" label={job.department} />}
        {job.openings != null && <Chip size="small" label={`${job.openings} opening${job.openings === 1 ? '' : 's'}`} />}
        {job.priority && <Chip size="small" color={job.priority === 'critical' ? 'error' : job.priority === 'high' ? 'warning' : 'default'} label={job.priority} />}
        {(job.requiredSkills || []).slice(0, 4).map((s) => (
          <Chip key={s} size="small" label={s} />
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
      <Container sx={{ py: 8 }}>
        <Skeleton height={90} />
        <Skeleton height={300} />
      </Container>
    );
  }
  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>}>
          {error}
        </Alert>
      </Container>
    );
  }

  const job = data;
  const applyPath = `/applicant/jobs/${jobId}/apply`;
  const saved = user?.savedJobs?.some((id) => String(id) === String(jobId));

  return (
    <Container maxWidth="md" sx={{ py: 7 }}>
      <Typography color="secondary.main" fontWeight={700}>
        {job.companyName || job.company?.name || job.companyId?.name}
      </Typography>
      <Typography variant="h2" fontSize={{ xs: 42, md: 64 }} mt={1}>
        {job.title}
      </Typography>
      <Typography color="text.secondary" mt={2}>
        {job.location} · {job.employmentType}
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap" mt={3}>
        {job.department && <Chip label={job.department} />}
        {job.openings != null && <Chip label={`${job.openings} opening${job.openings === 1 ? '' : 's'}`} />}
        {job.priority && <Chip label={job.priority} color={job.priority === 'critical' ? 'error' : job.priority === 'high' ? 'warning' : 'default'} />}
        {(job.requiredSkills || []).map((s) => (
          <Chip key={s} label={s} color="secondary" variant="outlined" />
        ))}
      </Stack>
      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 4 }}
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
          sx={{ mt: 4, ml: 1 }}
          disabled={toggleSaved.isPending}
          onClick={() => toggleSaved.mutate()}
        >
          {saved ? 'Unsave job' : 'Save job'}
        </Button>
      )}
      {toggleSaved.error && <Alert severity="error" sx={{ mt: 2 }}>{String(toggleSaved.error)}</Alert>}
      <Typography sx={{ mt: 6, whiteSpace: 'pre-line', lineHeight: 1.8 }}>{job.description}</Typography>
    </Container>
  );
}

export function Empty({ title, text }) {
  return (
    <Paper sx={{ p: 6, textAlign: 'center', borderStyle: 'dashed' }}>
      <Typography variant="h3">{title}</Typography>
      <Typography color="text.secondary" mt={1}>
        {text}
      </Typography>
    </Paper>
  );
}

export function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
      <Typography color="secondary.main" fontFamily="Syne" fontWeight={800} letterSpacing=".08em">
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
    </Container>
  );
}
