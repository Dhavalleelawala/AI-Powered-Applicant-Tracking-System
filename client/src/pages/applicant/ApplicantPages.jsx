import { AttachFile, CloudUpload } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationsApi, authApi, jobsApi } from '../../api/client';
import { EmptyState, LoadingRows, Page, PageHeader, StageChip } from '../../components/ui/Primitives';
import { AppBreadcrumbs } from '../../components/ui/AppBreadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useBeforeUnloadWarning, useLeaveConfirm } from '../../hooks/useUnsavedWarning';

export function ApplyJobPage() {
  const { jobId } = useParams();
  const nav = useNavigate();
  const { showToast, showError } = useToast();
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const dirty = Boolean(resume || coverLetter.trim());
  useBeforeUnloadWarning(dirty);
  const { data: job, isLoading: jobLoading, error: jobError, refetch: refetchJob } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId).then((r) => r.data),
  });
  const { data: myApps } = useQuery({
    queryKey: ['applicant-applications'],
    queryFn: () => applicationsApi.mine().then((r) => r.data),
  });
  const alreadyApplied = (myApps || []).some(
    (app) => String(app.jobId) === String(jobId) || String(app.job?.id) === String(jobId)
  );

  useEffect(() => {
    if (alreadyApplied) {
      showToast('You already applied to this role');
      nav('/applicant/applications', { replace: true });
    }
  }, [alreadyApplied, nav, showToast]);

  const apply = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append('resume', resume);
      form.append('coverLetter', coverLetter);
      return applicationsApi.apply(jobId, form);
    },
    onSuccess: () => {
      showToast('Application submitted — AI review is starting');
      nav('/applicant/applications');
    },
    onError: (err) => {
      setError(String(err));
      showError(err);
    },
  });

  const acceptFile = (file) => {
    if (!file) return;
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const name = String(file.name || '').toLowerCase();
    const byExt = name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx');
    const byMime = allowed.includes(file.type);
    if ((!byMime && !byExt) || file.size > 5 * 1024 * 1024) {
      setError('Upload a PDF or DOC/DOCX smaller than 5 MB.');
      return;
    }
    setError('');
    setResume(file);
  };

  const select = (e) => acceptFile(e.target.files?.[0]);

  return (
    <Page narrow>
      <AppBreadcrumbs
        items={[
          { label: 'Jobs', to: '/jobs' },
          { label: job?.title || 'Role', to: `/jobs/${jobId}` },
          { label: 'Apply' },
        ]}
      />
      <PageHeader
        eyebrow="APPLICATION"
        title="Put yourself forward."
        subtitle={job ? `Applying to ${job.title}` : 'Add your resume and a short note for the hiring team.'}
      />
      {jobError ? (
        <Alert severity="error" action={<Button onClick={refetchJob}>Retry</Button>} sx={{ mb: 2 }}>
          {String(jobError)}
        </Alert>
      ) : null}
      {jobLoading && !job ? (
        <LinearProgress color="secondary" sx={{ mb: 2, borderRadius: 1 }} />
      ) : null}
      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!resume) return setError('A resume is required.');
          apply.mutate();
        }}
        sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.92)' }}
      >
        {apply.isPending && <LinearProgress color="secondary" sx={{ mb: 2, borderRadius: 1 }} />}
        <Stack spacing={3}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUpload />}
            aria-label="Upload resume PDF or Word document"
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            sx={{
              py: 3,
              borderStyle: 'dashed',
              justifyContent: 'flex-start',
              bgcolor: dragging || resume ? 'rgba(31,167,160,0.08)' : 'transparent',
              borderColor: dragging ? 'secondary.main' : undefined,
            }}
          >
            {resume ? resume.name : 'Drop resume here, or choose PDF/DOCX'}
            <input hidden type="file" accept=".pdf,.doc,.docx" aria-label="Resume file" onChange={select} />
          </Button>
          {resume && (
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFile fontSize="small" /> {resume.name} · {(resume.size / 1024).toFixed(0)} KB
              <Button size="small" onClick={() => setResume(null)} sx={{ ml: 1 }}>
                Remove
              </Button>
            </Typography>
          )}
          <TextField
            label="Cover letter (optional)"
            multiline
            rows={7}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="A short note on why this role fits your craft."
            helperText={`${coverLetter.length} characters`}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" color="secondary" size="large" disabled={apply.isPending}>
            {apply.isPending ? 'Submitting…' : 'Submit application'}
          </Button>
          <Button component={Link} to={`/jobs/${jobId}`}>
            Back to role
          </Button>
        </Stack>
      </Paper>
    </Page>
  );
}

