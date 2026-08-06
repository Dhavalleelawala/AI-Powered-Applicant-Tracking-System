import { Logout, Menu, WorkOutline } from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isLanding = location.pathname === '/';

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
            ['Applications', '/applicant/applications'],
            ['Saved', '/applicant/saved'],
            ['Profile', '/applicant/profile'],
          ]
        : [
            ['Jobs', '/jobs'],
            ['Sign in', '/login'],
          ];

  const exit = () => {
    logout();
    setOpen(false);
    nav('/');
  };

  const initials = String(user?.name || 'R')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          bgcolor: isLanding ? 'rgba(11,31,26,0.72)' : 'rgba(244,247,245,0.82)',
          backdropFilter: 'blur(14px)',
          borderBottom: isLanding ? '1px solid rgba(247,244,239,0.08)' : '1px solid',
          borderColor: isLanding ? 'transparent' : 'divider',
          color: isLanding ? '#F7F4EF' : 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 72, gap: { xs: 1, md: 3 } }}>
            <Typography
              component={Link}
              to="/"
              variant="h6"
              sx={{
                color: 'inherit',
                textDecoration: 'none',
                fontFamily: 'Syne',
                fontWeight: 800,
                letterSpacing: '-.06em',
                mr: 1,
              }}
            >
              ROLEFIT
            </Typography>

            <Stack direction="row" spacing={2.75} sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, ml: 2 }}>
              {links.map(([label, to]) => (
                <Typography
                  key={`${label}-${to}`}
                  component={NavLink}
                  to={to}
                  className="nav-link"
                  end={to === '/recruiter' || to === '/'}
                  sx={{
                    color: 'inherit',
                    opacity: 0.82,
                    textDecoration: 'none',
                    fontSize: 14,
                    '&.active': { opacity: 1, fontWeight: 700, color: isLanding ? '#7FE0D9' : 'secondary.main' },
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {label}
                </Typography>
              ))}
            </Stack>

            <Box sx={{ flex: 1, display: { xs: 'block', md: 'none' } }} />

            <IconButton
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'inherit' }}
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </IconButton>

            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {user ? (
                <>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 0.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'primary.main', fontSize: 13, fontWeight: 800 }}>
                      {initials}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'capitalize' }}>
                        {user.role}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    startIcon={<Logout />}
                    onClick={exit}
                    sx={{ color: 'inherit', borderColor: isLanding ? 'rgba(247,244,239,0.25)' : 'divider' }}
                    variant="outlined"
                    size="small"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" sx={{ color: 'inherit' }}>
                    Sign in
                  </Button>
                  <Button
                    variant="contained"
                    color={isLanding ? 'secondary' : 'primary'}
                    component={Link}
                    to="/register/recruiter"
                  >
                    Hire with Rolefit
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)} anchor="right">
        <Box sx={{ width: 290, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography fontFamily="Syne" fontWeight={800} letterSpacing="-.06em" mb={2}>
            ROLEFIT
          </Typography>
          {user && (
            <Stack direction="row" spacing={1.25} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 800 }}>{initials}</Avatar>
              <Box>
                <Typography fontWeight={700}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                  {user.role}
                </Typography>
              </Box>
            </Stack>
          )}
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1} flex={1}>
            {links.map(([label, to]) => (
              <Button
                key={`${label}-${to}`}
                component={Link}
                to={to}
                onClick={() => setOpen(false)}
                sx={{ justifyContent: 'flex-start' }}
              >
                {label}
              </Button>
            ))}
            {!user && (
              <Button
                startIcon={<WorkOutline />}
                component={Link}
                to="/register/applicant"
                onClick={() => setOpen(false)}
                sx={{ justifyContent: 'flex-start' }}
              >
                Join as applicant
              </Button>
            )}
          </Stack>
          {user ? (
            <Button startIcon={<Logout />} onClick={exit} color="inherit">
              Sign out
            </Button>
          ) : (
            <Button component={Link} to="/register/recruiter" variant="contained" color="secondary" onClick={() => setOpen(false)}>
              Hire with Rolefit
            </Button>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      {!isLanding && (
        <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3, mt: 'auto' }}>
          <Container maxWidth="xl">
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Typography fontFamily="Syne" fontWeight={800} letterSpacing="-.04em">
                ROLEFIT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiring clarity, at human speed.
              </Typography>
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
}
