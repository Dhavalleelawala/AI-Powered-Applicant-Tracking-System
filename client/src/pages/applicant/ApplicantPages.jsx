import { AttachFile, CloudUpload } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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

  return (
    <Page>
      <PageHeader
        eyebrow="YOUR PIPELINE"
        title="My applications"
        subtitle="A clear view of every opportunity you are pursuing."
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
        <LoadingRows count={3} />
      ) : apps.length ? (
        <Stack spacing={1.5}>
          {apps.map((a) => (
            <Paper key={a.id || a._id} sx={{ overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.92)' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                gap={2}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                sx={{ p: 2.5 }}
              >
                <Stack spacing={0.5}>
                  <Typography
                    fontWeight={700}
                    fontSize={18}
                    component={Link}
                    to={`/jobs/${a.job?.id || a.jobId}`}
                    sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'secondary.dark' } }}
                  >
                    {a.jobTitle || a.job?.title || a.jobId?.title || 'Role'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applied {new Date(a.createdAt).toLocaleDateString()} · AI review: {a.aiStatus || 'pending'}
                    {a.aiAnalysis?.matchScore != null ? ` · ${a.aiAnalysis.matchScore}% match` : ''}
                  </Typography>
                  {['pending', 'processing'].includes(a.aiStatus) && (
                    <LinearProgress color="secondary" sx={{ mt: 1, maxWidth: 220, borderRadius: 1 }} />
                  )}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button size="small" component={Link} to={`/jobs/${a.job?.id || a.jobId}`} variant="outlined">
                    View role
                  </Button>
                  <StageChip stage={a.stage} />
                </Stack>
              </Stack>
              {(a.aiAnalysis?.summary || (a.stageHistory || []).length > 0) && (
                <Accordion disableGutters elevation={0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">Details & history</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {a.aiAnalysis?.summary && (
                      <>
                        <Typography fontWeight={700}>AI summary</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
                          {a.aiAnalysis.summary}
                        </Typography>
                      </>
                    )}
                    {(a.stageHistory || []).length > 0 && (
                      <>
                        <Typography fontWeight={700} mt={2}>
                          Stage history
                        </Typography>
                        <Stack spacing={0.75} mt={1}>
                          {(a.stageHistory || []).map((entry, index) => (
                            <Typography key={`${entry.changedAt || index}-${entry.to}`} variant="body2" color="text.secondary">
                              {entry.from || '—'} → {entry.to}
                              {entry.changedAt ? ` · ${new Date(entry.changedAt).toLocaleString()}` : ''}
                              {entry.note ? ` · ${entry.note}` : ''}
                            </Typography>
                          ))}
                        </Stack>
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
            </Paper>
          ))}
        </Stack>
      ) : (
        <EmptyState
          title="No applications yet."
          text="Explore open roles and take the first step."
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
