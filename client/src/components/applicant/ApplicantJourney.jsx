import { Check } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicantReadiness } from '../../utils/applicantCompleteness';

const STEPS = [
  { id: 'home', label: 'Ready', to: '/applicant' },
  { id: 'profile', label: 'Profile', to: '/applicant/profile' },
  { id: 'resume', label: 'Resume', to: '/applicant/resume' },
  { id: 'apply', label: 'Apply', to: '/jobs' },
];

function stepStatus(stepId, current, readiness) {
  const order = STEPS.map((s) => s.id);
  const currentIdx = order.indexOf(current);
  const idx = order.indexOf(stepId);

  if (stepId === 'profile' && readiness.profile.complete && current !== 'profile') return 'done';
  if (stepId === 'resume' && readiness.resume.complete && current !== 'resume') return 'done';
  if (stepId === 'home' && readiness.readyToApply && current !== 'home') return 'done';
  if (stepId === 'apply' && readiness.readyToApply && current === 'apply') return 'current';
  if (idx < currentIdx) {
    if (stepId === 'profile') return readiness.profile.complete ? 'done' : 'todo';
    if (stepId === 'resume') return readiness.resume.complete ? 'done' : 'todo';
    if (stepId === 'home') return 'done';
  }
  if (idx === currentIdx) return 'current';
  return 'todo';
}

/** Shared step chrome so applicant surfaces feel like one journey. */
export function ApplicantJourney({ current = 'home', nextHint }) {
  const { user } = useAuth();
  const readiness = applicantReadiness(user);

  const nextAction = (() => {
    if (!readiness.profile.complete) {
      return { label: 'Complete profile', to: '/applicant/profile' };
    }
    if (!readiness.resume.complete) {
      return { label: 'Complete resume', to: '/applicant/resume' };
    }
    if (current === 'apply') return null;
    return { label: 'Browse roles to apply', to: '/jobs' };
  })();

  return (
    <Box className="applicant-journey" sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 0 }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box className="applicant-journey__track" aria-label="Application journey">
          {STEPS.map((step, index) => {
            const status = stepStatus(step.id, current, readiness);
            return (
              <Box key={step.id} className={`applicant-journey__step is-${status}`}>
                {index > 0 && <span className="applicant-journey__line" aria-hidden />}
                <Box
                  component={Link}
                  to={step.to}
                  className="applicant-journey__dot-wrap"
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  <span className="applicant-journey__dot">
                    {status === 'done' ? <Check sx={{ fontSize: 14 }} /> : index + 1}
                  </span>
                  <Typography component="span" className="applicant-journey__label">
                    {step.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        {(nextHint !== null && (nextHint || nextAction)) && (
          <Button
            component={Link}
            to={(nextHint || nextAction).to}
            variant="contained"
            color="secondary"
            size="small"
            sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, flexShrink: 0 }}
          >
            {(nextHint || nextAction).label}
          </Button>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
        {readiness.readyToApply
          ? 'Profile and resume look ready — pick a role when you are.'
          : `Journey ${readiness.percent}% complete · finish required details before apply.`}
      </Typography>
    </Box>
  );
}

export function JourneyFooter({ backTo, backLabel, nextTo, nextLabel, nextDisabled }) {
  return (
    <Stack
      className="journey-footer-cta"
      direction={{ xs: 'column-reverse', sm: 'row' }}
      spacing={1.25}
      justifyContent="space-between"
      alignItems={{ sm: 'center' }}
      mt={3}
    >
      {backTo ? (
        <Button component={Link} to={backTo} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {backLabel || 'Back'}
        </Button>
      ) : (
        <span />
      )}
      {nextTo && (
        <Button
          component={Link}
          to={nextTo}
          variant="contained"
          color="secondary"
          disabled={nextDisabled}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {nextLabel || 'Continue'}
        </Button>
      )}
    </Stack>
  );
}
