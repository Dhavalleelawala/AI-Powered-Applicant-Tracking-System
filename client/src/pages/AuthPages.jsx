import { Alert, Box, Button, Container, Link as MuiLink, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
        <Stack spacing={2}>
          <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <Alert severity="error">{String(error)}</Alert>}
          <Button type="submit" variant="contained" color="secondary" disabled={sending}>
            {sending ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Box>
      <Typography mt={3} variant="body2">
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
        <Stack spacing={2}>
          <TextField label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Work email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {recruiter && (
            <>
              <TextField label="Company name" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              <TextField label="Website (optional)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </>
          )}
          <TextField
            label="Password"
            type="password"
            helperText="Use 8+ characters with a letter and a number."
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <Alert severity="error">{String(error)}</Alert>}
          <Button type="submit" variant="contained" color="secondary" disabled={sending}>
            {sending ? 'Creating account…' : recruiter ? 'Create hiring workspace' : 'Create my account'}
          </Button>
        </Stack>
      </Box>
      <Typography mt={3} variant="body2">
        Already have an account? <MuiLink component={Link} to="/login">Sign in</MuiLink>.
      </Typography>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, children }) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 10 } }}>
      <Typography variant="h2" fontSize={{ xs: 40, md: 54 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" mt={1}>
        {subtitle}
      </Typography>
      <Paper sx={{ p: { xs: 3, md: 4 }, mt: 4 }}>{children}</Paper>
    </Container>
  );
}
