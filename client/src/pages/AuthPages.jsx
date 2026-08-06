import { Alert, Box, Button, Link as MuiLink, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function redirectAfterAuth(user, location) {
  const from = location.state?.from;
  if (typeof from === 'string' && from) return from;
  if (from?.pathname) return from.pathname;
  return user.role === 'recruiter' ? '/recruiter' : '/jobs';
}

function homeForRole(user) {
  return user?.role === 'recruiter' ? '/recruiter' : '/jobs';
}

function passwordHint(password) {
  if (!password) return '';
  if (password.length < 8) return 'Needs at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Include both a letter and a number.';
  return '';
}

export function LoginPage() {
  const { user, login } = useAuth();
  const { showToast, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (user) return <Navigate to={homeForRole(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const r = await authApi.login(form);
      login(r.data);
      showToast(`Welcome back, ${r.data.user.name}`);
      navigate(redirectAfterAuth(r.data.user, location));
    } catch (err) {
      setError(err);
      showError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthFrame title="Welcome back" subtitle="Continue where your hiring work left off.">
      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={2.25}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <Alert severity="error">{String(error)}</Alert>}
          <Button type="submit" variant="contained" color="secondary" size="large" disabled={sending}>
            {sending ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Box>
      <Typography mt={3} variant="body2" color="text.secondary">
        New here? <MuiLink component={Link} to="/register/applicant">Join as an applicant</MuiLink> or{' '}
        <MuiLink component={Link} to="/register/recruiter">start hiring</MuiLink>.
      </Typography>
    </AuthFrame>
  );
}

export function RegisterPage({ role }) {
  const recruiter = role === 'recruiter';
  const { user, login } = useAuth();
  const { showToast, showError } = useToast();
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', website: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const hint = passwordHint(form.password);

  if (user) return <Navigate to={homeForRole(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please complete the required fields.');
      return;
    }
    if (recruiter && !form.companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    if (hint) {
      setError(hint);
      return;
    }
    setSending(true);
    setError('');
    try {
      const r = await authApi.register(role, form);
      login(r.data);
      showToast(recruiter ? 'Hiring workspace ready' : 'Account created');
      nav(redirectAfterAuth(r.data.user, location));
    } catch (err) {
      setError(err);
      showError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthFrame
      title={recruiter ? 'Build your clearer pipeline.' : 'Find work that fits.'}
      subtitle={recruiter ? 'Set up your Rolefit hiring workspace.' : 'Create your candidate profile in minutes.'}
    >
      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={2.25}>
          <TextField label="Full name" autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Work email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {recruiter && (
            <>
              <TextField label="Company name" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              <TextField label="Website (optional)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </>
          )}
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            helperText={hint || 'Use 8+ characters with a letter and a number.'}
            error={Boolean(hint)}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <Alert severity="error">{String(error)}</Alert>}
          <Button type="submit" variant="contained" color="secondary" size="large" disabled={sending || Boolean(hint && form.password)}>
            {sending ? 'Creating account…' : recruiter ? 'Create hiring workspace' : 'Create my account'}
          </Button>
        </Stack>
      </Box>
      <Typography mt={3} variant="body2" color="text.secondary">
        Already have an account? <MuiLink component={Link} to="/login">Sign in</MuiLink>.
        {recruiter ? (
          <>
            {' '}Looking for a role? <MuiLink component={Link} to="/register/applicant">Join as an applicant</MuiLink>.
          </>
        ) : (
          <>
            {' '}Looking to hire? <MuiLink component={Link} to="/register/recruiter">Start as a recruiter</MuiLink>.
          </>
        )}
      </Typography>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, children }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' }, minHeight: { md: 'calc(100vh - 68px)' } }}>
      <Box
        className="auth-panel"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-end',
          color: '#F7F4EF',
          p: { md: 6, lg: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            border: '1px solid rgba(31,167,160,0.35)',
            right: '-12%',
            top: '-18%',
          }}
        />
        <Typography sx={{ color: 'secondary.main', fontFamily: 'Syne', fontWeight: 800, letterSpacing: '.14em', fontSize: 12 }}>
          ROLEFIT
        </Typography>
        <Typography variant="h2" fontSize={{ md: 44, lg: 52 }} mt={2} maxWidth={420} sx={{ color: '#F7F4EF' }}>
          Decisions with context, not clutter.
        </Typography>
        <Typography mt={2} maxWidth={360} sx={{ color: '#A8B8B1', lineHeight: 1.7 }}>
          Rank candidates against the role, move them through a calm pipeline, and keep every next step obvious.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', py: { xs: 5, md: 6 }, px: { xs: 2.5, sm: 4, md: 5 }, width: '100%' }}>
        <Box className="page-enter" sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
          <Typography
            sx={{ color: 'secondary.main', fontFamily: 'Syne', fontWeight: 800, letterSpacing: '0.1em', fontSize: 12, mb: 1.5 }}
          >
            ROLEFIT
          </Typography>
          <Typography variant="h2" fontSize={{ xs: 34, md: 42 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" mt={1.25} mb={3.25} sx={{ lineHeight: 1.65 }}>
            {subtitle}
          </Typography>
          <Paper sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.94)' }}>{children}</Paper>
        </Box>
      </Box>
    </Box>
  );
}
