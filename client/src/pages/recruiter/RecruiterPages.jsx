import { Add, Archive, Description, Refresh } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationsApi, hiringApi, jobsApi } from '../../api/client';
import { AppBreadcrumbs } from '../../components/ui/AppBreadcrumbs';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, LoadingRows, Page, PageHeader, SectionLabel, StatTile } from '../../components/ui/Primitives';
import { useToast } from '../../context/ToastContext';
import { useUrlFilters } from '../../hooks/useUrlFilters';
import { useBeforeUnloadWarning, useLeaveConfirm } from '../../hooks/useUnsavedWarning';

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
  const [archiveTarget, setArchiveTarget] = useState(null);

  return (
    <Page maxWidth="xl">
      <PageHeader
        eyebrow="RECRUITER"
        title="Your hiring field."
        subtitle="Keep every decision moving with context."
        actions={
          <Button component={Link} to="/recruiter/jobs/new" variant="contained" color="secondary" startIcon={<Add />}>
            Create a job
          </Button>
        }
      />

      <Grid container spacing={2}>
        {[
          ['Open vacancies', summary.openVacancies],
          ['Total applications', summary.totalApplications],
          ['Aging over 7 days', summary.agingApplications],
          ['Openings to fill', summary.openingsToFill],
          ['Fill progress', `${summary.fillProgressPercent ?? 0}%`],
        ].map(([label, n]) => (
          <Grid item xs={12} sm={6} md={4} lg key={label}>
            <StatTile label={label} value={isLoading ? '—' : n} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 2.5, bgcolor: 'rgba(255,255,255,0.9)' }}>
        <SectionLabel>Hiring funnel</SectionLabel>
        <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
          {['applied', 'interview', 'offered', 'rejected'].map((stage) => (
            <Chip
              key={stage}
              label={`${stage}: ${summary.funnel?.[stage] ?? 0}`}
              color={stage === 'rejected' ? 'error' : stage === 'offered' ? 'success' : 'secondary'}
              variant={stage === 'applied' ? 'outlined' : 'filled'}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Stack>
      </Paper>

      {error ? (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                refetchJobs();
                refetchAnalytics();
              }}
            >
              Retry
            </Button>
          }
          sx={{ mt: 3 }}
        >
          {String(error)}
        </Alert>
      ) : (
        <>
          <Typography variant="h3" mt={5} mb={2} fontSize={28}>
            Vacancy overview
          </Typography>
          <TableContainer component={Paper} sx={{ overflowX: 'auto', bgcolor: 'rgba(255,255,255,0.92)' }}>
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
                {vacancies.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography color="text.secondary" py={2}>
                        No open vacancies yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {vacancies.map((vacancy) => (
                  <TableRow key={vacancy.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{vacancy.title}</TableCell>
                    <TableCell>{vacancy.department || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={vacancy.priority}
                        color={vacancy.priority === 'critical' ? 'error' : vacancy.priority === 'high' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">{vacancy.openings}</TableCell>
                    <TableCell align="right">{vacancy.applications}</TableCell>
                    <TableCell align="right">{vacancy.interviews}</TableCell>
                    <TableCell align="right">{vacancy.ageDays}d</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Button size="small" component={Link} to={`/recruiter/jobs/${vacancy.id}/applications`}>
                          Pipeline
                        </Button>
                        <Button size="small" component={Link} to={`/recruiter/jobs/${vacancy.id}/ranking`}>
                          Ranking
                        </Button>
                        <Button size="small" component={Link} to={`/recruiter/jobs/${vacancy.id}/edit`}>
                          Edit
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h3" mt={5} mb={2} fontSize={28}>
            Your roles
          </Typography>
          {isLoading ? (
            <LoadingRows />
          ) : jobs.length ? (
            <Stack spacing={1.25}>
              {jobs.map((j) => (
                <Paper
                  key={j.id || j._id}
                  className="surface-hover"
                  sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.92)' }}
                >
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography fontWeight={700}>{j.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {j.location} · {j.applicationCount || 0} candidates
                    </Typography>
                  </Box>
                  <Chip label={j.status} size="small" color={j.status === 'open' ? 'success' : 'default'} />
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
                    <Button color="error" startIcon={<Archive />} onClick={() => setArchiveTarget(j)}>
                      Archive
                    </Button>
                  )}
                </Paper>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="Your pipeline begins with a role."
              text="Create your first job to start meeting great candidates."
              actionLabel="Create a job"
              actionTo="/recruiter/jobs/new"
            />
          )}
        </>
      )}
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title="Archive this role?"
        description={
          archiveTarget
            ? `"${archiveTarget.title}" will leave the public board. Existing applications stay in your pipeline.`
            : ''
        }
        confirmLabel="Archive role"
        confirmColor="error"
        loading={archive.isPending}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => {
          archive.mutate(archiveTarget.id || archiveTarget._id, {
            onSettled: () => setArchiveTarget(null),
          });
        }}
      />
    </Page>
  );
}

export function JobFormPage() {
  const { jobId } = useParams();
  const nav = useNavigate();
  const { showToast, showError } = useToast();
  const editing = Boolean(jobId);
  const [dirty, setDirty] = useState(false);
  const { requestLeave, dialog: leaveDialog } = useLeaveConfirm();
  useBeforeUnloadWarning(dirty);
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
      setDirty(false);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (body) => (editing ? jobsApi.update(jobId, body) : jobsApi.create(body)),
    onSuccess: () => {
      setDirty(false);
      showToast(editing ? 'Role updated' : 'Role published');
      nav('/recruiter');
    },
    onError: (err) => showError(err),
  });
  const set = (key) => (e) => {
    setDirty(true);
    setForm({ ...form, [key]: e.target.value });
  };
  const submit = (e) => {
    e.preventDefault();
    if (String(form.description || '').trim().length < 50) {
      showError('Description needs at least 50 characters for quality AI matching.');
      return;
    }
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

  const goBack = () => {
    if (dirty) requestLeave(() => nav('/recruiter'));
    else nav('/recruiter');
  };

  return (
    <Page narrow>
      <AppBreadcrumbs
        items={[
          { label: 'Dashboard', to: '/recruiter' },
          { label: editing ? 'Edit role' : 'New role' },
        ]}
      />
      <PageHeader
        eyebrow={editing ? 'EDIT ROLE' : 'NEW ROLE'}
        title={editing ? 'Refine the role.' : 'Open a new role.'}
        subtitle="Clear requirements help AI ranking and candidates alike."
      />
      <Paper component="form" onSubmit={submit} sx={{ p: { xs: 2.5, md: 4 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
        <Stack spacing={2.5}>
          <TextField label="Job title" required value={form.title} onChange={set('title')} />
          <TextField label="Location" required value={form.location} onChange={set('location')} />
          <TextField label="Department" value={form.department} onChange={set('department')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Openings" type="number" inputProps={{ min: 1 }} value={form.openings} onChange={set('openings')} fullWidth />
            <TextField label="Priority" select value={form.priority} onChange={set('priority')} fullWidth>
              {['low', 'medium', 'high', 'critical'].map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
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
            <TextField label="Minimum years" type="number" value={form.experienceYearsMin} onChange={set('experienceYearsMin')} fullWidth />
            <TextField label="Maximum years" type="number" value={form.experienceYearsMax} onChange={set('experienceYearsMax')} fullWidth />
          </Stack>
          <TextField
            label="Job description"
            multiline
            minRows={8}
            required
            value={form.description}
            onChange={set('description')}
            helperText={`${String(form.description || '').trim().length}/50+ characters for AI matching.`}
          />
          <TextField label="Status" select value={form.status} onChange={set('status')}>
            {['draft', 'open'].map((x) => (
              <MenuItem value={x} key={x}>
                {x}
              </MenuItem>
            ))}
          </TextField>
          {save.error && <Alert severity="error">{String(save.error)}</Alert>}
          <Stack direction="row" spacing={1.5}>
            <Button type="submit" color="secondary" variant="contained" size="large" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Publish role'}
            </Button>
            <Button onClick={goBack}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
      {leaveDialog}
    </Page>
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
  const { showToast, showError } = useToast();
  const [selected, setSelected] = useState([]);
  const [notes, setNotes] = useState({});
  const [rejectTarget, setRejectTarget] = useState(null);
  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId).then((r) => r.data),
  });
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
      setRejectTarget(null);
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      showToast('Candidate stage updated');
    },
    onError: (err) => showError(err),
  });
  const addNote = useMutation({
    mutationFn: ({ id, text }) => applicationsApi.addNote(id, text),
    onSuccess: (_, { id }) => {
      setNotes((current) => ({ ...current, [id]: '' }));
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      showToast('Note added');
    },
    onError: (err) => showError(err),
  });
  const bulkMove = useMutation({
    mutationFn: (applicationIds) => applicationsApi.bulkMove(jobId, { applicationIds, stage: 'interview' }),
    onSuccess: () => {
      setSelected([]);
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      showToast('Candidates moved to interview');
    },
    onError: (err) => showError(err),
  });
  const apps = data || [];
  const toggleSelected = (id) =>
    setSelected((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]));

  const requestStageChange = (application, nextStage) => {
    if (nextStage === 'rejected') {
      setRejectTarget(application);
      return;
    }
    move.mutate({ id: application.id || application._id, stage: nextStage });
  };

  return (
    <Page maxWidth="xl">
      <AppBreadcrumbs
        items={[
          { label: 'Dashboard', to: '/recruiter' },
          { label: job?.title || 'Role' },
          { label: 'Pipeline' },
        ]}
      />
      <PageHeader
        eyebrow="PIPELINE"
        title={job?.title ? `${job.title} pipeline` : 'Candidate pipeline'}
        subtitle="Move each conversation forward with intent."
        actions={
          <Button component={Link} to={`/recruiter/jobs/${jobId}/ranking`} variant="outlined">
            Open ranking
          </Button>
        }
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} mb={3}>
        <Button variant="contained" color="secondary" disabled={!selected.length || bulkMove.isPending} onClick={() => bulkMove.mutate(selected)}>
          Move selected to Interview ({selected.length})
        </Button>
        {(move.error || addNote.error || bulkMove.error) && (
          <Alert severity="error">{String(move.error || addNote.error || bulkMove.error)}</Alert>
        )}
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {String(error)}
        </Alert>
      )}
      <Grid container spacing={2}>
        {stages.map((stage) => (
          <Grid item xs={12} sm={6} lg={3} key={stage}>
            <Paper className="pipeline-column" sx={{ p: 2, minHeight: 420, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h3" fontSize={18} sx={{ textTransform: 'capitalize' }}>
                  {stage}
                </Typography>
                <Chip size="small" label={apps.filter((a) => a.stage === stage).length} />
              </Stack>
              <Stack spacing={1.25} mt={2}>
                {isLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading…
                  </Typography>
                ) : apps.filter((a) => a.stage === stage).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 0.5 }}>
                    No candidates in {stage}.
                  </Typography>
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
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
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
                          onChange={(e) => requestStageChange(a, e.target.value)}
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
                            label="Note"
                            value={notes[a.id || a._id] || ''}
                            onChange={(e) => setNotes({ ...notes, [a.id || a._id]: e.target.value })}
                            fullWidth
                          />
                          <Button
                            size="small"
                            disabled={!notes[a.id || a._id]?.trim() || addNote.isPending}
                            onClick={() => addNote.mutate({ id: a.id || a._id, text: notes[a.id || a._id] })}
                          >
                            Add
                          </Button>
                        </Stack>
                        <Button
                          size="small"
                          startIcon={<Description />}
                          sx={{ mt: 1 }}
                          onClick={() => openResume(a.id || a._id).catch((err) => showError(err.message || err))}
                        >
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
      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Reject this candidate?"
        description={
          rejectTarget
            ? `${rejectTarget.applicant?.name || rejectTarget.applicantName || 'This candidate'} will move to Rejected. You can still review their application later.`
            : ''
        }
        requireReason
        reasonLabel="Rejection reason (optional)"
        confirmLabel="Reject"
        confirmColor="error"
        loading={move.isPending}
        onClose={() => setRejectTarget(null)}
        onConfirm={(reason) => {
          move.mutate({
            id: rejectTarget.id || rejectTarget._id,
            stage: 'rejected',
            rejectionReason: reason || undefined,
          });
        }}
      />
    </Page>
  );
}

export function CandidatesPage() {
  const filterDefaults = useMemo(() => ({ q: '', stage: '', minScore: '' }), []);
  const { values, setFilter, clearFilters, activeCount } = useUrlFilters(filterDefaults);
  const params = {
    q: values.q || undefined,
    stage: values.stage || undefined,
    minScore: values.minScore === '' ? undefined : Number(values.minScore),
  };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['company-candidates', params],
    queryFn: () => hiringApi.candidates(params).then((r) => r.data),
  });
  const candidates = data || [];

  return (
    <Page>
      <PageHeader
        eyebrow="DIRECTORY"
        title="Candidate directory"
        subtitle="Search every candidate across your active hiring work."
      />
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.92)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search name, email, skills"
              value={values.q}
              onChange={(e) => setFilter('q', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth select label="Stage" value={values.stage} onChange={(e) => setFilter('stage', e.target.value)}>
              <MenuItem value="">All stages</MenuItem>
              {stages.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Minimum score"
              inputProps={{ min: 0, max: 100 }}
              value={values.minScore}
              onChange={(e) => setFilter('minScore', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            {activeCount > 0 && (
              <Button fullWidth onClick={clearFilters}>
                Clear ({activeCount})
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
      {error ? (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>}>
          {String(error)}
        </Alert>
      ) : isLoading ? (
        <LoadingRows />
      ) : candidates.length ? (
        <Stack spacing={1.5}>
          {candidates.map((candidate) => (
            <Paper
              key={candidate.id}
              className="surface-hover"
              sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.92)' }}
            >
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography fontWeight={700}>{candidate.applicant?.name || 'Unknown candidate'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {candidate.applicant?.email || '—'} · {candidate.job?.title || 'Role unavailable'}
                </Typography>
              </Box>
              <Chip color="secondary" label={`${candidate.matchScore ?? '—'} match`} />
              <Chip label={candidate.stage} sx={{ textTransform: 'capitalize' }} />
              {candidate.job && (
                <Button component={Link} to={`/recruiter/jobs/${candidate.job.id}/applications`} variant="outlined">
                  View pipeline
                </Button>
              )}
            </Paper>
          ))}
        </Stack>
      ) : (
        <EmptyState title="No candidates match these filters." text="Try broadening your search or score threshold." />
      )}
    </Page>
  );
}

export function RankingPage() {
  const { jobId } = useParams();
  const qc = useQueryClient();
  const { showToast, showError } = useToast();
  const filterDefaults = useMemo(() => ({ minScore: '0', skill: '', minExperience: '', sort: 'score_desc' }), []);
  const { values, setFilter, clearFilters, activeCount } = useUrlFilters(filterDefaults);
  const filters = {
    minScore: Number(values.minScore) || 0,
    skill: values.skill,
    minExperience: values.minExperience,
    sort: values.sort || 'score_desc',
  };
  const [actionError, setActionError] = useState('');
  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId).then((r) => r.data),
  });
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
    onError: (err) => {
      setActionError(String(err));
      showError(err);
    },
  });
  const apps = data || [];

  return (
    <Page>
      <AppBreadcrumbs
        items={[
          { label: 'Dashboard', to: '/recruiter' },
          { label: job?.title || 'Role', to: `/recruiter/jobs/${jobId}/applications` },
          { label: 'Ranking' },
        ]}
      />
      <PageHeader
        eyebrow="RANKING"
        title={job?.title ? `Shortlist · ${job.title}` : 'Shortlist with signal.'}
        subtitle="Filter by score, skills, and experience — then open evidence."
        actions={
          <Stack direction="row" spacing={1}>
            {activeCount > 0 && <Button onClick={clearFilters}>Clear filters</Button>}
            <Button component={Link} to={`/recruiter/jobs/${jobId}/applications`} variant="outlined">
              Open pipeline
            </Button>
          </Stack>
        }
      />
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.92)', position: 'sticky', top: 72, zIndex: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Minimum match: {filters.minScore}</Typography>
            <Slider
              color="secondary"
              value={filters.minScore}
              onChange={(_, v) => setFilter('minScore', String(v))}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Required skill" value={values.skill} onChange={(e) => setFilter('skill', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Min years"
              value={values.minExperience}
              onChange={(e) => setFilter('minExperience', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label="Sort" value={values.sort} onChange={(e) => setFilter('sort', e.target.value)}>
              <MenuItem value="score_desc">Highest score</MenuItem>
              <MenuItem value="newest">Newest first</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      <Typography variant="body2" color="text.secondary" mb={2} aria-live="polite">
        {isLoading ? 'Ranking candidates…' : `${apps.length} candidate${apps.length === 1 ? '' : 's'}`}
      </Typography>
      {(error || actionError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || actionError}
        </Alert>
      )}
      <Stack spacing={1.5}>
        {isLoading ? (
          <LoadingRows height={110} />
        ) : apps.length ? (
          apps.map((a) => {
            const matched = a.aiAnalysis?.skillsMatched || a.aiAnalysis?.matchedSkills || [];
            const missing = a.aiAnalysis?.skillsMissing || [];
            return (
              <Paper key={a.id || a._id} sx={{ p: 0, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.92)' }}>
                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography fontWeight={700}>{a.applicant?.name || a.applicantName || a.applicantId?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.applicant?.email || a.applicantEmail || a.applicantId?.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography color="secondary.main" fontWeight={700} fontSize={22}>
                        {a.aiAnalysis?.matchScore ?? a.matchScore ?? '—'}%
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
                        <Chip label={a.stage} sx={{ textTransform: 'capitalize' }} />
                        <Button
                          size="small"
                          startIcon={<Description />}
                          onClick={() => openResume(a.id || a._id).catch((e) => setActionError(String(e.message || e)))}
                        >
                          Resume
                        </Button>
                        <Button size="small" startIcon={<Refresh />} disabled={reanalyze.isPending} onClick={() => reanalyze.mutate(a.id || a._id)}>
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
          <EmptyState title="No candidates meet these filters." text="Widen the score threshold or skill filter." />
        )}
      </Stack>
    </Page>
  );
}
