import { Alert, Box, Button, Link as MuiLink, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Page } from '../components/ui/Primitives';

function redirectAfterAuth(user, location) {
  const from = location.state?.from;
  if (typeof from === 'string' && from) return from;
  if (from?.pathname) return from.pathname;
  return user.role === 'recruiter' ? '/recruiter' : '/jobs';
}

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const r = await authApi.login(form);
      login(r.data);
      showToast(`Welcome back, ${r.data.user.name}`);
      navigate(redirectAfterAuth(r.data.user, location));
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthFrame title="Welcome back" subtitle="Continue where your hiring work left off.">
      <Box component="form" onSubmit={submit}>
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
  const { login } = useAuth();
  const { showToast } = useToast();
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', website: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const r = await authApi.register(role, form);
      login(r.data);
      showToast(recruiter ? 'Hiring workspace ready' : 'Account created');
      nav(redirectAfterAuth(r.data.user, location));
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthFrame
      title={recruiter ? 'Build your clearer pipeline.' : 'Find work that fits.'}
      subtitle={recruiter ? 'Set up your Rolefit hiring workspace.' : 'Create your candidate profile in minutes.'}
    >
      <Box component="form" onSubmit={submit}>
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
            helperText="Use 8+ characters with a letter and a number."
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <Alert severity="error">{String(error)}</Alert>}
          <Button type="submit" variant="contained" color="secondary" size="large" disabled={sending}>
            {sending ? 'Creating account…' : recruiter ? 'Create hiring workspace' : 'Create my account'}
          </Button>
        </Stack>
      </Box>
      <Typography mt={3} variant="body2" color="text.secondary">
        Already have an account? <MuiLink component={Link} to="/login">Sign in</MuiLink>.
        {!recruiter && (
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
    <Page narrow>
      <Typography
        sx={{ color: 'secondary.main', fontFamily: 'Syne', fontWeight: 800, letterSpacing: '0.1em', fontSize: 12, mb: 1.5 }}
      >
        ROLEFIT
      </Typography>
      <Typography variant="h2" fontSize={{ xs: 36, md: 48 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" mt={1.25} mb={3}>
        {subtitle}
      </Typography>
      <Paper sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.92)' }}>{children}</Paper>
    </Page>
  );
}
