import { Add, Archive, Description, Refresh } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationsApi, hiringApi, jobsApi } from '../../api/client';
import { Empty } from '../PublicPages';
import { useToast } from '../../context/ToastContext';

export function DashboardPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const { data: jobsData, isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsApi.mine().then((r) => r.data),
  });
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useQuery({
    queryKey: ['recruiter-analytics'],
    queryFn: () => hiringApi.analytics().then((r) => r.data),
  });
  const archive = useMutation({
    mutationFn: jobsApi.archive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      qc.invalidateQueries({ queryKey: ['recruiter-analytics'] });
      showToast('Role archived');
    },
  });
  const duplicate = useMutation({
    mutationFn: jobsApi.duplicate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      qc.invalidateQueries({ queryKey: ['recruiter-analytics'] });
      showToast('Draft copy created');
    },
  });
  const jobs = jobsData || [];
  const summary = analyticsData?.summary || {};
  const vacancies = analyticsData?.vacancies || [];
  const isLoading = jobsLoading || analyticsLoading;
  const error = jobsError || analyticsError;
  const refetch = () => {
    refetchJobs();
    refetchAnalytics();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'end' }} gap={2}>
        <Box>
          <Typography variant="h2" fontSize={48}>
            Your hiring field.
          </Typography>
          <Typography color="text.secondary" mt={1}>
            Keep every decision moving with context.
          </Typography>
        </Box>
        <Button component={Link} to="/recruiter/jobs/new" variant="contained" color="secondary" startIcon={<Add />}>
          Create a job
        </Button>
      </Stack>
      <Grid container spacing={2} mt={2}>
        {[
          ['Open vacancies', summary.openVacancies],
          ['Total applications', summary.totalApplications],
          ['Aging over 7 days', summary.agingApplications],
          ['Openings to fill', summary.openingsToFill],
          ['Fill progress', `${summary.fillProgressPercent ?? 0}%`],
        ].map(([label, n]) => (
          <Grid item xs={12} sm={6} lg={2} key={label}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary">{label}</Typography>
              <Typography variant="h2" fontSize={45}>
                {isLoading ? '—' : n}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h3" fontSize={20}>Hiring funnel</Typography>
        <Stack direction="row" gap={1} mt={2} flexWrap="wrap">
          {['applied', 'interview', 'offered', 'rejected'].map((stage) => (
            <Chip key={stage} label={`${stage}: ${summary.funnel?.[stage] ?? 0}`} color={stage === 'rejected' ? 'error' : 'secondary'} />
          ))}
        </Stack>
      </Paper>
      {error ? (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>} sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Typography variant="h3" mt={5}>Vacancy overview</Typography>
          <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell align="right">Openings</TableCell>
                  <TableCell align="right">Apps</TableCell>
                  <TableCell align="right">Interviews</TableCell>
                  <TableCell align="right">Age</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vacancies.map((vacancy) => (
                  <TableRow key={vacancy.id}>
                    <TableCell>{vacancy.title}</TableCell>
                    <TableCell>{vacancy.department || '—'}</TableCell>
                    <TableCell><Chip size="small" label={vacancy.priority} color={vacancy.priority === 'critical' ? 'error' : vacancy.priority === 'high' ? 'warning' : 'default'} /></TableCell>
                    <TableCell align="right">{vacancy.openings}</TableCell>
                    <TableCell align="right">{vacancy.applications}</TableCell>
                    <TableCell align="right">{vacancy.interviews}</TableCell>
                    <TableCell align="right">{vacancy.ageDays}d</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Button size="small" component={Link} to={`/recruiter/jobs/${vacancy.id}/applications`}>Pipeline</Button>
                        <Button size="small" component={Link} to={`/recruiter/jobs/${vacancy.id}/ranking`}>Ranking</Button>
                        <Button size="small" component={Link} to={`/recruiter/jobs/${vacancy.id}/edit`}>Edit</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={1.5} mt={5}>
          <Typography variant="h3">Your roles</Typography>
          {jobs.length ? (
            jobs.map((j) => (
              <Paper key={j.id || j._id} sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography fontWeight={700}>{j.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {j.location} · {j.applicationCount || 0} candidates
                  </Typography>
                </Box>
                <Chip label={j.status} />
                <Button component={Link} to={`/recruiter/jobs/${j.id || j._id}/edit`}>
                  Edit
                </Button>
                <Button component={Link} to={`/recruiter/jobs/${j.id || j._id}/applications`}>
                  Pipeline
                </Button>
                <Button component={Link} to={`/recruiter/jobs/${j.id || j._id}/ranking`}>
                  Ranking
                </Button>
                <Button disabled={duplicate.isPending} onClick={() => duplicate.mutate(j.id || j._id)}>
                  Duplicate
                </Button>
                {j.status !== 'archived' && (
                  <Button color="error" startIcon={<Archive />} onClick={() => archive.mutate(j.id || j._id)}>
                    Archive
                  </Button>
                )}
              </Paper>
            ))
          ) : (
            !isLoading && <Empty title="Your pipeline begins with a role." text="Create your first job to start meeting great candidates." />
          )}
          </Stack>
        </>
      )}
    </Container>
  );
}

export function JobFormPage() {
  const { jobId } = useParams();
  const nav = useNavigate();
  const { showToast } = useToast();
  const editing = Boolean(jobId);
  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    experienceYearsMin: 0,
    experienceYearsMax: 5,
    location: '',
    department: '',
    openings: 1,
    priority: 'medium',
    closesAt: '',
    employmentType: 'full-time',
    status: 'open',
  });
  const { data } = useQuery({
    queryKey: ['job', jobId],
    enabled: editing,
    queryFn: () => jobsApi.get(jobId).then((r) => r.data),
  });
  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        description: data.description || '',
        requiredSkills: (data.requiredSkills || []).join(', '),
        experienceYearsMin: data.experienceYearsMin ?? 0,
        experienceYearsMax: data.experienceYearsMax ?? 5,
        location: data.location || '',
        department: data.department || '',
        openings: data.openings ?? 1,
        priority: data.priority || 'medium',
        closesAt: data.closesAt ? data.closesAt.slice(0, 10) : '',
        employmentType: data.employmentType || 'full-time',
        status: data.status || 'open',
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (body) => (editing ? jobsApi.update(jobId, body) : jobsApi.create(body)),
    onSuccess: () => {
      showToast(editing ? 'Role updated' : 'Role published');
      nav('/recruiter');
    },
  });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    save.mutate({
      ...form,
      requiredSkills: form.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      experienceYearsMin: Number(form.experienceYearsMin),
      experienceYearsMax: Number(form.experienceYearsMax),
      openings: Number(form.openings),
      closesAt: form.closesAt || null,
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 7 }}>
      <Typography variant="h2" fontSize={48}>
        {editing ? 'Refine the role.' : 'Open a new role.'}
      </Typography>
      <Paper component="form" onSubmit={submit} sx={{ p: { xs: 2.5, md: 4 }, mt: 4 }}>
        <Stack spacing={2.5}>
          <TextField label="Job title" required value={form.title} onChange={set('title')} />
          <TextField label="Location" required value={form.location} onChange={set('location')} />
          <TextField label="Department" value={form.department} onChange={set('department')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Openings" type="number" inputProps={{ min: 1 }} value={form.openings} onChange={set('openings')} fullWidth />
            <TextField label="Priority" select value={form.priority} onChange={set('priority')} fullWidth>
              {['low', 'medium', 'high', 'critical'].map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
            </TextField>
            <TextField label="Closes at" type="date" value={form.closesAt} onChange={set('closesAt')} InputLabelProps={{ shrink: true }} fullWidth />
          </Stack>
          <TextField label="Employment type" select value={form.employmentType} onChange={set('employmentType')}>
            {['full-time', 'part-time', 'contract', 'internship'].map((x) => (
              <MenuItem value={x} key={x}>
                {x}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Required skills"
            helperText="Separate skills with commas."
            value={form.requiredSkills}
            onChange={set('requiredSkills')}
          />
          <Stack direction="row" spacing={2}>
            <TextField label="Minimum years" type="number" value={form.experienceYearsMin} onChange={set('experienceYearsMin')} />
            <TextField label="Maximum years" type="number" value={form.experienceYearsMax} onChange={set('experienceYearsMax')} />
          </Stack>
          <TextField label="Job description" multiline minRows={8} required value={form.description} onChange={set('description')} helperText="Write at least ~50 characters so AI ranking has enough context." />
          <TextField label="Status" select value={form.status} onChange={set('status')}>
            {['draft', 'open'].map((x) => (
              <MenuItem value={x} key={x}>
                {x}
              </MenuItem>
            ))}
          </TextField>
          {save.error && <Alert severity="error">{String(save.error)}</Alert>}
          <Button type="submit" color="secondary" variant="contained" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Publish role'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

const stages = ['applied', 'interview', 'offered', 'rejected'];

async function openResume(applicationId) {
  const res = await applicationsApi.resumeUrl(applicationId);
  const url = res.data?.url;
  if (!url) throw new Error('Resume URL unavailable');
  if (url.startsWith('http')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  window.open(`${apiBase}${url}`, '_blank', 'noopener,noreferrer');
}

export function PipelinePage() {
  const { jobId } = useParams();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [selected, setSelected] = useState([]);
  const [notes, setNotes] = useState({});
  const { data, isLoading, error } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => applicationsApi.forJob(jobId).then((r) => r.data),
    refetchInterval: (query) => {
      const rows = query.state.data || [];
      return rows.some((a) => ['pending', 'processing'].includes(a.aiStatus)) ? 4000 : false;
    },
  });
  const move = useMutation({
    mutationFn: ({ id, stage, rejectionReason }) => applicationsApi.move(id, { stage, rejectionReason }),
    onSuccess: () => {
      setSelected([]);
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      showToast('Candidate stage updated');
    },
  });
  const addNote = useMutation({
    mutationFn: ({ id, text }) => applicationsApi.addNote(id, text),
    onSuccess: (_, { id }) => {
      setNotes((current) => ({ ...current, [id]: '' }));
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      showToast('Note added');
    },
  });
  const bulkMove = useMutation({
    mutationFn: (applicationIds) => applicationsApi.bulkMove(jobId, { applicationIds, stage: 'interview' }),
    onSuccess: () => {
      setSelected([]);
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      showToast('Candidates moved to interview');
    },
  });
  const apps = data || [];
  const toggleSelected = (id) =>
    setSelected((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]));

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'end' }} gap={2}>
        <Box>
          <Typography variant="h2" fontSize={48}>
            Candidate pipeline
          </Typography>
          <Typography color="text.secondary" mt={1}>
            Move each conversation forward with intent.
          </Typography>
        </Box>
        <Button component={Link} to={`/recruiter/jobs/${jobId}/ranking`} variant="outlined">
          Open ranking
        </Button>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" mt={3}>
        <Button variant="contained" color="secondary" disabled={!selected.length || bulkMove.isPending} onClick={() => bulkMove.mutate(selected)}>
          Move selected to Interview ({selected.length})
        </Button>
        {(move.error || addNote.error || bulkMove.error) && <Alert severity="error">{String(move.error || addNote.error || bulkMove.error)}</Alert>}
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2} mt={2}>
        {stages.map((stage) => (
          <Grid item xs={12} sm={6} lg={3} key={stage}>
            <Paper sx={{ p: 2, bgcolor: '#EFF1EC', minHeight: 400 }}>
              <Typography variant="h3" fontSize={20} sx={{ textTransform: 'capitalize' }}>
                {stage} <Chip size="small" label={apps.filter((a) => a.stage === stage).length} />
              </Typography>
              <Stack spacing={1.25} mt={2}>
                {isLoading ? (
                  <Typography>Loading candidates…</Typography>
                ) : (
                  apps
                    .filter((a) => a.stage === stage)
                    .map((a) => (
                      <Paper key={a.id || a._id} sx={{ p: 1.75, bgcolor: '#fff' }}>
                        <Checkbox
                          size="small"
                          checked={selected.includes(a.id || a._id)}
                          onChange={() => toggleSelected(a.id || a._id)}
                          inputProps={{ 'aria-label': `Select ${a.applicant?.name || a.applicantName || 'candidate'}` }}
                          sx={{ float: 'right', p: 0 }}
                        />
                        <Typography fontWeight={700}>{a.applicant?.name || a.applicantName || a.applicantId?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {a.applicant?.email || a.applicantEmail || a.applicantId?.email}
                        </Typography>
                        <Chip
                          label={`${a.aiAnalysis?.matchScore ?? a.matchScore ?? '—'} match`}
                          color="secondary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                        <TextField
                          select
                          size="small"
                          value={stage}
                          onChange={(e) => {
                            const nextStage = e.target.value;
                            const rejectionReason =
                              nextStage === 'rejected'
                                ? window.prompt('Rejection reason (optional):') || undefined
                                : undefined;
                            move.mutate({ id: a.id || a._id, stage: nextStage, rejectionReason });
                          }}
                          sx={{ mt: 1.5, width: '100%' }}
                        >
                          {stages.map((s) => (
                            <MenuItem key={s} value={s}>
                              Move to {s}
                            </MenuItem>
                          ))}
                        </TextField>
                        {(a.recruiterNotes || []).slice(-2).map((note) => (
                          <Typography key={note._id || note.createdAt} variant="caption" color="text.secondary" display="block" mt={1}>
                            Note: {note.text}
                          </Typography>
                        ))}
                        <Stack direction="row" spacing={1} mt={1}>
                          <TextField
                            size="small"
                            label="Add recruiter note"
                            value={notes[a.id || a._id] || ''}
                            onChange={(e) => setNotes({ ...notes, [a.id || a._id]: e.target.value })}
                            fullWidth
                          />
                          <Button
                            size="small"
                            disabled={!notes[a.id || a._id]?.trim() || addNote.isPending}
                            onClick={() => addNote.mutate({ id: a.id || a._id, text: notes[a.id || a._id] })}
                          >
                            Add note
                          </Button>
                        </Stack>
                        <Button size="small" startIcon={<Description />} sx={{ mt: 1 }} onClick={() => openResume(a.id || a._id).catch(alert)}>
                          Resume
                        </Button>
                      </Paper>
                    ))
                )}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export function CandidatesPage() {
  const [filters, setFilters] = useState({ q: '', stage: '', minScore: '' });
  const params = {
    q: filters.q || undefined,
    stage: filters.stage || undefined,
    minScore: filters.minScore === '' ? undefined : Number(filters.minScore),
  };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['company-candidates', params],
    queryFn: () => hiringApi.candidates(params).then((r) => r.data),
  });
  const candidates = data || [];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" fontSize={48}>Candidate directory</Typography>
      <Typography color="text.secondary" mt={1}>Search every candidate across your active hiring work.</Typography>
      <Paper sx={{ p: 3, mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Search name, email, skills" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth select label="Stage" value={filters.stage} onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
              <MenuItem value="">All stages</MenuItem>
              {stages.map((stage) => <MenuItem key={stage} value={stage}>{stage}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="number" label="Minimum score" inputProps={{ min: 0, max: 100 }} value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: e.target.value })} />
          </Grid>
        </Grid>
      </Paper>
      {error ? (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>} sx={{ mt: 3 }}>{String(error)}</Alert>
      ) : (
        <Stack spacing={1.5} mt={3}>
          {isLoading ? <Typography>Searching candidates…</Typography> : candidates.length ? candidates.map((candidate) => (
            <Paper key={candidate.id} sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography fontWeight={700}>{candidate.applicant?.name || 'Unknown candidate'}</Typography>
                <Typography variant="body2" color="text.secondary">{candidate.applicant?.email || '—'} · {candidate.job?.title || 'Role unavailable'}</Typography>
              </Box>
              <Chip color="secondary" label={`${candidate.matchScore ?? '—'} match`} />
              <Chip label={candidate.stage} />
              {candidate.job && <Button component={Link} to={`/recruiter/jobs/${candidate.job.id}/applications`}>View pipeline</Button>}
            </Paper>
          )) : <Empty title="No candidates match these filters." text="Try broadening your search or score threshold." />}
        </Stack>
      )}
    </Container>
  );
}

export function RankingPage() {
  const { jobId } = useParams();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [filters, setFilters] = useState({ minScore: 0, skill: '', minExperience: '', sort: 'score_desc' });
  const [actionError, setActionError] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['job-applications', jobId, filters],
    queryFn: () =>
      applicationsApi
        .forJob(jobId, {
          ...filters,
          minExperience: filters.minExperience === '' ? undefined : Number(filters.minExperience),
        })
        .then((r) => r.data),
    refetchInterval: (query) => {
      const rows = query.state.data || [];
      return rows.some((a) => ['pending', 'processing'].includes(a.aiStatus)) ? 4000 : false;
    },
  });
  const reanalyze = useMutation({
    mutationFn: (id) => applicationsApi.reanalyze(id),
    onSuccess: () => {
      setActionError('');
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      showToast('Reanalysis queued');
    },
    onError: (err) => setActionError(String(err)),
  });
  const apps = data || [];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" fontSize={48}>
        Shortlist with signal.
      </Typography>
      <Paper sx={{ p: 3, mt: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Minimum match: {filters.minScore}</Typography>
            <Slider color="secondary" value={filters.minScore} onChange={(_, v) => setFilters({ ...filters, minScore: v })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Required skill"
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Min years"
              value={filters.minExperience}
              onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Sort"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <MenuItem value="score_desc">Highest score</MenuItem>
              <MenuItem value="newest">Newest first</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      {(error || actionError) && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || actionError}
        </Alert>
      )}
      <Stack mt={3} spacing={1.5}>
        {isLoading ? (
          <Typography>Ranking candidates…</Typography>
        ) : apps.length ? (
          apps.map((a) => {
            const matched = a.aiAnalysis?.skillsMatched || a.aiAnalysis?.matchedSkills || [];
            const missing = a.aiAnalysis?.skillsMissing || [];
            return (
              <Paper key={a.id || a._id} sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography fontWeight={700}>{a.applicant?.name || a.applicantName || a.applicantId?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.applicant?.email || a.applicantEmail || a.applicantId?.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography color="secondary.main" fontWeight={700}>
                        {a.aiAnalysis?.matchScore ?? a.matchScore ?? '—'}% match
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        AI: {a.aiStatus || 'pending'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2">Matched: {matched.join(', ') || '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Missing: {missing.join(', ') || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip label={a.stage} />
                        <Button size="small" startIcon={<Description />} onClick={() => openResume(a.id || a._id).catch((e) => setActionError(String(e.message || e)))}>
                          Resume
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Refresh />}
                          disabled={reanalyze.isPending}
                          onClick={() => reanalyze.mutate(a.id || a._id)}
                        >
                          Reanalyze
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
                {(a.aiAnalysis?.summary || a.aiAnalysis?.strengths?.length || a.aiAnalysis?.gaps?.length) && (
                  <Accordion disableGutters elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2">AI summary & evidence</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ whiteSpace: 'pre-line' }}>{a.aiAnalysis?.summary || 'No summary yet.'}</Typography>
                      <Typography mt={2} fontWeight={700}>
                        Strengths
                      </Typography>
                      <Typography variant="body2">{(a.aiAnalysis?.strengths || []).join(', ') || '—'}</Typography>
                      <Typography mt={2} fontWeight={700}>
                        Gaps
                      </Typography>
                      <Typography variant="body2">{(a.aiAnalysis?.gaps || []).join(', ') || '—'}</Typography>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Paper>
            );
          })
        ) : (
          <Empty title="No candidates meet these filters." text="Widen the score threshold or skill filter." />
        )}
      </Stack>
    </Container>
  );
}
