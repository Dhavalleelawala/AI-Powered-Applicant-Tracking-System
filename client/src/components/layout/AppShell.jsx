import { Logout, Menu, WorkOutline } from '@mui/icons-material';
import { AppBar, Box, Button, Container, Drawer, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const links =
    user?.role === 'recruiter'
      ? [
          ['Dashboard', '/recruiter'],
          ['Candidates', '/recruiter/candidates'],
          ['Browse jobs', '/jobs'],
        ]
      : user
        ? [
            ['Jobs', '/jobs'],
            ['My applications', '/applicant/applications'],
            ['Saved', '/applicant/saved'],
            ['Profile', '/applicant/profile'],
          ]
        : [['Jobs', '/jobs']];

  const exit = () => {
    logout();
    nav('/');
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ bgcolor: '#F7F4EF', borderBottom: '1px solid #D9DCD5' }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 70, gap: 4 }}>
            <Typography
              component={Link}
              to="/"
              variant="h6"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontFamily: 'Syne',
                fontWeight: 800,
                letterSpacing: '-.06em',
              }}
            >
              ROLEFIT
            </Typography>
            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, flex: 1 }}>
              {links.map(([label, to]) => (
                <Typography
                  key={`${label}-${to}`}
                  component={NavLink}
                  to={to}
                  className="nav-link"
                  end={to === '/recruiter'}
                  sx={{
                    color: 'text.primary',
                    textDecoration: 'none',
                    fontSize: 14,
                    '&.active': { color: 'secondary.main', fontWeight: 700 },
                  }}
                >
                  {label}
                </Typography>
              ))}
            </Stack>
            <Box sx={{ flex: 1, display: { xs: 'block', md: 'none' } }} />
            <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={() => setOpen(true)}>
              <Menu />
            </IconButton>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {user ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {user.name} · {user.role}
                  </Typography>
                  <Button startIcon={<Logout />} onClick={exit}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login">
                    Sign in
                  </Button>
                  <Button variant="contained" component={Link} to="/register/recruiter">
                    Hire with Rolefit
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, p: 3 }}>
          <Stack spacing={2}>
            {user && (
              <Typography variant="body2" color="text.secondary">
                {user.name} · {user.role}
              </Typography>
            )}
            {links.map(([label, to]) => (
              <Button key={`${label}-${to}`} component={Link} to={to} onClick={() => setOpen(false)}>
                {label}
              </Button>
            ))}
            <Button startIcon={<WorkOutline />} component={Link} to={user ? '/jobs' : '/login'} onClick={() => setOpen(false)}>
              {user ? 'Browse roles' : 'Sign in'}
            </Button>
            {user && (
              <Button startIcon={<Logout />} onClick={exit}>
                Sign out
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>
      {children}
    </>
  );
}
