import { Add, Archive, Description, Refresh, ArrowForward } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationsApi, hiringApi, jobsApi } from '../../api/client';
import { CandidateDrawer } from '../../components/recruiter/CandidateDrawer';
import { AppBreadcrumbs } from '../../components/ui/AppBreadcrumbs';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, LoadingRows, Page, PageHeader, SectionLabel, StatTile, FunnelBars } from '../../components/ui/Primitives';
import { useToast } from '../../context/ToastContext';
import { useHiringHotkeys } from '../../hooks/useHiringHotkeys';
import { useUrlFilters } from '../../hooks/useUrlFilters';
import { useBeforeUnloadWarning, useLeaveConfirm } from '../../hooks/useUnsavedWarning';

const ATTENTION_SECTIONS = [
  { key: 'reviewReady', title: 'Ready to advance', empty: 'No high-match applicants waiting in Applied.' },
  { key: 'aging', title: 'Aging in Applied', empty: 'No applications older than 7 days.' },
  { key: 'interviewFollowUp', title: 'Interview follow-up', empty: 'No active interviews needing a nudge.' },
  { key: 'awaitingAi', title: 'AI still scoring', empty: 'All resumes are scored.' },
];

export function DashboardPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [drawerId, setDrawerId] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [compact, setCompact] = useState(() => {
    try {
      return localStorage.getItem('rolefit_recruiter_compact') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.compact = compact ? 'true' : 'false';
    try {
      localStorage.setItem('rolefit_recruiter_compact', compact ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [compact]);
  const { data: jobsData, isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsApi.mine().then((r) => r.data),
  });
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useQuery({
    queryKey: ['recruiter-analytics'],
    queryFn: () => hiringApi.analytics().then((r) => r.data),
  });
  const {
    data: attention,
    isLoading: attentionLoading,
    error: attentionError,
    refetch: refetchAttention,
  } = useQuery({
    queryKey: ['recruiter-attention'],
    queryFn: () => hiringApi.attention().then((r) => r.data),
    refetchInterval: 12000,
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
  const attentionTotal =
    (attention?.totals?.reviewReady || 0) +
    (attention?.totals?.aging || 0) +
    (attention?.totals?.interviewFollowUp || 0) +
    (attention?.totals?.awaitingAi || 0);

  return (
    <Page maxWidth="xl">
      <PageHeader
        eyebrow="RECRUITER"
        title="What needs a decision."
        subtitle="Start with the queue — then open pipelines for deeper work."
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => setCompact((value) => !value)}
              aria-pressed={compact}
            >
              {compact ? 'Comfortable' : 'Compact'}
            </Button>
            <Button component={Link} to="/recruiter/candidates" variant="outlined">
              Directory
            </Button>
            <Button component={Link} to="/recruiter/jobs/new" variant="contained" color="secondary" startIcon={<Add />}>
              Create a job
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2}>
        {[
          ['Needs attention', attentionLoading ? '—' : attentionTotal],
          ['Open vacancies', summary.openVacancies],
          ['Total applications', summary.totalApplications],
          ['Aging over 7 days', summary.agingApplications],
          ['Fill progress', `${summary.fillProgressPercent ?? 0}%`],
        ].map(([label, n]) => (
          <Grid item xs={12} sm={6} md={4} lg key={label}>
            <StatTile label={label} value={isLoading && label !== 'Needs attention' ? '—' : n} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 2.5, md: 3.25 }, mt: 2.5, bgcolor: 'rgba(255,255,255,0.96)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={2} gap={1}>
          <Box>
            <SectionLabel>Needs attention</SectionLabel>
            <Typography variant="body2" color="text.secondary">
              Candidates waiting on your next move — open a brief without leaving the dashboard.
            </Typography>
          </Box>
          {attentionError && (
            <Button size="small" onClick={refetchAttention}>
              Retry queue
            </Button>
          )}
        </Stack>
        {attentionLoading && !attention ? (
          <Stack spacing={1}>
            <Skeleton height={64} />
            <Skeleton height={64} />
          </Stack>
        ) : attentionError ? (
          <ErrorState error={attentionError} onRetry={refetchAttention} title="Couldn’t load attention queue" />
        ) : attentionTotal === 0 ? (
          <Typography color="text.secondary">Queue is clear. New applicants will land here first.</Typography>
        ) : (
          <Stack spacing={2.5}>
            {ATTENTION_SECTIONS.map(({ key, title, empty }) => {
              const rows = attention?.[key] || [];
              if (!rows.length) return null;
              return (
                <Box key={key}>
                  <Typography fontWeight={700} mb={1}>
                    {title}
                    <Typography component="span" color="text.secondary" fontWeight={600} ml={1}>
                      {attention?.totals?.[key] ?? rows.length}
                    </Typography>
                  </Typography>
                  <Stack spacing={1} className="stagger-in">
                    {rows.map((item) => (
                      <Box
                        key={item.id}
                        className="attention-row"
                        onClick={() => setDrawerId(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setDrawerId(item.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={700}>{item.applicant?.name || 'Candidate'}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {item.job?.title || 'Role'} · {item.reason}
                          </Typography>
                        </Box>
                        <Chip size="small" label={item.stage} sx={{ textTransform: 'capitalize' }} />
                        <Chip
                          size="small"
                          color="secondary"
                          variant="outlined"
                          label={item.matchScore != null ? `${item.matchScore}%` : '—'}
                        />
                        <Button
                          size="small"
                          endIcon={<ArrowForward />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerId(item.id);
                          }}
                        >
                          Review
                        </Button>
                      </Box>
                    ))}
                    {rows.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {empty}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3.25 }, mt: 2.5, bgcolor: 'rgba(255,255,255,0.92)' }}>
        <SectionLabel>Hiring funnel</SectionLabel>
        {isLoading ? (
          <Skeleton variant="rounded" height={140} />
        ) : (
          <FunnelBars funnel={summary.funnel} />
        )}
      </Paper>

      {error ? (
        <ErrorState
          error={error}
          title="Couldn’t load hiring data"
          onRetry={() => {
            refetchJobs();
            refetchAnalytics();
          }}
          sx={{ mt: 3 }}
        />
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
      <CandidateDrawer
        applicationId={drawerId}
        open={Boolean(drawerId)}
        onClose={() => setDrawerId(null)}
        invalidateKeys={[['recruiter-jobs']]}
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
  const [step, setStep] = useState(0);
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
      showToast(editing ? 'Role updated' : form.status === 'draft' ? 'Draft saved' : 'Role published');
      nav('/recruiter');
    },
    onError: (err) => showError(err),
  });
  const set = (key) => (e) => {
    setDirty(true);
    setForm({ ...form, [key]: e.target.value });
  };

  const skills = form.requiredSkills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const steps = ['Basics', 'Skills', 'Hiring', 'Review'];

  const validateStep = (index) => {
    if (index === 0) {
      if (!form.title.trim()) return 'Job title is required';
      if (!form.location.trim()) return 'Location is required';
      if (String(form.description || '').trim().length < 50) {
        return 'Description needs at least 50 characters for quality AI matching.';
      }
    }
    if (index === 1 && skills.length < 1) return 'Add at least one required skill';
    if (index === 2) {
      const min = Number(form.experienceYearsMin);
      const max = Number(form.experienceYearsMax);
      if (max < min) return 'Maximum years must be at least the minimum';
      if (Number(form.openings) < 1) return 'Openings must be at least 1';
    }
    return '';
  };

  const goNext = () => {
    const problem = validateStep(step);
    if (problem) {
      showError(problem);
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submit = (e) => {
    e.preventDefault();
    for (let i = 0; i < steps.length - 1; i += 1) {
      const problem = validateStep(i);
      if (problem) {
        showError(problem);
        setStep(i);
        return;
      }
    }
    save.mutate({
      ...form,
      requiredSkills: skills,
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
    <Page>
      <AppBreadcrumbs
        items={[
          { label: 'Dashboard', to: '/recruiter' },
          { label: editing ? 'Edit role' : 'New role' },
        ]}
      />
      <PageHeader
        eyebrow={editing ? 'EDIT ROLE' : 'NEW ROLE'}
        title={editing ? 'Refine the role.' : 'Open a new role.'}
        subtitle="Guided steps — see how candidates will read it on the board."
      />

      <Box className="apply-stepper" role="list" aria-label="Job authoring steps" sx={{ mb: 2.5, maxWidth: 820 }}>
        {steps.map((label, index) => (
          <Box
            key={label}
            role="listitem"
            className={`apply-stepper__item${index === step ? ' is-active' : ''}${index < step ? ' is-done' : ''}`}
            onClick={() => {
              if (index < step) setStep(index);
            }}
            sx={{ cursor: index < step ? 'pointer' : 'default' }}
          >
            {index + 1}. {label}
          </Box>
        ))}
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
        <Paper
          component="form"
          onSubmit={submit}
          sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: 'rgba(255,255,255,0.96)', flex: 1, minWidth: 0, maxWidth: 720 }}
        >
          {step === 0 && (
            <Stack spacing={2.5}>
              <Typography variant="h3">Basics</Typography>
              <Typography variant="body2" color="text.secondary">
                Title and story first — this is what candidates see before they apply.
              </Typography>
              <TextField label="Job title" required value={form.title} onChange={set('title')} placeholder="Senior frontend engineer" />
              <TextField label="Location" required value={form.location} onChange={set('location')} placeholder="Bengaluru / Remote" />
              <TextField label="Department" value={form.department} onChange={set('department')} placeholder="Engineering" />
              <TextField
                label="Job description"
                multiline
                minRows={8}
                required
                value={form.description}
                onChange={set('description')}
                helperText={`${String(form.description || '').trim().length}/50+ characters for AI matching.`}
              />
            </Stack>
          )}

          {step === 1 && (
            <Stack spacing={2.5}>
              <Typography variant="h3">Skills & experience</Typography>
              <Typography variant="body2" color="text.secondary">
                These skills power ranking — be specific, not exhaustive.
              </Typography>
              <TextField
                label="Required skills"
                required
                helperText="Comma-separated. Shown on the public board and used for AI match."
                value={form.requiredSkills}
                onChange={set('requiredSkills')}
                placeholder="react, typescript, system design"
              />
              {skills.length > 0 && (
                <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
                  {skills.map((skill) => (
                    <Chip key={skill} size="small" label={skill} color="secondary" variant="outlined" />
                  ))}
                </Stack>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Minimum years"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={form.experienceYearsMin}
                  onChange={set('experienceYearsMin')}
                  fullWidth
                />
                <TextField
                  label="Maximum years"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={form.experienceYearsMax}
                  onChange={set('experienceYearsMax')}
                  fullWidth
                />
              </Stack>
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={2.5}>
              <Typography variant="h3">Hiring preferences</Typography>
              <Typography variant="body2" color="text.secondary">
                Urgency and openings help your team prioritize this role.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Openings"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={form.openings}
                  onChange={set('openings')}
                  fullWidth
                />
                <TextField label="Priority" select value={form.priority} onChange={set('priority')} fullWidth>
                  {['low', 'medium', 'high', 'critical'].map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TextField label="Employment type" select value={form.employmentType} onChange={set('employmentType')}>
                {['full-time', 'part-time', 'contract', 'internship'].map((x) => (
                  <MenuItem value={x} key={x}>
                    {x}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Closes at"
                type="date"
                value={form.closesAt}
                onChange={set('closesAt')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="Status" select value={form.status} onChange={set('status')}>
                {['draft', 'open'].map((x) => (
                  <MenuItem value={x} key={x}>
                    {x === 'open' ? 'Open (public)' : 'Draft (private)'}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}

          {step === 3 && (
            <Stack spacing={2.5}>
              <Typography variant="h3">Review & publish</Typography>
              <Typography variant="body2" color="text.secondary">
                Confirm the preview on the right, then save. You can edit anytime from the dashboard.
              </Typography>
              <Alert severity="info">
                <strong>{form.title || 'Untitled role'}</strong> will be saved as{' '}
                <strong>{form.status === 'open' ? 'open on the public board' : 'a private draft'}</strong>
                {skills.length ? ` · ${skills.length} skill${skills.length === 1 ? '' : 's'}` : ''}.
              </Alert>
              <Stack spacing={0.75}>
                {[
                  ['Location', form.location || '—'],
                  ['Department', form.department || '—'],
                  ['Type', form.employmentType],
                  ['Experience', `${form.experienceYearsMin}–${form.experienceYearsMax} years`],
                  ['Openings', form.openings],
                  ['Priority', form.priority],
                ].map(([label, value]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} textAlign="right">
                      {value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}

          {save.error && <ErrorState error={save.error} title="Couldn’t save role" sx={{ mt: 2 }} />}

          <Stack direction="row" spacing={1.5} justifyContent="space-between" mt={3.5} pt={2.5} borderTop="1px solid" borderColor="divider">
            <Button
              onClick={() => {
                if (step === 0) goBack();
                else setStep((current) => current - 1);
              }}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < steps.length - 1 ? (
              <Button variant="contained" color="secondary" onClick={goNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" color="secondary" variant="contained" size="large" disabled={save.isPending}>
                {save.isPending
                  ? 'Saving…'
                  : editing
                    ? 'Save changes'
                    : form.status === 'draft'
                      ? 'Save draft'
                      : 'Publish role'}
              </Button>
            )}
          </Stack>
        </Paper>

        <Box
          component="aside"
          aria-label="Public board preview"
          sx={{
            width: { lg: 340 },
            flexShrink: 0,
            position: { lg: 'sticky' },
            top: { lg: 88 },
            alignSelf: 'stretch',
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={700} mb={1.25}>
            Board preview
          </Typography>
          <Paper className="job-author-preview" sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.96)' }}>
            <Typography
              sx={{
                fontFamily: 'Outfit',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                fontSize: '1.2rem',
                lineHeight: 1.2,
              }}
            >
              {form.title.trim() || 'Role title'}
            </Typography>
            <Typography color="text.secondary" mt={0.75} sx={{ fontSize: 14 }}>
              Your company
              <Box component="span" sx={{ mx: 0.85, opacity: 0.45 }}>
                ·
              </Box>
              {form.location.trim() || 'Location'}
              <Box component="span" sx={{ mx: 0.85, opacity: 0.45 }}>
                ·
              </Box>
              {form.employmentType || 'full-time'}
              {form.department ? (
                <>
                  <Box component="span" sx={{ mx: 0.85, opacity: 0.45 }}>
                    ·
                  </Box>
                  {form.department}
                </>
              ) : null}
            </Typography>
            {(skills.length > 0 || (form.priority && form.priority !== 'medium')) && (
              <Stack direction="row" gap={0.75} mt={1.5} flexWrap="wrap" useFlexGap>
                {form.priority && form.priority !== 'medium' && (
                  <Chip
                    size="small"
                    color={form.priority === 'critical' ? 'error' : form.priority === 'high' ? 'warning' : 'default'}
                    label={form.priority}
                  />
                )}
                {skills.slice(0, 5).map((skill) => (
                  <Chip key={skill} size="small" label={skill} variant="outlined" />
                ))}
              </Stack>
            )}
            <Typography variant="body2" color="text.secondary" mt={1.75} sx={{ lineHeight: 1.6 }}>
              {form.description.trim()
                ? `${form.description.trim().slice(0, 140)}${form.description.trim().length > 140 ? '…' : ''}`
                : 'Description preview appears here as you write.'}
            </Typography>
            <Typography
              sx={{
                mt: 2,
                color: 'secondary.dark',
                fontWeight: 700,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              View role <ArrowForward sx={{ fontSize: 16 }} />
            </Typography>
          </Paper>
          <Typography variant="caption" color="text.secondary" display="block" mt={1.25}>
            Matches the editorial list on /jobs — not a separate card style.
          </Typography>
        </Box>
      </Stack>
      {leaveDialog}
    </Page>
  );
}

const stages = ['applied', 'interview', 'offered', 'rejected'];
const nextStageOf = { applied: 'interview', interview: 'offered', offered: null, rejected: null };

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

function PipelineCard({
  application: a,
  stage,
  selected,
  onToggle,
  onAdvance,
  onReject,
  onDropStage,
  notes,
  setNote,
  onAddNote,
  notePending,
  movePending,
  onResume,
  onOpen,
  flashing,
}) {
  const id = a.id || a._id;
  const [openNotes, setOpenNotes] = useState(false);
  const [dragging, setDragging] = useState(false);
  const next = nextStageOf[stage];
  const name = a.applicant?.name || a.applicantName || a.applicantId?.name || 'Candidate';
  const email = a.applicant?.email || a.applicantEmail || a.applicantId?.email || '';
  const score = a.aiAnalysis?.matchScore ?? a.matchScore;
  const recentNotes = (a.recruiterNotes || []).slice(-2);

  return (
    <Paper
      className={`pipeline-card${dragging ? ' is-dragging' : ''}${flashing ? ' is-flash' : ''}`}
      data-hiring-card
      data-application-id={id}
      data-stage={stage}
      data-next-stage={next || ''}
      role="article"
      tabIndex={0}
      aria-label={`${name}, ${stage}${score != null ? `, ${score}% match` : ''}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('applicationId', id);
        event.dataTransfer.setData('fromStage', stage);
        event.dataTransfer.effectAllowed = 'move';
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          onOpen?.();
        }
      }}
      sx={{ p: 1.5, bgcolor: '#fff', borderColor: selected ? 'secondary.main' : 'divider' }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={0.5}>
        <Checkbox
          size="small"
          checked={selected}
          onChange={onToggle}
          inputProps={{ 'aria-label': `Select ${name}` }}
          sx={{ p: 0.25, mt: -0.25 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight={700}
            fontSize={14}
            noWrap
            title={name}
            onClick={onOpen}
            sx={{ cursor: onOpen ? 'pointer' : 'default', '&:hover': onOpen ? { color: 'secondary.dark' } : undefined }}
          >
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', display: 'block' }}>
            {email}
          </Typography>
        </Box>
        <Chip label={score == null ? '—' : `${score}`} color="secondary" size="small" sx={{ height: 22, fontSize: 11 }} />
      </Stack>

      <Stack direction="row" spacing={0.75} mt={1.25} flexWrap="wrap" useFlexGap>
        {next && (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
            disabled={movePending}
            onClick={() => onAdvance(a, next)}
            sx={{ py: 0.25, px: 1, fontSize: 12, minHeight: 28 }}
          >
            {next}
          </Button>
        )}
        {stage !== 'rejected' && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={movePending}
            onClick={() => onReject(a)}
            sx={{ py: 0.25, px: 1, fontSize: 12, minHeight: 28 }}
          >
            Reject
          </Button>
        )}
        <Button
          size="small"
          startIcon={<Description sx={{ fontSize: 14 }} />}
          onClick={() => onResume(id)}
          sx={{ py: 0.25, px: 1, fontSize: 12, minHeight: 28 }}
        >
          Resume
        </Button>
      </Stack>

      <TextField
        select
        size="small"
        value={stage}
        onChange={(e) => onDropStage(a, e.target.value)}
        sx={{ mt: 1.25, width: '100%' }}
        inputProps={{ 'aria-label': `Move ${name}` }}
      >
        {stages.map((s) => (
          <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
            {s}
          </MenuItem>
        ))}
      </TextField>

      <Button
        size="small"
        onClick={() => setOpenNotes((v) => !v)}
        endIcon={<ExpandMoreIcon sx={{ transform: openNotes ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />}
        sx={{ mt: 0.75, px: 0.5, fontSize: 12 }}
      >
        Notes{recentNotes.length ? ` (${recentNotes.length})` : ''}
      </Button>
      <Collapse in={openNotes}>
        <Stack spacing={0.75} mt={0.5}>
          {recentNotes.map((note) => (
            <Typography key={note._id || note.createdAt} variant="caption" color="text.secondary">
              {note.text}
            </Typography>
          ))}
          <Stack direction="row" spacing={0.75}>
            <TextField
              size="small"
              placeholder="Add note"
              value={notes[id] || ''}
              onChange={(e) => setNote(id, e.target.value)}
              fullWidth
            />
            <Button
              size="small"
              disabled={!notes[id]?.trim() || notePending}
              onClick={() => onAddNote(id, notes[id])}
            >
              Add
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Paper>
  );
}

export function PipelinePage() {
  const { jobId } = useParams();
  const qc = useQueryClient();
  const { showToast, showError } = useToast();
  const [selected, setSelected] = useState([]);
  const [notes, setNotes] = useState({});
  const [rejectTarget, setRejectTarget] = useState(null);
  const [dropStage, setDropStage] = useState(null);
  const [drawerId, setDrawerId] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const [showKeys, setShowKeys] = useState(true);
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
    onSuccess: (_data, variables) => {
      setSelected([]);
      setRejectTarget(null);
      setFlashId(variables.id);
      window.setTimeout(() => setFlashId(null), 600);
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      qc.invalidateQueries({ queryKey: ['recruiter-attention'] });
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
  const byStage = useMemo(() => {
    const map = Object.fromEntries(stages.map((s) => [s, []]));
    for (const app of apps) {
      const stage = stages.includes(app.stage) ? app.stage : 'applied';
      map[stage].push(app);
    }
    return map;
  }, [apps]);

  const toggleSelected = (id) =>
    setSelected((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]));

  const requestStageChange = (application, nextStage) => {
    if (nextStage === application.stage) return;
    if (nextStage === 'rejected') {
      setRejectTarget(application);
      return;
    }
    move.mutate({ id: application.id || application._id, stage: nextStage });
  };

  const findApp = useCallback(
    (id) => apps.find((row) => String(row.id || row._id) === String(id)),
    [apps],
  );

  useHiringHotkeys({
    enabled: !isLoading && apps.length > 0,
    drawerOpen: Boolean(drawerId),
    onCloseDrawer: () => setDrawerId(null),
    onToggleHelp: () => setShowKeys((current) => !current),
    onOpen: (id) => setDrawerId(id),
    onAdvance: (id, next) => {
      const application = findApp(id);
      if (application) requestStageChange(application, next);
    },
    onReject: (id) => {
      const application = findApp(id);
      if (application) setRejectTarget(application);
    },
  });

  const onColumnDrop = (stage, event) => {
    event.preventDefault();
    setDropStage(null);
    const applicationId = event.dataTransfer.getData('applicationId');
    const fromStage = event.dataTransfer.getData('fromStage');
    if (!applicationId || fromStage === stage) return;
    const application = apps.find((row) => String(row.id || row._id) === String(applicationId));
    if (!application) return;
    requestStageChange(application, stage);
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
        subtitle="Drag cards between columns, or advance in one click. Focus a card and use keyboard shortcuts."
        actions={
          <Button component={Link} to={`/recruiter/jobs/${jobId}/ranking`} variant="outlined">
            Open ranking
          </Button>
        }
      />
      {showKeys && (
        <Alert
          severity="info"
          onClose={() => setShowKeys(false)}
          sx={{ mb: 2, bgcolor: 'rgba(18,21,28,0.04)' }}
          className="hiring-keys-hint"
        >
          <Typography variant="body2" component="span">
            Keyboard: focus a card, then <strong>A</strong> advance · <strong>R</strong> reject ·{' '}
            <strong>Enter</strong> open drawer · <strong>Esc</strong> close drawer · <strong>?</strong> toggle this tip
          </Typography>
        </Alert>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} mb={2.5}>
        <Button variant="contained" color="secondary" disabled={!selected.length || bulkMove.isPending} onClick={() => bulkMove.mutate(selected)}>
          Move selected to Interview ({selected.length})
        </Button>
        <Typography variant="body2" color="text.secondary">
          {isLoading ? 'Loading…' : `${apps.length} candidate${apps.length === 1 ? '' : 's'}`}
        </Typography>
        {(move.error || addNote.error || bulkMove.error) && (
          <ErrorState error={move.error || addNote.error || bulkMove.error} title="Action failed" />
        )}
      </Stack>
      {error && <ErrorState error={error} title="Couldn’t load pipeline" sx={{ mb: 2 }} />}
      {!isLoading && apps.length === 0 ? (
        <EmptyState
          title="No applications yet."
          text="Share this role on the public board to start collecting candidates."
          actionLabel="View public role"
          actionTo={`/jobs/${jobId}`}
        />
      ) : (
        <Box className="pipeline-board" role="list">
          {stages.map((stage) => {
            const columnApps = byStage[stage] || [];
            return (
              <Paper
                key={stage}
                className={`pipeline-column${dropStage === stage ? ' is-drop-target' : ''}`}
                role="listitem"
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  setDropStage(stage);
                }}
                onDragLeave={() => setDropStage((current) => (current === stage ? null : current))}
                onDrop={(event) => onColumnDrop(stage, event)}
                sx={{ p: 1.75, minHeight: 440, border: '1px solid', borderColor: 'divider' }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="h3" fontSize={16} sx={{ textTransform: 'capitalize' }}>
                    {stage}
                  </Typography>
                  <Chip size="small" label={isLoading ? '…' : columnApps.length} />
                </Stack>
                <Stack spacing={1.1}>
                  {isLoading ? (
                    <>
                      <Skeleton variant="rounded" height={96} />
                      <Skeleton variant="rounded" height={96} />
                    </>
                  ) : columnApps.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2.5, px: 0.5, textAlign: 'center' }}>
                      Drop candidates here
                    </Typography>
                  ) : (
                    columnApps.map((a) => {
                      const id = a.id || a._id;
                      return (
                        <PipelineCard
                          key={id}
                          application={a}
                          stage={stage}
                          selected={selected.includes(id)}
                          onToggle={() => toggleSelected(id)}
                          onAdvance={requestStageChange}
                          onReject={(app) => setRejectTarget(app)}
                          onDropStage={requestStageChange}
                          notes={notes}
                          setNote={(cardId, text) => setNotes((current) => ({ ...current, [cardId]: text }))}
                          onAddNote={(cardId, text) => addNote.mutate({ id: cardId, text })}
                          notePending={addNote.isPending}
                          movePending={move.isPending}
                          onResume={(cardId) => openResume(cardId).catch((err) => showError(err.message || err))}
                          onOpen={() => setDrawerId(id)}
                          flashing={flashId === id}
                        />
                      );
                    })
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}
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
      <CandidateDrawer
        applicationId={drawerId}
        open={Boolean(drawerId)}
        onClose={() => setDrawerId(null)}
        invalidateKeys={[['job-applications', jobId], ['recruiter-attention']]}
      />
    </Page>
  );
}

export function CandidatesPage() {
  const { showError } = useToast();
  const [drawerId, setDrawerId] = useState(null);
  const filterDefaults = useMemo(() => ({ q: '', stage: '', minScore: '', page: '1' }), []);
  const { values, setFilter, clearFilters, activeCount } = useUrlFilters(filterDefaults);
  const page = Math.max(1, Number(values.page) || 1);
  const params = {
    q: values.q || undefined,
    stage: values.stage || undefined,
    minScore: values.minScore === '' ? undefined : Number(values.minScore),
    page,
    limit: 20,
  };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['company-candidates', params],
    queryFn: () =>
      hiringApi.candidates(params).then((r) => ({
        candidates: r.data || [],
        meta: r.meta || { page: 1, totalPages: 1, total: 0 },
      })),
  });
  const candidates = data?.candidates || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

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
              onChange={(e) => {
                setFilter('q', e.target.value);
                setFilter('page', '1');
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Stage"
              value={values.stage}
              onChange={(e) => {
                setFilter('stage', e.target.value);
                setFilter('page', '1');
              }}
            >
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
              onChange={(e) => {
                setFilter('minScore', e.target.value);
                setFilter('page', '1');
              }}
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
        <ErrorState error={error} onRetry={refetch} title="Couldn’t load candidates" />
      ) : isLoading ? (
        <LoadingRows />
      ) : candidates.length ? (
        <Stack spacing={1.5} className="stagger-in">
          <Typography variant="body2" color="text.secondary">
            {meta.total} candidate{meta.total === 1 ? '' : 's'}
            {meta.totalPages > 1 ? ` · Page ${meta.page} of ${meta.totalPages}` : ''}
          </Typography>
          {candidates.map((candidate) => (
            <Paper
              key={candidate.id}
              className="surface-hover"
              sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.92)' }}
            >
              <Box
                sx={{ flex: 1, minWidth: 220, cursor: 'pointer' }}
                onClick={() => setDrawerId(candidate.id)}
              >
                <Typography fontWeight={700}>{candidate.applicant?.name || 'Unknown candidate'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {candidate.applicant?.email || '—'} · {candidate.job?.title || 'Role unavailable'}
                </Typography>
                {candidate.applicant?.headline && (
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {candidate.applicant.headline}
                  </Typography>
                )}
                {(candidate.applicant?.skills || []).length > 0 && (
                  <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap mt={1}>
                    {candidate.applicant.skills.slice(0, 5).map((skill) => (
                      <Chip key={skill} size="small" label={skill} variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Box>
              <Chip color="secondary" label={`${candidate.matchScore ?? '—'} match`} />
              <Chip label={candidate.stage} sx={{ textTransform: 'capitalize' }} />
              {candidate.aiStatus && (
                <Chip size="small" label={`AI: ${candidate.aiStatus}`} variant="outlined" />
              )}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="contained" color="secondary" onClick={() => setDrawerId(candidate.id)}>
                  Review
                </Button>
                <Button
                  size="small"
                  startIcon={<Description />}
                  onClick={() => openResume(candidate.id).catch((err) => showError(err.message || err))}
                >
                  Resume
                </Button>
                {candidate.job && (
                  <>
                    <Button component={Link} to={`/recruiter/jobs/${candidate.job.id}/applications`} variant="outlined" size="small">
                      Pipeline
                    </Button>
                    <Button component={Link} to={`/recruiter/jobs/${candidate.job.id}/ranking`} variant="outlined" size="small">
                      Ranking
                    </Button>
                  </>
                )}
              </Stack>
            </Paper>
          ))}
          {meta.totalPages > 1 && (
            <Stack direction="row" spacing={1} justifyContent="center" pt={1}>
              <Button disabled={meta.page <= 1} onClick={() => setFilter('page', String(meta.page - 1))}>
                Previous
              </Button>
              <Button disabled={meta.page >= meta.totalPages} onClick={() => setFilter('page', String(meta.page + 1))}>
                Next
              </Button>
            </Stack>
          )}
        </Stack>
      ) : (
        <EmptyState
          title="No candidates match these filters."
          text={activeCount ? 'Try broadening your search or score threshold.' : 'Share an open role to start receiving applications.'}
          actionLabel={activeCount ? 'Clear filters' : 'Open dashboard'}
          actionTo={activeCount ? undefined : '/recruiter'}
          onAction={activeCount ? clearFilters : undefined}
        />
      )}
      <CandidateDrawer
        applicationId={drawerId}
        open={Boolean(drawerId)}
        onClose={() => setDrawerId(null)}
        invalidateKeys={[['company-candidates'], ['recruiter-attention']]}
      />
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
  const [drawerId, setDrawerId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [showKeys, setShowKeys] = useState(true);
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
  const move = useMutation({
    mutationFn: ({ id, stage, rejectionReason }) => applicationsApi.move(id, { stage, rejectionReason }),
    onSuccess: () => {
      setRejectTarget(null);
      qc.invalidateQueries({ queryKey: ['job-applications', jobId] });
      qc.invalidateQueries({ queryKey: ['recruiter-attention'] });
      showToast('Candidate stage updated');
    },
    onError: (err) => showError(err),
  });
  const apps = data || [];

  const findRankedApp = useCallback(
    (id) => apps.find((row) => String(row.id || row._id) === String(id)),
    [apps],
  );

  useHiringHotkeys({
    enabled: !isLoading && apps.length > 0,
    drawerOpen: Boolean(drawerId),
    onCloseDrawer: () => setDrawerId(null),
    onToggleHelp: () => setShowKeys((current) => !current),
    onOpen: (id) => setDrawerId(id),
    onAdvance: (id, next) => {
      const application = findRankedApp(id);
      if (!application || application.stage === next) return;
      if (next === 'rejected') {
        setRejectTarget(application);
        return;
      }
      move.mutate({ id, stage: next });
    },
    onReject: (id) => {
      const application = findRankedApp(id);
      if (application) setRejectTarget(application);
    },
  });

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
        title={job?.title ? `Why they match · ${job.title}` : 'Shortlist with signal.'}
        subtitle="Score, evidence, and the next stage — without opening another page."
        actions={
          <Stack direction="row" spacing={1}>
            {activeCount > 0 && <Button onClick={clearFilters}>Clear filters</Button>}
            <Button component={Link} to={`/recruiter/jobs/${jobId}/applications`} variant="outlined">
              Open pipeline
            </Button>
          </Stack>
        }
      />
      {showKeys && (
        <Alert
          severity="info"
          onClose={() => setShowKeys(false)}
          sx={{ mb: 2, bgcolor: 'rgba(18,21,28,0.04)' }}
          className="hiring-keys-hint"
        >
          <Typography variant="body2" component="span">
            Keyboard: focus a row, then <strong>A</strong> advance · <strong>R</strong> reject ·{' '}
            <strong>Enter</strong> open · <strong>Esc</strong> close drawer · <strong>?</strong> toggle tip
          </Typography>
        </Alert>
      )}
      <Paper
        className="filter-bar filter-bar--sticky"
        sx={{ p: 2.5, mb: 3, bgcolor: 'rgba(255,255,255,0.92)', top: 64 }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography gutterBottom variant="body2" fontWeight={700}>
              Minimum match: {filters.minScore}%
            </Typography>
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
        <ErrorState error={error || actionError} title="Couldn’t load ranking" sx={{ mb: 2 }} />
      )}
      <Stack spacing={1.75} className="stagger-in">
        {isLoading ? (
          <LoadingRows height={140} />
        ) : apps.length ? (
          apps.map((a, index) => {
            const id = a.id || a._id;
            const matched = a.aiAnalysis?.skillsMatched || a.aiAnalysis?.matchedSkills || [];
            const missing = a.aiAnalysis?.skillsMissing || a.aiAnalysis?.gaps || [];
            const score = a.aiAnalysis?.matchScore ?? a.matchScore;
            const stage = a.stage || 'applied';
            const next = nextStageOf[stage];
            const name = a.applicant?.name || a.applicantName || a.applicantId?.name || 'Candidate';
            const email = a.applicant?.email || a.applicantEmail || a.applicantId?.email || '';
            const summary = a.aiAnalysis?.summary;
            const reviewing = ['pending', 'processing'].includes(a.aiStatus);

            return (
              <Paper
                key={id}
                className="ranking-card"
                data-hiring-card
                data-application-id={id}
                data-stage={stage}
                data-next-stage={nextStageOf[stage] || ''}
                role="article"
                tabIndex={0}
                aria-label={`${name}, ${score != null ? `${score}% match` : 'score pending'}, ${stage}`}
                sx={{ p: { xs: 2.25, md: 2.75 }, bgcolor: 'rgba(255,255,255,0.96)' }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'flex-start' }}>
                  <Box sx={{ width: { md: 88 }, flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        fontSize: { xs: 28, md: 32 },
                        letterSpacing: '-0.04em',
                        color: 'secondary.main',
                        lineHeight: 1,
                      }}
                    >
                      {score != null ? `${score}` : '—'}
                      {score != null && (
                        <Typography component="span" color="text.secondary" fontWeight={600} fontSize={16}>
                          %
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      #{index + 1} · AI {a.aiStatus || 'pending'}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={0.5}>
                      <Typography
                        fontWeight={700}
                        fontSize={17}
                        sx={{ cursor: 'pointer', '&:hover': { color: 'secondary.dark' } }}
                        onClick={() => setDrawerId(id)}
                      >
                        {name}
                      </Typography>
                      <Chip size="small" label={stage} sx={{ textTransform: 'capitalize' }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {email}
                      {a.applicant?.headline ? ` · ${a.applicant.headline}` : ''}
                    </Typography>

                    {summary ? (
                      <Typography variant="body2" mt={1.5} sx={{ lineHeight: 1.65, maxWidth: 640 }}>
                        {summary}
                      </Typography>
                    ) : reviewing ? (
                      <Typography variant="body2" color="text.secondary" mt={1.5}>
                        AI is still scoring this resume against the role.
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" mt={1.5}>
                        No AI brief yet — open the candidate or re-score.
                      </Typography>
                    )}

                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap mt={1.75}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.75}>
                          Why they fit
                        </Typography>
                        <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
                          {matched.length ? (
                            matched.slice(0, 6).map((skill) => (
                              <Chip key={skill} size="small" color="success" variant="outlined" label={skill} />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No matched skills listed
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.75}>
                          Gaps
                        </Typography>
                        <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
                          {missing.length ? (
                            missing.slice(0, 6).map((skill) => (
                              <Chip key={skill} size="small" color="warning" variant="outlined" label={skill} />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No gaps flagged
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>

                  <Stack spacing={1} sx={{ flexShrink: 0, minWidth: { md: 160 } }}>
                    {next && (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        endIcon={<ArrowForward />}
                        disabled={move.isPending}
                        onClick={() => move.mutate({ id, stage: next })}
                      >
                        Advance to {next}
                      </Button>
                    )}
                    <Button size="small" variant="outlined" onClick={() => setDrawerId(id)}>
                      Review brief
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Description />}
                      onClick={() => openResume(id).catch((e) => setActionError(String(e.message || e)))}
                    >
                      Resume
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Refresh />}
                      disabled={reanalyze.isPending}
                      onClick={() => reanalyze.mutate(id)}
                    >
                      Re-score
                    </Button>
                    {stage !== 'rejected' && (
                      <Button size="small" color="error" disabled={move.isPending} onClick={() => setRejectTarget(a)}>
                        Reject
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })
        ) : (
          <EmptyState title="No candidates meet these filters." text="Widen the score threshold or skill filter." />
        )}
      </Stack>

      <CandidateDrawer
        applicationId={drawerId}
        open={Boolean(drawerId)}
        onClose={() => setDrawerId(null)}
        invalidateKeys={[['job-applications', jobId], ['recruiter-attention']]}
      />
      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Reject this candidate?"
        description={
          rejectTarget
            ? `${rejectTarget.applicant?.name || rejectTarget.applicantName || 'This candidate'} will move to Rejected.`
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
