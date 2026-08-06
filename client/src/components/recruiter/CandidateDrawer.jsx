import { ErrorState } from '../ui/Primitives';
import { Close, Description, Refresh } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../api/client';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

const NEXT_STAGE = { applied: 'interview', interview: 'offered', offered: null, rejected: null };

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

/** Right-rail candidate brief with stage actions — keeps recruiters in context. */
export function CandidateDrawer({ applicationId, open, onClose, invalidateKeys = [] }) {
  const qc = useQueryClient();
  const { showToast, showError } = useToast();
  const [note, setNote] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationsApi.get(applicationId).then((r) => r.data),
    enabled: open && Boolean(applicationId),
  });

  useEffect(() => {
    if (!open) {
      setNote('');
      setRejectOpen(false);
    }
  }, [open, applicationId]);

  const bust = () => {
    qc.invalidateQueries({ queryKey: ['application', applicationId] });
    qc.invalidateQueries({ queryKey: ['recruiter-attention'] });
    qc.invalidateQueries({ queryKey: ['company-candidates'] });
    qc.invalidateQueries({ queryKey: ['recruiter-analytics'] });
    for (const key of invalidateKeys) {
      qc.invalidateQueries({ queryKey: key });
    }
  };

  const move = useMutation({
    mutationFn: ({ stage, rejectionReason }) => applicationsApi.move(applicationId, { stage, rejectionReason }),
    onSuccess: () => {
      setRejectOpen(false);
      bust();
      showToast('Stage updated');
    },
    onError: (err) => showError(err),
  });

  const addNote = useMutation({
    mutationFn: (text) => applicationsApi.addNote(applicationId, text),
    onSuccess: () => {
      setNote('');
      bust();
      showToast('Note added');
    },
    onError: (err) => showError(err),
  });

  const reanalyze = useMutation({
    mutationFn: () => applicationsApi.reanalyze(applicationId),
    onSuccess: () => {
      bust();
      showToast('Reanalysis queued');
    },
    onError: (err) => showError(err),
  });

  const app = data;
  const stage = app?.stage || 'applied';
  const next = NEXT_STAGE[stage];
  const score = app?.aiAnalysis?.matchScore;
  const matched = app?.aiAnalysis?.skillsMatched || app?.aiAnalysis?.matchedSkills || [];
  const missing = app?.aiAnalysis?.skillsMissing || app?.aiAnalysis?.gaps || [];
  const jobId = app?.job?.id || app?.jobId;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          className: 'candidate-drawer',
          sx: { width: { xs: '100%', sm: 420 }, maxWidth: '100%' },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box>
            <Typography variant="overline" color="secondary.main" fontWeight={700} letterSpacing="0.12em">
              CANDIDATE
            </Typography>
            <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.03em' }}>
              {isLoading ? 'Loading…' : app?.applicant?.name || 'Candidate'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close candidate drawer">
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ px: 2.5, pb: 3, overflow: 'auto' }}>
          {error && <ErrorState error={error} onRetry={refetch} title="Couldn’t load candidate" sx={{ mb: 2 }} />}
          {isLoading && !app ? (
            <Stack spacing={1.5}>
              <Skeleton height={28} />
              <Skeleton height={80} />
              <Skeleton height={120} />
            </Stack>
          ) : app ? (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {app.applicant?.email}
                  {app.applicant?.phone ? ` · ${app.applicant.phone}` : ''}
                </Typography>
                {app.applicant?.headline && (
                  <Typography variant="body2" mt={0.75}>
                    {app.applicant.headline}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" mt={0.75}>
                  {app.job?.title || app.jobTitle || 'Role'}
                  {app.applicant?.location ? ` · ${app.applicant.location}` : ''}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={stage} sx={{ textTransform: 'capitalize' }} color="secondary" />
                <Chip label={score != null ? `${score}% match` : 'Score pending'} variant="outlined" />
                {app.aiStatus && <Chip size="small" label={`AI: ${app.aiStatus}`} variant="outlined" />}
              </Stack>

              {app.aiAnalysis?.summary && (
                <Box>
                  <Typography variant="body2" fontWeight={700} mb={0.75}>
                    AI brief
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {app.aiAnalysis.summary}
                  </Typography>
                </Box>
              )}

              {(matched.length > 0 || missing.length > 0) && (
                <Stack spacing={1}>
                  {matched.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Matched skills
                      </Typography>
                      <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap mt={0.75}>
                        {matched.slice(0, 8).map((skill) => (
                          <Chip key={skill} size="small" label={skill} color="success" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  {missing.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Gaps
                      </Typography>
                      <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap mt={0.75}>
                        {missing.slice(0, 8).map((skill) => (
                          <Chip key={skill} size="small" label={skill} color="warning" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              )}

              {(app.applicant?.skills || []).length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Profile skills
                  </Typography>
                  <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap mt={0.75}>
                    {app.applicant.skills.slice(0, 10).map((skill) => (
                      <Chip key={skill} size="small" label={skill} variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}

              <Divider />

              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={700}>
                  Decide
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {next && (
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={move.isPending}
                      onClick={() => move.mutate({ stage: next })}
                    >
                      Advance to {next}
                    </Button>
                  )}
                  {stage !== 'rejected' && (
                    <Button color="error" variant="outlined" disabled={move.isPending} onClick={() => setRejectOpen(true)}>
                      Reject
                    </Button>
                  )}
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    startIcon={<Description />}
                    onClick={() => openResume(applicationId).catch((err) => showError(err.message || err))}
                  >
                    Resume
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    disabled={reanalyze.isPending}
                    onClick={() => reanalyze.mutate()}
                  >
                    Re-score
                  </Button>
                  {jobId && (
                    <Button size="small" component={Link} to={`/recruiter/jobs/${jobId}/applications`} onClick={onClose}>
                      Pipeline
                    </Button>
                  )}
                </Stack>
              </Stack>

              <Box>
                <Typography variant="body2" fontWeight={700} mb={1}>
                  Add note
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Interview feedback, context for the team…"
                />
                <Button
                  sx={{ mt: 1 }}
                  size="small"
                  variant="outlined"
                  disabled={!note.trim() || addNote.isPending}
                  onClick={() => addNote.mutate(note.trim())}
                >
                  Save note
                </Button>
              </Box>

              {(app.recruiterNotes || []).length > 0 && (
                <Box>
                  <Typography variant="body2" fontWeight={700} mb={1}>
                    Notes
                  </Typography>
                  <Stack spacing={1}>
                    {[...app.recruiterNotes].reverse().slice(0, 5).map((entry, index) => (
                      <Box key={`${entry.createdAt || index}`} sx={{ p: 1.25, bgcolor: 'rgba(18,21,28,0.04)', borderRadius: 1.5 }}>
                        <Typography variant="body2">{entry.text}</Typography>
                        {entry.createdAt && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(entry.createdAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          ) : null}
        </Box>
      </Drawer>

      <ConfirmDialog
        open={rejectOpen}
        title="Reject candidate?"
        description={`${app?.applicant?.name || 'This candidate'} will move to Rejected.`}
        confirmLabel="Reject"
        confirmColor="error"
        requireReason
        reasonLabel="Reason (shared internally)"
        loading={move.isPending}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => move.mutate({ stage: 'rejected', rejectionReason: reason || undefined })}
      />
    </>
  );
}
