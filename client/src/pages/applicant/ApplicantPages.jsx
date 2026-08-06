import { AttachFile, CloudUpload } from '@mui/icons-material';
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
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { applicationsApi, authApi, jobsApi } from '../../api/client';
import { EmptyState, ErrorState, LoadingRows, Page, PageHeader, QueryState, StageChip, SuccessBanner } from '../../components/ui/Primitives';
import { AppBreadcrumbs } from '../../components/ui/AppBreadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useBeforeUnloadWarning, useLeaveConfirm } from '../../hooks/useUnsavedWarning';
import { applicantReadiness, profileChecklist } from '../../utils/applicantCompleteness';
import { ApplicantJourney, JourneyFooter } from '../../components/applicant/ApplicantJourney';

export function ApplyJobPage() {
  const { jobId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { showToast, showError } = useToast();
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loadingBuilt, setLoadingBuilt] = useState(false);
  const [step, setStep] = useState(0);
  const dirty = Boolean(resume || coverLetter.trim());
  useBeforeUnloadWarning(dirty);
  const readiness = applicantReadiness(user);
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

  useEffect(() => {
    if (!readiness.readyToApply) setStep(0);
  }, [readiness.readyToApply]);

  const apply = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append('resume', resume);
      form.append('coverLetter', coverLetter);
      return applicationsApi.apply(jobId, form);
    },
    onSuccess: () => {
      showToast('Application submitted — AI review is starting');
      nav('/applicant/applications', { state: { justApplied: true, jobTitle: job?.title } });
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

  const useBuiltResume = async () => {
    setLoadingBuilt(true);
    setError('');
    try {
      const blob = await authApi.downloadResumePdf();
      const file = new File([blob], 'rolefit-resume.pdf', { type: 'application/pdf' });
      setResume(file);
      showToast('Rolefit resume attached');
    } catch (err) {
      setError(String(err));
      showError(err);
    } finally {
      setLoadingBuilt(false);
    }
  };

  const steps = ['Ready', 'Resume', 'Submit'];

  return (
    <Page narrow>
      <AppBreadcrumbs
        items={[
          { label: 'Home', to: '/applicant' },
          { label: 'Jobs', to: '/jobs' },
          { label: job?.title || 'Role', to: `/jobs/${jobId}` },
          { label: 'Apply' },
        ]}
      />
      <ApplicantJourney current="apply" nextHint={readiness.readyToApply ? null : undefined} />
      <PageHeader
        eyebrow="APPLICATION"
        title="Put yourself forward."
        subtitle={job ? `Applying to ${job.title}` : 'Confirm readiness, attach a resume, then send.'}
      />

      <Box className="apply-stepper" role="list" aria-label="Apply steps">
        {steps.map((label, index) => (
          <Box
            key={label}
            role="listitem"
            className={`apply-stepper__item${index === step ? ' is-active' : ''}${index < step ? ' is-done' : ''}`}
          >
            {index + 1}. {label}
          </Box>
        ))}
      </Box>

      {jobError ? <ErrorState error={jobError} onRetry={refetchJob} title="Couldn’t load this role" sx={{ mb: 2 }} /> : null}
      {jobLoading && !job ? <LinearProgress color="secondary" sx={{ mb: 2, borderRadius: 1 }} /> : null}

      <Paper sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
        {apply.isPending && <LinearProgress color="secondary" sx={{ mb: 2, borderRadius: 1 }} />}

        {step === 0 && (
          <Stack spacing={2.5}>
            <Typography variant="h3">Confirm you’re ready</Typography>
            <Typography color="text.secondary">
              Recruiters see your profile and resume together. Finish required details before you attach a file.
            </Typography>
            <Stack spacing={1}>
              <Alert severity={readiness.profile.complete ? 'success' : 'warning'}>
                Profile {readiness.profile.percent}%
                {!readiness.profile.complete && (
                  <>
                    {' '}
                    — missing {readiness.profile.missingRequired.map((i) => i.label).join(', ')}.{' '}
                    <Button component={Link} to="/applicant/profile" size="small" color="inherit">
                      Fix profile
                    </Button>
                  </>
                )}
              </Alert>
              <Alert severity={readiness.resume.complete ? 'success' : 'warning'}>
                Resume {readiness.resume.percent}%
                {!readiness.resume.complete && (
                  <>
                    {' '}
                    — missing {readiness.resume.missingRequired.map((i) => i.label).join(', ')}.{' '}
                    <Button component={Link} to="/applicant/resume" size="small" color="inherit">
                      Fix resume
                    </Button>
                  </>
                )}
              </Alert>
            </Stack>
            <Stack direction="row" spacing={1.25} justifyContent="flex-end">
              <Button component={Link} to={`/jobs/${jobId}`}>
                Back to role
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={!readiness.readyToApply}
                onClick={() => setStep(1)}
              >
                {readiness.readyToApply ? 'Continue to resume' : 'Complete details first'}
              </Button>
            </Stack>
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2.5}>
            <Typography variant="h3">Attach your resume</Typography>
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
                bgcolor: dragging || resume ? 'rgba(255,92,53,0.08)' : 'transparent',
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="outlined" onClick={useBuiltResume} disabled={loadingBuilt || apply.isPending}>
                {loadingBuilt ? 'Loading resume…' : 'Use Rolefit resume'}
              </Button>
              <Button component={Link} to="/applicant/resume" size="small">
                Edit Rolefit resume
              </Button>
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={1.25} justifyContent="space-between">
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={!resume}
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
              >
                Continue to note
              </Button>
            </Stack>
          </Stack>
        )}

        {step === 2 && (
          <Stack
            component="form"
            spacing={2.5}
            onSubmit={(e) => {
              e.preventDefault();
              if (!readiness.readyToApply) {
                setError('Finish required profile and resume details before submitting.');
                setStep(0);
                return;
              }
              if (!resume) {
                setError('A resume is required.');
                setStep(1);
                return;
              }
              apply.mutate();
            }}
          >
            <Typography variant="h3">Add a short note</Typography>
            <Alert severity="info">
              Submitting to <strong>{job?.title || 'this role'}</strong>
              {resume ? ` with ${resume.name}` : ''}.
            </Alert>
            <TextField
              label="Cover letter (optional)"
              multiline
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="A short note on why this role fits your craft."
              helperText={`${coverLetter.length} characters`}
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={1.25} justifyContent="space-between">
              <Button onClick={() => setStep(1)} disabled={apply.isPending}>
                Back
              </Button>
              <Button type="submit" variant="contained" color="secondary" size="large" disabled={apply.isPending}>
                {apply.isPending ? 'Submitting…' : 'Submit application'}
              </Button>
            </Stack>
          </Stack>
        )}
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
  const location = useLocation();
  const justApplied = Boolean(location.state?.justApplied);
  const justAppliedTitle = location.state?.jobTitle;
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
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/applicant" variant="text">
              Applicant home
            </Button>
            <Button component={Link} to="/jobs" variant="contained" color="secondary">
              Browse roles
            </Button>
          </Stack>
        }
      />
      {justApplied && (
        <SuccessBanner>
          Application submitted{justAppliedTitle ? ` for ${justAppliedTitle}` : ''}. AI is scoring your resume — this list
          updates automatically.
        </SuccessBanner>
      )}
      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        errorTitle="Couldn’t load applications"
        isEmpty={!apps.length}
        loading={<LoadingRows count={3} height={160} />}
        empty={
          <EmptyState
            title="No applications yet."
            text="Explore open roles and take the first step — your pipeline will show up here."
            actionLabel="Browse roles"
            actionTo="/jobs"
          />
        }
      >
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
          <Stack spacing={2} className="stagger-in">
            {apps.map((a) => (
              <ApplicationCard key={a.id || a._id} application={a} />
            ))}
          </Stack>
        </Stack>
      </QueryState>
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
    linkedInUrl: user?.linkedInUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    preferredEmploymentType: user?.preferredEmploymentType || 'any',
    availability: user?.availability || '',
    noticePeriodDays: user?.noticePeriodDays ?? 0,
    openToRemote: user?.openToRemote !== false,
    openToRelocate: Boolean(user?.openToRelocate),
    workAuthorization: user?.workAuthorization || '',
    about: user?.about || '',
  }));
  const readiness = profileChecklist({ ...user, ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) });

  const update = useMutation({
    mutationFn: (body) => authApi.updateProfile(body),
    onSuccess: (response) => {
      const updatedUser = response.data?.user || response.data;
      login({ token, user: updatedUser });
      setDirty(false);
      showToast(profileChecklist(updatedUser).complete ? 'Profile saved — continue to resume' : 'Profile saved');
    },
    onError: (err) => showError(err),
  });
  const set = (key) => (event) => {
    setDirty(true);
    const value = event?.target?.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm({ ...form, [key]: value });
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!form.headline.trim()) return 'Professional headline is required';
    if (!form.location.trim()) return 'Location is required';
    const skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skills.length < 3) return 'Add at least 3 skills';
    if (!form.availability) return 'Select your availability';
    return '';
  };

  const resetForm = () =>
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      headline: user?.headline || '',
      location: user?.location || '',
      experienceYears: user?.experienceYears ?? 0,
      skills: (user?.skills || []).join(', '),
      linkedInUrl: user?.linkedInUrl || '',
      portfolioUrl: user?.portfolioUrl || '',
      preferredEmploymentType: user?.preferredEmploymentType || 'any',
      availability: user?.availability || '',
      noticePeriodDays: user?.noticePeriodDays ?? 0,
      openToRemote: user?.openToRemote !== false,
      openToRelocate: Boolean(user?.openToRelocate),
      workAuthorization: user?.workAuthorization || '',
      about: user?.about || '',
    });

  return (
    <Page>
      <PageHeader
        eyebrow="PROFILE"
        title="Your applicant profile"
        subtitle="Recruiters use these details to understand fit before they open your resume."
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/applicant" variant="text">
              Applicant home
            </Button>
            <Button component={Link} to="/applicant/resume" variant="outlined">
              Resume builder
            </Button>
          </Stack>
        }
      />

      <ApplicantJourney current="profile" />

      <Paper sx={{ p: 2.5, mb: 2.5, bgcolor: 'rgba(255,255,255,0.96)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              Profile completeness
            </Typography>
            <Typography variant="h3" mt={0.5}>
              {readiness.percent}% required
            </Typography>
          </Box>
          <LinearProgress variant="determinate" color="secondary" value={readiness.percent} sx={{ flex: 1, maxWidth: 360 }} />
        </Stack>
        {readiness.missingRequired.length > 0 && (
          <Typography variant="body2" color="warning.main" mt={1.5}>
            Still needed: {readiness.missingRequired.map((item) => item.label).join(', ')}
          </Typography>
        )}
      </Paper>

      <Paper
        component="form"
        sx={{ p: { xs: 2.5, md: 4 }, bgcolor: 'rgba(255,255,255,0.96)' }}
        onSubmit={(event) => {
          event.preventDefault();
          const problem = validate();
          if (problem) {
            showError(problem);
            return;
          }
          update.mutate({
            ...form,
            experienceYears: Number(form.experienceYears),
            noticePeriodDays: Number(form.noticePeriodDays) || 0,
            skills: form.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean),
          });
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" mb={2}>
              Basics
            </Typography>
            <Stack spacing={2}>
              <TextField label="Full name" required value={form.name} onChange={set('name')} />
              <TextField label="Email" value={user?.email || ''} disabled helperText="Managed by your account login." />
              <TextField label="Phone" required value={form.phone} onChange={set('phone')} placeholder="+91 …" />
              <TextField label="Professional headline" required value={form.headline} onChange={set('headline')} placeholder="Full-stack engineer" />
              <TextField label="Location" required value={form.location} onChange={set('location')} placeholder="Bengaluru / Remote" />
              <TextField
                label="Years of experience"
                type="number"
                required
                inputProps={{ min: 0 }}
                value={form.experienceYears}
                onChange={set('experienceYears')}
              />
              <TextField
                label="Skills"
                required
                helperText="At least 3 skills, separated by commas."
                value={form.skills}
                onChange={set('skills')}
              />
              <TextField
                label="About you"
                multiline
                minRows={3}
                value={form.about}
                onChange={set('about')}
                helperText="Optional short bio for recruiters."
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="h3" mb={2}>
              Links
            </Typography>
            <Stack spacing={2}>
              <TextField label="LinkedIn URL" value={form.linkedInUrl} onChange={set('linkedInUrl')} placeholder="https://linkedin.com/in/…" />
              <TextField label="Portfolio / GitHub URL" value={form.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://…" />
            </Stack>
          </Box>

          <Box>
            <Typography variant="h3" mb={2}>
              Preferences
            </Typography>
            <Stack spacing={2}>
              <TextField
                select
                label="Preferred employment type"
                value={form.preferredEmploymentType}
                onChange={set('preferredEmploymentType')}
              >
                {[
                  ['any', 'Any'],
                  ['full-time', 'Full-time'],
                  ['part-time', 'Part-time'],
                  ['contract', 'Contract'],
                  ['internship', 'Internship'],
                ].map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Availability" required value={form.availability} onChange={set('availability')}>
                <MenuItem value="">Select availability</MenuItem>
                {[
                  ['immediate', 'Immediate'],
                  ['2-weeks', 'In about 2 weeks'],
                  ['1-month', 'In about 1 month'],
                  ['3-months', 'In about 3 months'],
                  ['flexible', 'Flexible'],
                ].map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notice period (days)"
                type="number"
                inputProps={{ min: 0 }}
                value={form.noticePeriodDays}
                onChange={set('noticePeriodDays')}
              />
              <TextField
                label="Work authorization"
                value={form.workAuthorization}
                onChange={set('workAuthorization')}
                placeholder="e.g. Authorized to work in India"
              />
              <FormControlLabel
                control={<Checkbox checked={Boolean(form.openToRemote)} onChange={set('openToRemote')} />}
                label="Open to remote roles"
              />
              <FormControlLabel
                control={<Checkbox checked={Boolean(form.openToRelocate)} onChange={set('openToRelocate')} />}
                label="Open to relocating"
              />
            </Stack>
          </Box>

          {update.error && <Alert severity="error">{String(update.error)}</Alert>}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button type="submit" variant="contained" color="secondary" size="large" disabled={update.isPending || !dirty}>
              {update.isPending ? 'Saving…' : dirty ? 'Save profile' : 'Saved'}
            </Button>
            {dirty && (
              <Button
                onClick={() =>
                  requestLeave(() => {
                    resetForm();
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
      <JourneyFooter
        backTo="/applicant"
        backLabel="Back to home"
        nextTo="/applicant/resume"
        nextLabel={readiness.complete ? 'Continue to resume' : 'Resume next'}
        nextDisabled={!readiness.complete}
      />
      {leaveDialog}
    </Page>
  );
}

export function SavedJobsPage() {
  const qc = useQueryClient();
  const { token, user, login } = useAuth();
  const { showToast } = useToast();
  const readiness = applicantReadiness(user);
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
      <PageHeader
        eyebrow="SAVED"
        title="Saved roles"
        subtitle="Return to opportunities worth another look — apply when your profile is ready."
        actions={
          <Button component={Link} to="/applicant" variant="text">
            Applicant home
          </Button>
        }
      />
      <ApplicantJourney
        current="apply"
        nextHint={
          readiness.readyToApply
            ? { label: 'Browse more roles', to: '/jobs' }
            : { label: 'Finish readiness', to: '/applicant' }
        }
      />
      {!readiness.readyToApply && jobs.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You’re {readiness.percent}% ready to apply. Finish required profile and resume details so you can submit
          quickly from these saved roles.
        </Alert>
      )}
      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        errorTitle="Couldn’t load saved roles"
        isEmpty={!jobs.length}
        empty={
          <EmptyState
            title="No saved roles yet."
            text="Save roles while you explore to find them here."
            actionLabel="Browse roles"
            actionTo="/jobs"
          />
        }
      >
        <Stack spacing={1.5}>
          {jobs.map((job) => {
            const id = job.id || job._id;
            return (
              <Paper
                key={id}
                className="surface-hover"
                sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.92)' }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={{ md: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack sx={{ flex: 1, minWidth: 220 }} spacing={0.75}>
                    <Typography fontWeight={700} fontSize={17}>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.companyName || 'Rolefit partner'} · {job.location || 'Flexible'}
                      {job.employmentType ? ` · ${job.employmentType}` : ''}
                    </Typography>
                    {(job.skills || []).length > 0 && (
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {job.skills.slice(0, 6).map((skill) => (
                          <Chip key={skill} size="small" label={skill} variant="outlined" />
                        ))}
                      </Stack>
                    )}
                    {job.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
                        {String(job.description).slice(0, 160)}
                        {String(job.description).length > 160 ? '…' : ''}
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button component={Link} to={`/jobs/${id}`} variant="outlined">
                      View role
                    </Button>
                    <Button
                      component={Link}
                      to={`/applicant/jobs/${id}/apply`}
                      variant="contained"
                      color="secondary"
                      disabled={!readiness.readyToApply}
                    >
                      {readiness.readyToApply ? 'Apply' : 'Complete profile'}
                    </Button>
                    <Button color="error" disabled={toggleSaved.isPending} onClick={() => toggleSaved.mutate(id)}>
                      Unsave
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
          {toggleSaved.error && <ErrorState error={toggleSaved.error} title="Couldn’t update saved roles" />}
        </Stack>
      </QueryState>
    </Page>
  );
}
