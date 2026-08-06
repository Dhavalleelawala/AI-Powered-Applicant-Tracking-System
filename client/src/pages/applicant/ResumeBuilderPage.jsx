import { Add, Delete, Download, Description } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  LinearProgress,
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
import { ApplicantJourney, JourneyFooter } from '../../components/applicant/ApplicantJourney';
import { LoadingRows, Page, PageHeader } from '../../components/ui/Primitives';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useBeforeUnloadWarning } from '../../hooks/useUnsavedWarning';
import { applicantReadiness, resumeChecklist } from '../../utils/applicantCompleteness';

const emptyExperience = () => ({
  title: '',
  company: '',
  location: '',
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

function draftFromUser(user) {
  const draft = user?.resumeDraft || {};
  return {
    summary: draft.summary || '',
    skills: (draft.skills?.length ? draft.skills : user?.skills || []).join(', '),
    experience: draft.experience?.length ? draft.experience.map((row) => ({ ...row })) : [emptyExperience()],
    education: draft.education?.length ? draft.education.map((row) => ({ ...row })) : [emptyEducation()],
  };
}

function validateResume(form) {
  if (!form.summary.trim()) return 'Professional summary is required';
  const skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
  if (skills.length < 3) return 'Add at least 3 skills';
  const experience = form.experience.filter((row) => row.title?.trim() && row.company?.trim());
  if (!experience.length) return 'Add at least one experience with title and company';
  const education = form.education.filter((row) => row.school?.trim());
  if (!education.length) return 'Add at least one education entry with school name';
  return '';
}

export function ResumeBuilderPage() {
  const { user, token, login } = useAuth();
  const { showToast, showError } = useToast();
  const qc = useQueryClient();
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(() => draftFromUser(user));
  useBeforeUnloadWarning(dirty);

  const liveChecklist = useMemo(
    () =>
      resumeChecklist({
        ...user,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        resumeDraft: {
          summary: form.summary,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          experience: form.experience,
          education: form.education,
        },
      }),
    [form, user]
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
    },
    onError: (err) => showError(err),
  });

  const download = useMutation({
    mutationFn: async () => {
      const problem = validateResume(form);
      if (problem) throw new Error(problem);
      if (dirty) await save.mutateAsync();
      const blob = await authApi.downloadResumePdf();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'rolefit-resume.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => showToast('PDF downloaded'),
    onError: (err) => showError(err),
  });

  const trySave = () => {
    const problem = validateResume(form);
    if (problem) {
      showError(problem);
      return;
    }
    save.mutate();
  };

  const setField = (key, value) => {
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateExperience = (index, key, value) => {
    setDirty(true);
    setForm((current) => {
      const experience = current.experience.map((row, i) => (i === index ? { ...row, [key]: value } : row));
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
      <Page narrow>
        <LoadingRows count={4} height={120} />
      </Page>
    );
  }

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
        subtitle="Write once, download a clean PDF, and attach it when you apply."
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              disabled={download.isPending || save.isPending}
              onClick={() => download.mutate()}
            >
              {download.isPending ? 'Preparing…' : 'Download PDF'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              disabled={save.isPending || !dirty}
              onClick={trySave}
            >
              {save.isPending ? 'Saving…' : dirty ? 'Save resume' : 'Saved'}
            </Button>
          </Stack>
        }
      />

      <ApplicantJourney current="resume" />

      <Paper sx={{ p: 2.5, mb: 2.5, bgcolor: 'rgba(255,255,255,0.96)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              Resume completeness
            </Typography>
            <Typography variant="h3" mt={0.5}>
              {liveChecklist.percent}% required
            </Typography>
          </Box>
          <LinearProgress variant="determinate" color="secondary" value={liveChecklist.percent} sx={{ flex: 1, maxWidth: 360 }} />
        </Stack>
        {liveChecklist.missingRequired.length > 0 && (
          <Typography variant="body2" color="warning.main" mt={1.5}>
            Still needed: {liveChecklist.missingRequired.map((item) => item.label).join(', ')}
          </Typography>
        )}
        {(user?.phone || user?.location || user?.headline) && (
          <Typography variant="body2" color="text.secondary" mt={1.25}>
            Contact on PDF comes from your profile: {[user?.name, user?.phone, user?.location, user?.headline]
              .filter(Boolean)
              .join(' · ')}
            .{' '}
            <Button component={Link} to="/applicant/profile" size="small" sx={{ verticalAlign: 'baseline' }}>
              Edit profile
            </Button>
          </Typography>
        )}
      </Paper>

      {error && (
        <Alert severity="error" action={<Button onClick={refetch}>Retry</Button>} sx={{ mb: 2 }}>
          {String(error)}
        </Alert>
      )}

      <Stack spacing={2.5} maxWidth={820}>
        <Paper sx={{ p: { xs: 2.5, md: 3.25 }, bgcolor: 'rgba(255,255,255,0.96)' }}>
          <Typography variant="h3" mb={2}>
            Summary
          </Typography>
          <TextField
            label="Professional summary"
            required
            multiline
            minRows={4}
            fullWidth
            value={form.summary}
            onChange={(e) => setField('summary', e.target.value)}
            helperText="2–4 sentences on your craft and impact."
          />
          <TextField
            sx={{ mt: 2 }}
            label="Skills"
            required
            fullWidth
            value={form.skills}
            onChange={(e) => setField('skills', e.target.value)}
            helperText="At least 3 skills, comma-separated — shown on your PDF and profile."
          />
        </Paper>

        <Paper sx={{ p: { xs: 2.5, md: 3.25 }, bgcolor: 'rgba(255,255,255,0.96)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h3">Experience</Typography>
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
          <Stack spacing={2.5}>
            {form.experience.map((row, index) => (
              <Box key={`exp-${index}`}>
                {index > 0 && <Divider sx={{ mb: 2.5 }} />}
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField label="Title" required fullWidth value={row.title} onChange={(e) => updateExperience(index, 'title', e.target.value)} />
                    <TextField label="Company" required fullWidth value={row.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField label="Location" fullWidth value={row.location} onChange={(e) => updateExperience(index, 'location', e.target.value)} />
                    <TextField label="Start" placeholder="2022" fullWidth value={row.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} />
                    <TextField
                      label="End"
                      placeholder="Present"
                      fullWidth
                      disabled={row.current}
                      value={row.current ? 'Present' : row.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    />
                  </Stack>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(row.current)}
                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                      />
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
                      Remove
                    </Button>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2.5, md: 3.25 }, bgcolor: 'rgba(255,255,255,0.96)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h3">Education</Typography>
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
          <Stack spacing={2.5}>
            {form.education.map((row, index) => (
              <Box key={`edu-${index}`}>
                {index > 0 && <Divider sx={{ mb: 2.5 }} />}
                <Stack spacing={1.5}>
                  <TextField label="School" required fullWidth value={row.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField label="Degree" fullWidth value={row.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} />
                    <TextField label="Field" fullWidth value={row.field} onChange={(e) => updateEducation(index, 'field', e.target.value)} />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField label="Start" fullWidth value={row.startDate} onChange={(e) => updateEducation(index, 'startDate', e.target.value)} />
                    <TextField label="End" fullWidth value={row.endDate} onChange={(e) => updateEducation(index, 'endDate', e.target.value)} />
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
                      Remove
                    </Button>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Alert severity="info" icon={<Description />}>
          Tip: after saving, open any role and choose <strong>Use Rolefit resume</strong> on the apply form — or{' '}
          <Button component={Link} to="/jobs" size="small" sx={{ verticalAlign: 'baseline' }}>
            browse roles
          </Button>
          .
        </Alert>

        <JourneyFooter
          backTo="/applicant/profile"
          backLabel="Back to profile"
          nextTo="/jobs"
          nextLabel={liveChecklist.complete ? 'Browse roles to apply' : 'Browse roles'}
        />
      </Stack>
    </Page>
  );
}
