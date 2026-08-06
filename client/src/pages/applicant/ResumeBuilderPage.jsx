import { Add, CheckCircle, Delete, Download, Description, RadioButtonUnchecked } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
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
import { Link } from 'react-router-dom';
import { authApi } from '../../api/client';
import { AppBreadcrumbs } from '../../components/ui/AppBreadcrumbs';
import { ApplicantJourney } from '../../components/applicant/ApplicantJourney';
import { ErrorState, LoadingRows, Page, PageHeader } from '../../components/ui/Primitives';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useBeforeUnloadWarning } from '../../hooks/useUnsavedWarning';
import { applicantReadiness, resumeChecklist } from '../../utils/applicantCompleteness';

const DEGREE_OPTIONS = [
  'High school',
  'Associate degree',
  "Bachelor's degree",
  "Master's degree",
  'MBA',
  'Doctorate / PhD',
  'Diploma',
  'Certificate',
  'Other',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

const STEPS = [
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'review', label: 'Review' },
];

const emptyExperience = () => ({
  title: '',
  company: '',
  location: '',
  employmentType: 'Full-time',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

const emptyEducation = () => ({
  school: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
});

function toMonthValue(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.toLowerCase() === 'present') return '';
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}$/.test(raw)) return `${raw}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.slice(0, 7);
  return '';
}

function formatMonthLabel(value) {
  const month = toMonthValue(value);
  if (!month) return '';
  const [year, mon] = month.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Number(mon) - 1] || mon} ${year}`;
}

function draftFromUser(user) {
  const draft = user?.resumeDraft || {};
  return {
    summary: draft.summary || '',
    skills: (draft.skills?.length ? draft.skills : user?.skills || []).join(', '),
    experience: draft.experience?.length
      ? draft.experience.map((row) => ({
          ...emptyExperience(),
          ...row,
          startDate: toMonthValue(row.startDate) || row.startDate || '',
          endDate: row.current ? '' : toMonthValue(row.endDate) || row.endDate || '',
          employmentType: row.employmentType || 'Full-time',
        }))
      : [emptyExperience()],
    education: draft.education?.length
      ? draft.education.map((row) => ({
          ...emptyEducation(),
          ...row,
          startDate: toMonthValue(row.startDate) || row.startDate || '',
          endDate: toMonthValue(row.endDate) || row.endDate || '',
        }))
      : [emptyEducation()],
  };
}