const PIPELINE_STEPS = ['applied', 'interview', 'offered'];

function nextStepCopy(application) {
  const stage = application.stage || 'applied';
  const ai = application.aiStatus || 'pending';
  if (stage === 'rejected') return 'This role isn’t moving forward. Keep exploring other openings.';
  if (stage === 'offered') return 'Great news — an offer path is open. Watch your inbox for details.';
  if (stage === 'interview') return 'You’re in interview. Expect follow-up from the hiring team.';
  if (['pending', 'processing'].includes(ai)) return 'AI is scoring your resume against this role.';
  if (ai === 'failed') return 'Fit review hit a snag, but your application is still with the team.';
  return 'Waiting for the hiring team to review your application.';
}

function StageTimeline({ stage }) {
  if (stage === 'rejected') {
    return (
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Chip size="small" label="Applied" variant="outlined" />
        <Typography variant="caption" color="text.secondary">
          →
        </Typography>
        <Chip size="small" color="error" label="Rejected" />
      </Stack>
    );
  }
  const activeIndex = Math.max(0, PIPELINE_STEPS.indexOf(stage));
  return (
    <Box className="app-stage-track" aria-label={`Stage: ${stage}`}>
      {PIPELINE_STEPS.map((step, index) => {
        const done = index <= activeIndex;
        return (
          <Box key={step} className={`app-stage-step${done ? ' is-done' : ''}${index === activeIndex ? ' is-current' : ''}`}>
            <span className="app-stage-dot" />
            <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: index === activeIndex ? 700 : 500 }}>
              {step}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function ApplicationCard({ application: a }) {
  const jobId = a.job?.id || a.jobId;
  const title = a.jobTitle || a.job?.title || 'Role';
  const location = a.job?.location;
  const score = a.aiAnalysis?.matchScore;
  const matched = a.aiAnalysis?.skillsMatched || a.aiAnalysis?.matchedSkills || [];
  const missing = a.aiAnalysis?.skillsMissing || a.aiAnalysis?.gaps || [];
  const summary = a.aiAnalysis?.summary;
  const history = a.stageHistory || [];
  const reviewing = ['pending', 'processing'].includes(a.aiStatus);

  return (
    <Paper sx={{ overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.94)', p: 0 }}>
      <Box sx={{ p: { xs: 2.25, md: 2.75 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ md: 'flex-start' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              fontWeight={700}
              fontSize={18}
              component={Link}
              to={`/jobs/${jobId}`}
              sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'secondary.dark' } }}
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Applied {new Date(a.createdAt).toLocaleDateString()}
              {location ? ` · ${location}` : ''}
              {a.job?.employmentType ? ` · ${a.job.employmentType}` : ''}
            </Typography>
            <Typography variant="body2" mt={1.5} sx={{ color: 'text.primary', lineHeight: 1.55, maxWidth: 520 }}>
              {nextStepCopy(a)}
            </Typography>
            <Box mt={2}>
              <StageTimeline stage={a.stage} />
            </Box>
          </Box>

          <Stack spacing={1.25} alignItems={{ xs: 'stretch', md: 'flex-end' }} minWidth={{ md: 160 }}>
            <StageChip stage={a.stage} />
            <Box sx={{ width: '100%', maxWidth: { md: 160 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={0.5}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Fit score
                </Typography>
                <Typography variant="h3" fontSize={22} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {reviewing ? '…' : score == null ? '—' : `${score}`}
                </Typography>
              </Stack>
              {reviewing ? (
                <LinearProgress color="secondary" />
              ) : (
                <LinearProgress
                  variant="determinate"
                  color="secondary"
                  value={score == null ? 0 : Math.min(100, Number(score))}
                />
              )}
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {reviewing ? 'AI review in progress' : a.aiStatus === 'failed' ? 'Review incomplete' : a.aiStatus === 'completed' ? 'AI complete' : 'Pending review'}
              </Typography>
            </Box>
            <Button size="small" component={Link} to={`/jobs/${jobId}`} variant="outlined">
              View role
            </Button>
          </Stack>
        </Stack>

        {(matched.length > 0 || missing.length > 0) && (
          <Stack spacing={1} mt={2.5}>
            {matched.length > 0 && (
              <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mr: 0.5 }}>
                  Matched
                </Typography>
                {matched.slice(0, 6).map((skill) => (
                  <Chip key={`m-${skill}`} size="small" color="success" variant="outlined" label={skill} />
                ))}
              </Stack>
            )}
            {missing.length > 0 && (
              <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mr: 0.5 }}>
                  Gaps
                </Typography>
                {missing.slice(0, 6).map((skill) => (
                  <Chip key={`g-${skill}`} size="small" color="warning" variant="outlined" label={skill} />
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {summary && (
          <Typography variant="body2" color="text.secondary" mt={2} sx={{ lineHeight: 1.6, maxWidth: 640 }}>
            {summary}
          </Typography>
        )}
      </Box>

      {history.length > 0 && (
        <Accordion disableGutters elevation={0} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={600}>
              Stage history ({history.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {history.map((entry, index) => (
                <Stack key={`${entry.changedAt || index}-${entry.to}`} direction="row" spacing={1.25} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'secondary.main',
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                      {entry.from || '—'} → {entry.to}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}
                      {entry.note ? ` · ${entry.note}` : ''}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
}

export function MyApplicationsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['applicant-applications'],
    queryFn: () => applicationsApi.mine().then((r) => r.data),
    refetchInterval: (query) => {
      const rows = query.state.data || [];
      return rows.some((a) => ['pending', 'processing'].includes(a.aiStatus)) ? 4000 : false;
    },
  });
  const apps = data || [];
  const summary = useMemo(() => {
    const counts = { applied: 0, interview: 0, offered: 0, rejected: 0 };
    for (const app of apps) {
      if (counts[app.stage] != null) counts[app.stage] += 1;
    }
    return counts;
  }, [apps]);

  return (
    <Page>
      <PageHeader
        eyebrow="YOUR PIPELINE"
        title="My applications"
        subtitle="See fit score, stage, and what happens next — without digging."
        actions={
          <Button component={Link} to="/jobs" variant="contained" color="secondary">
            Browse roles
          </Button>
        }
      />
      {error ? (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>}>
          {String(error)}
        </Alert>
      ) : isLoading ? (
        <LoadingRows count={3} height={160} />
      ) : apps.length ? (
        <Stack spacing={2}>
          <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
            {[
              ['Total', apps.length],
              ['Interview', summary.interview],
              ['Offered', summary.offered],
              ['Rejected', summary.rejected],
            ].map(([label, value]) => (
              <Chip
                key={label}
                label={`${label}: ${value}`}
                variant={label === 'Total' ? 'filled' : 'outlined'}
                color={label === 'Total' ? 'secondary' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
          {apps.map((a) => (
            <ApplicationCard key={a.id || a._id} application={a} />
          ))}
        </Stack>
      ) : (
        <EmptyState
          title="No applications yet."
          text="Explore open roles and take the first step — your pipeline will show up here."
          actionLabel="Browse roles"
          actionTo="/jobs"
        />
      )}
    </Page>
  );
}

export function ProfilePage() {
  const { user, token, login } = useAuth();
  const { showToast, showError } = useToast();
  const [dirty, setDirty] = useState(false);
  const { requestLeave, dialog: leaveDialog } = useLeaveConfirm();
  useBeforeUnloadWarning(dirty);
  const [form, setForm] = useState(() => ({
    name: user?.name || '',
    phone: user?.phone || '',
    headline: user?.headline || '',
    location: user?.location || '',
    experienceYears: user?.experienceYears ?? 0,
    skills: (user?.skills || []).join(', '),
  }));
  const update = useMutation({
    mutationFn: (body) => authApi.updateProfile(body),
    onSuccess: (response) => {
      const updatedUser = response.data?.user || response.data;
      login({ token, user: updatedUser });
      setDirty(false);
      showToast('Profile saved');
    },
    onError: (err) => showError(err),
  });
  const set = (key) => (event) => {
    setDirty(true);
    setForm({ ...form, [key]: event.target.value });
  };

  return (
    <Page narrow>
      <PageHeader eyebrow="PROFILE" title="Your profile" subtitle="Keep your experience current for sharper matches." />
      <Paper
        component="form"
        sx={{ p: { xs: 2.5, md: 4 }, bgcolor: 'rgba(255,255,255,0.92)' }}
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.name.trim()) {
            showError('Name is required');
            return;
          }
          update.mutate({
            ...form,
            experienceYears: Number(form.experienceYears),
            skills: form.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean),
          });
        }}
      >
        <Stack spacing={2.5}>
          <TextField label="Name" required value={form.name} onChange={set('name')} />
          <TextField label="Phone" value={form.phone} onChange={set('phone')} />
          <TextField label="Professional headline" value={form.headline} onChange={set('headline')} />
          <TextField label="Location" value={form.location} onChange={set('location')} />
          <TextField
            label="Years of experience"
            type="number"
            inputProps={{ min: 0 }}
            value={form.experienceYears}
            onChange={set('experienceYears')}
          />
          <TextField label="Skills" helperText="Separate skills with commas." value={form.skills} onChange={set('skills')} />
          {update.error && <Alert severity="error">{String(update.error)}</Alert>}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button type="submit" variant="contained" color="secondary" size="large" disabled={update.isPending || !dirty}>
              {update.isPending ? 'Saving…' : dirty ? 'Save profile' : 'Saved'}
            </Button>
            {dirty && (
              <Button
                onClick={() =>
                  requestLeave(() => {
                    setForm({
                      name: user?.name || '',
                      phone: user?.phone || '',
                      headline: user?.headline || '',
                      location: user?.location || '',
                      experienceYears: user?.experienceYears ?? 0,
                      skills: (user?.skills || []).join(', '),
                    });
                    setDirty(false);
                  })
                }
              >
                Reset
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
      {leaveDialog}
    </Page>
  );
}

export function SavedJobsPage() {
  const qc = useQueryClient();
  const { token, user, login } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => authApi.savedJobs().then((response) => response.data?.jobs || response.data || []),
  });
  const toggleSaved = useMutation({
    mutationFn: authApi.toggleSavedJob,
    onSuccess: (response) => {
      const savedJobs = response.data?.savedJobs || response.data?.data?.savedJobs || [];
      login({ token, user: { ...user, savedJobs } });
      qc.invalidateQueries({ queryKey: ['saved-jobs'] });
      showToast('Saved roles updated');
    },
  });
  const jobs = data || [];

  return (
    <Page>
      <PageHeader eyebrow="SAVED" title="Saved roles" subtitle="Return to opportunities worth another look." />
      {error ? (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>}>
          {String(error)}
        </Alert>
      ) : isLoading ? (
        <LoadingRows />
      ) : jobs.length ? (
        <Stack spacing={1.5}>
          {jobs.map((job) => (
            <Paper
              key={job.id || job._id}
              className="surface-hover"
              sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.92)' }}
            >
              <Stack sx={{ flex: 1, minWidth: 220 }}>
                <Typography fontWeight={700}>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.companyName || 'Rolefit partner'} · {job.location || 'Flexible'}
                </Typography>
              </Stack>
              <Button component={Link} to={`/jobs/${job.id || job._id}`} variant="outlined">
                View role
              </Button>
              <Button color="error" disabled={toggleSaved.isPending} onClick={() => toggleSaved.mutate(job.id || job._id)}>
                Unsave
              </Button>
            </Paper>
          ))}
          {toggleSaved.error && <Alert severity="error">{String(toggleSaved.error)}</Alert>}
        </Stack>
      ) : (
        <EmptyState
          title="No saved roles yet."
          text="Save roles while you explore to find them here."
          actionLabel="Browse roles"
          actionTo="/jobs"
        />
      )}
    </Page>
  );
}