function skillList(skills) {
  return String(skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function validateStep(step, form) {
  if (step === 0) {
    if (!form.summary.trim()) return 'Professional summary is required';
    if (skillList(form.skills).length < 3) return 'Add at least 3 skills';
  }
  if (step === 1) {
    const experience = form.experience.filter((row) => row.title?.trim() && row.company?.trim());
    if (!experience.length) return 'Add at least one role with title and company';
    for (const row of experience) {
      if (!row.startDate) return 'Add a start date for each experience role';
      if (!row.current && !row.endDate) return 'Add an end date, or mark the role as current';
    }
  }
  if (step === 2) {
    const education = form.education.filter((row) => row.school?.trim());
    if (!education.length) return 'Add at least one school';
    for (const row of education) {
      if (!row.degree || row.degree === 'Other') return 'Select or enter a degree for each school';
      if (!row.startDate) return 'Add a start date for each education entry';
      if (row.endDate && row.startDate && row.endDate < row.startDate) {
        return 'Education end date must be after the start date';
      }
    }
  }
  return '';
}

function validateResume(form) {
  for (let i = 0; i < 3; i += 1) {
    const problem = validateStep(i, form);
    if (problem) return { problem, step: i };
  }
  return { problem: '', step: 3 };
}

function SectionStatus({ done, label }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {done ? (
        <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
      ) : (
        <RadioButtonUnchecked sx={{ fontSize: 18, color: 'text.secondary' }} />
      )}
      <Typography variant="body2" fontWeight={600} color={done ? 'text.primary' : 'text.secondary'}>
        {label}
      </Typography>
    </Stack>
  );
}

export function ResumeBuilderPage() {
  const { user, token, login } = useAuth();
  const { showToast, showError } = useToast();
  const qc = useQueryClient();
  const [dirty, setDirty] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => draftFromUser(user));
  useBeforeUnloadWarning(dirty);

  const skills = useMemo(() => skillList(form.skills), [form.skills]);

  const liveUser = useMemo(
    () => ({
      ...user,
      skills,
      resumeDraft: {
        summary: form.summary,
        skills,
        experience: form.experience,
        education: form.education,
      },
    }),
    [form, skills, user],
  );

  const liveChecklist = useMemo(() => resumeChecklist(liveUser), [liveUser]);
  const liveReadiness = useMemo(() => applicantReadiness(liveUser), [liveUser]);

  const stepDone = useMemo(
    () => [
      Boolean(form.summary.trim()) && skills.length >= 3,
      form.experience.some((row) => row.title?.trim() && row.company?.trim() && row.startDate && (row.current || row.endDate)),
      form.education.some((row) => row.school?.trim() && row.degree && row.degree !== 'Other' && row.startDate),
      liveChecklist.complete,
    ],
    [form, skills, liveChecklist.complete],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resume-draft'],
    queryFn: () => authApi.getResume().then((r) => r.data),
  });

  useEffect(() => {
    if (data?.user || data?.resumeDraft) {
      setForm(draftFromUser(data.user || { ...user, resumeDraft: data.resumeDraft }));
      setDirty(false);
    }
  }, [data, user]);

  const save = useMutation({
    mutationFn: () =>
      authApi.saveResume({
        summary: form.summary,
        skills: form.skills,
        experience: form.experience,
        education: form.education,
        syncProfile: true,
        headline: user?.headline,
      }),
    onSuccess: (response) => {
      const nextUser = response.data?.user;
      if (nextUser) login({ token, user: nextUser });
      setDirty(false);
      qc.invalidateQueries({ queryKey: ['resume-draft'] });
      const ready = nextUser ? applicantReadiness(nextUser).readyToApply : false;
      showToast(ready ? 'Resume saved — you’re ready to apply' : 'Resume saved');
      setStep(3);
    },
    onError: (err) => showError(err),
  });

  const download = useMutation({
    mutationFn: async () => {
      const { problem, step: badStep } = validateResume(form);
      if (problem) {
        setStep(badStep);
        throw new Error(problem);
      }
      if (dirty) await save.mutateAsync();
      const { blob, filename } = await authApi.downloadResumePdf(user?.name);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => showToast('PDF downloaded'),
    onError: (err) => showError(err),
  });

  const trySave = () => {
    const { problem, step: badStep } = validateResume(form);
    if (problem) {
      showError(problem);
      setStep(badStep);
      return;
    }
    save.mutate();
  };

  const goNext = () => {
    const problem = validateStep(step, form);
    if (problem) {
      showError(problem);
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const journeyAction = (() => {
    if (dirty) {
      return { label: save.isPending ? 'Saving…' : 'Save resume', onClick: trySave, disabled: save.isPending };
    }
    if (!liveChecklist.complete) {
      return {
        label: 'Continue editing',
        onClick: () => setStep(stepDone.findIndex((done) => !done) === -1 ? 0 : stepDone.findIndex((done) => !done)),
      };
    }
    if (!liveReadiness.profile.complete) {
      return { label: 'Complete profile', to: '/applicant/profile' };
    }
    return { label: 'Browse roles to apply', to: '/jobs' };
  })();

  const setField = (key, value) => {
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateExperience = (index, key, value) => {
    setDirty(true);
    setForm((current) => {
      const experience = current.experience.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, [key]: value };
        if (key === 'current' && value) next.endDate = '';
        return next;
      });
      return { ...current, experience };
    });
  };

  const updateEducation = (index, key, value) => {
    setDirty(true);
    setForm((current) => {
      const education = current.education.map((row, i) => (i === index ? { ...row, [key]: value } : row));
      return { ...current, education };
    });
  };

  if (isLoading && !data) {
    return (
      <Page>
        <LoadingRows count={4} height={120} />
      </Page>
    );
  }

  const previewExp = form.experience.filter((row) => row.title?.trim() || row.company?.trim()).slice(0, 2);
  const previewEdu = form.education.filter((row) => row.school?.trim()).slice(0, 2);

  return (
    <Page>
      <AppBreadcrumbs
        items={[
          { label: 'Home', to: '/applicant' },
          { label: 'Profile', to: '/applicant/profile' },
          { label: 'Resume' },
        ]}
      />
      <PageHeader
        eyebrow="RESUME"
        title="Build your Rolefit resume."
        subtitle="Four short steps — then download a PDF or attach it when you apply."
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<Download />}
              disabled={download.isPending || save.isPending}
              onClick={() => download.mutate()}
            >
              {download.isPending ? 'Preparing…' : 'Download PDF'}
            </Button>
            <Button variant="contained" color="secondary" disabled={save.isPending || !dirty} onClick={trySave}>
              {save.isPending ? 'Saving…' : dirty ? 'Save resume' : 'Saved'}
            </Button>
          </Stack>
        }
      />

      <ApplicantJourney current="resume" readiness={liveReadiness} nextHint={journeyAction} />

      <Paper className="resume-status" sx={{ p: 2.5, mb: 2.5, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }}>
          <Box sx={{ minWidth: 140 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              Resume completeness
            </Typography>
            <Typography variant="h3" mt={0.5} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {liveChecklist.percent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="secondary"
            value={liveChecklist.percent}
            sx={{ flex: 1, height: 8, borderRadius: 99 }}
          />
          <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
            {liveChecklist.required.map((item) => (
              <Chip
                key={item.id}
                size="small"
                color={item.done ? 'success' : 'default'}
                variant={item.done ? 'filled' : 'outlined'}
                label={item.label}
                onClick={() => {
                  const map = { summary: 0, skills: 0, experience: 1, education: 2 };
                  setStep(map[item.id] ?? 0);
                }}
              />
            ))}
          </Stack>
        </Stack>
        {liveChecklist.missingRequired.length > 0 ? (
          <Typography variant="body2" color="warning.main" mt={1.5} fontWeight={600}>
            Still needed: {liveChecklist.missingRequired.map((item) => item.label).join(', ')}
          </Typography>
        ) : (
          <Typography variant="body2" color="success.main" mt={1.5} fontWeight={600}>
            Required resume fields look complete{dirty ? ' — save to lock them in' : ''}.
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" mt={1}>
          PDF contact line uses your profile
          {user?.name || user?.phone || user?.location
            ? `: ${[user?.name, user?.phone, user?.location].filter(Boolean).join(' · ')}`
            : ''}
          .{' '}
          <Button component={Link} to="/applicant/profile" size="small" sx={{ verticalAlign: 'baseline' }}>
            Edit profile
          </Button>
        </Typography>
      </Paper>

      {error && <ErrorState error={error} onRetry={refetch} title="Couldn’t load resume" sx={{ mb: 2 }} />}

      <Box className="apply-stepper resume-stepper" role="list" aria-label="Resume builder steps" sx={{ mb: 2.5, maxWidth: 820 }}>
        {STEPS.map((item, index) => (
          <Box
            key={item.id}
            role="listitem"
            className={`apply-stepper__item${index === step ? ' is-active' : ''}${stepDone[index] || index < step ? ' is-done' : ''}`}
            onClick={() => {
              if (index <= step || stepDone[index] || (index > 0 && stepDone[index - 1])) setStep(index);
            }}
            sx={{ cursor: 'pointer' }}
          >
            <span className="apply-stepper__num">{index + 1}. </span>
            {item.label}
          </Box>
        ))}
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start" id="resume-form" sx={{ scrollMarginTop: 96 }}>
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: 760, width: '100%' }}>
          {step === 0 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.25 }, bgcolor: '#fff' }}>
              <Typography variant="h3">Summary & skills</Typography>
              <Typography color="text.secondary" mt={1} mb={2.5}>
                Lead with impact — recruiters scan this first.
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  label="Professional summary"
                  required
                  multiline
                  minRows={5}
                  fullWidth
                  value={form.summary}
                  onChange={(e) => setField('summary', e.target.value)}
                  helperText={`${form.summary.trim().length} characters · aim for 2–4 sentences`}
                />
                <TextField
                  label="Skills"
                  required
                  fullWidth
                  value={form.skills}
                  onChange={(e) => setField('skills', e.target.value)}
                  placeholder="react, typescript, system design"
                  helperText={`${skills.length} skill${skills.length === 1 ? '' : 's'} · need at least 3`}
                />
                {skills.length > 0 && (
                  <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
                    {skills.map((skill) => (
                      <Chip key={skill} size="small" label={skill} color="secondary" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}

          {step === 1 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.25 }, bgcolor: '#fff' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Box>
                  <Typography variant="h3">Experience</Typography>
                  <Typography color="text.secondary" mt={0.75}>
                    At least one role with title, company, and dates.
                  </Typography>
                </Box>
                <Button
                  startIcon={<Add />}
                  onClick={() => {
                    setDirty(true);
                    setForm((current) => ({ ...current, experience: [...current.experience, emptyExperience()] }));
                  }}
                >
                  Add role
                </Button>
              </Stack>
              <Stack spacing={2.5} mt={2}>
                {form.experience.map((row, index) => (
                  <Box key={`exp-${index}`} className="resume-entry">
                    {index > 0 && <Divider sx={{ mb: 2.5 }} />}
                    <Typography variant="body2" fontWeight={700} color="text.secondary" mb={1.5}>
                      Role {index + 1}
                    </Typography>
                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <TextField label="Title" required fullWidth value={row.title} onChange={(e) => updateExperience(index, 'title', e.target.value)} />
                        <TextField label="Company" required fullWidth value={row.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <TextField label="Location" fullWidth value={row.location} onChange={(e) => updateExperience(index, 'location', e.target.value)} />
                        <TextField
                          select
                          label="Employment type"
                          fullWidth
                          value={row.employmentType || 'Full-time'}
                          onChange={(e) => updateExperience(index, 'employmentType', e.target.value)}
                        >
                          {EMPLOYMENT_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <TextField
                          label="Start date"
                          type="month"
                          required
                          fullWidth
                          value={toMonthValue(row.startDate)}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="End date"
                          type="month"
                          required={!row.current}
                          fullWidth
                          disabled={row.current}
                          value={row.current ? '' : toMonthValue(row.endDate)}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          helperText={row.current ? 'Current role' : ' '}
                        />
                      </Stack>
                      <FormControlLabel
                        control={
                          <Checkbox checked={Boolean(row.current)} onChange={(e) => updateExperience(index, 'current', e.target.checked)} />
                        }
                        label="I currently work here"
                      />
                      <TextField
                        label="Highlights"
                        multiline
                        minRows={3}
                        fullWidth
                        value={row.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="What you owned, shipped, or improved…"
                      />
                      {form.experience.length > 1 && (
                        <Button
                          color="error"
                          startIcon={<Delete />}
                          sx={{ alignSelf: 'flex-start' }}
                          onClick={() => {
                            setDirty(true);
                            setForm((current) => ({
                              ...current,
                              experience: current.experience.filter((_, i) => i !== index),
                            }));
                          }}
                        >
                          Remove role
                        </Button>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          {step === 2 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.25 }, bgcolor: '#fff' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Box>
                  <Typography variant="h3">Education</Typography>
                  <Typography color="text.secondary" mt={0.75}>
                    School, degree, and start date are required.
                  </Typography>
                </Box>
                <Button
                  startIcon={<Add />}
                  onClick={() => {
                    setDirty(true);
                    setForm((current) => ({ ...current, education: [...current.education, emptyEducation()] }));
                  }}
                >
                  Add school
                </Button>
              </Stack>
              <Stack spacing={2.5} mt={2}>
                {form.education.map((row, index) => {
                  const standardDegrees = DEGREE_OPTIONS.filter((degree) => degree !== 'Other');
                  const selectValue = !row.degree ? '' : standardDegrees.includes(row.degree) ? row.degree : 'Other';
                  return (
                    <Box key={`edu-${index}`} className="resume-entry">
                      {index > 0 && <Divider sx={{ mb: 2.5 }} />}
                      <Typography variant="body2" fontWeight={700} color="text.secondary" mb={1.5}>
                        School {index + 1}
                      </Typography>
                      <Stack spacing={1.5}>
                        <TextField label="School" required fullWidth value={row.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <TextField
                            select
                            label="Degree"
                            required
                            fullWidth
                            value={selectValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateEducation(index, 'degree', value === 'Other' ? 'Other' : value);
                            }}
                          >
                            <MenuItem value="">Select degree</MenuItem>
                            {DEGREE_OPTIONS.map((degree) => (
                              <MenuItem key={degree} value={degree}>
                                {degree}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            label="Field of study"
                            fullWidth
                            value={row.field}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          />
                        </Stack>
                        {selectValue === 'Other' && (
                          <TextField
                            label="Custom degree"
                            required
                            fullWidth
                            value={row.degree === 'Other' ? '' : row.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value.trim() ? e.target.value : 'Other')}
                            placeholder="e.g. Postgraduate diploma"
                          />
                        )}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <TextField
                            label="Start date"
                            type="month"
                            required
                            fullWidth
                            value={toMonthValue(row.startDate)}
                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            label="End date"
                            type="month"
                            fullWidth
                            value={toMonthValue(row.endDate)}
                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            helperText="Optional if still studying"
                          />
                        </Stack>
                        {form.education.length > 1 && (
                          <Button
                            color="error"
                            startIcon={<Delete />}
                            sx={{ alignSelf: 'flex-start' }}
                            onClick={() => {
                              setDirty(true);
                              setForm((current) => ({
                                ...current,
                                education: current.education.filter((_, i) => i !== index),
                              }));
                            }}
                          >
                            Remove school
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          )}

          {step === 3 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.25 }, bgcolor: '#fff' }}>
              <Typography variant="h3">Review & finish</Typography>
              <Typography color="text.secondary" mt={1} mb={2.5}>
                Confirm the checklist, save, then download or apply.
              </Typography>
              <Stack spacing={1.25} mb={2.5}>
                <SectionStatus done={stepDone[0]} label="Summary & skills" />
                <SectionStatus done={stepDone[1]} label="Experience with dates" />
                <SectionStatus done={stepDone[2]} label="Education with degree & dates" />
              </Stack>
              {!liveChecklist.complete && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Finish the missing items above, then return here to save.
                </Alert>
              )}
              {liveChecklist.complete && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Resume looks ready{dirty ? ' — save to sync your profile' : ''}.
                </Alert>
              )}
              <Alert severity="info" icon={<Description />}>
                After saving, open a role and choose <strong>Use Rolefit resume</strong>, or{' '}
                <Button component={Link} to="/jobs" size="small" sx={{ verticalAlign: 'baseline' }}>
                  browse roles
                </Button>
                .
              </Alert>
            </Paper>
          )}

          <Stack
            className="apply-wizard__cta"
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
          >
            <Button
              onClick={() => {
                if (step === 0) return;
                setStep((current) => current - 1);
              }}
              disabled={step === 0}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="contained" color="secondary" onClick={goNext} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Continue
              </Button>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  disabled={download.isPending || save.isPending}
                  onClick={() => download.mutate()}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Download PDF
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={save.isPending || (!dirty && liveChecklist.complete)}
                  onClick={trySave}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {save.isPending ? 'Saving…' : dirty ? 'Save resume' : liveChecklist.complete ? 'Saved' : 'Save resume'}
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>

        <Box
          component="aside"
          className="resume-preview"
          aria-label="Resume preview"
          sx={{
            width: { lg: 320 },
            flexShrink: 0,
            position: { lg: 'sticky' },
            top: { lg: 88 },
            display: { xs: 'none', lg: 'block' },
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={700} mb={1.25}>
            Live preview
          </Typography>
          <Paper sx={{ p: 2.5, bgcolor: '#fff' }}>
            <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.03em' }}>
              {user?.name || 'Your name'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {[user?.headline, user?.location].filter(Boolean).join(' · ') || 'Headline · Location'}
            </Typography>
            <Divider sx={{ my: 1.75 }} />
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              SUMMARY
            </Typography>
            <Typography variant="body2" mt={0.75} sx={{ lineHeight: 1.55 }}>
              {form.summary.trim()
                ? `${form.summary.trim().slice(0, 160)}${form.summary.trim().length > 160 ? '…' : ''}`
                : 'Your summary appears here as you write.'}
            </Typography>
            {skills.length > 0 && (
              <Stack direction="row" gap={0.5} flexWrap="wrap" useFlexGap mt={1.5}>
                {skills.slice(0, 6).map((skill) => (
                  <Chip key={skill} size="small" label={skill} variant="outlined" />
                ))}
              </Stack>
            )}
            {previewExp.length > 0 && (
              <Box mt={2}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  EXPERIENCE
                </Typography>
                {previewExp.map((row, index) => (
                  <Box key={`pv-exp-${index}`} mt={1}>
                    <Typography variant="body2" fontWeight={700}>
                      {[row.title, row.company].filter(Boolean).join(' — ') || 'Role'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[
                        formatMonthLabel(row.startDate),
                        row.current ? 'Present' : formatMonthLabel(row.endDate),
                        row.employmentType,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            {previewEdu.length > 0 && (
              <Box mt={2}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  EDUCATION
                </Typography>
                {previewEdu.map((row, index) => (
                  <Box key={`pv-edu-${index}`} mt={1}>
                    <Typography variant="body2" fontWeight={700}>
                      {row.school || 'School'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[row.degree === 'Other' ? '' : row.degree, row.field, formatMonthLabel(row.startDate)]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Stack>
    </Page>
  );
}
