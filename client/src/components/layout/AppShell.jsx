import { Logout, Menu } from '@mui/icons-material';
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
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { OfflineBanner } from './OfflineBanner';

function BrandLockup({ light = false, to = '/' }) {
  return (
    <Stack
      component={Link}
      to={to}
      direction="row"
      spacing={1.1}
      alignItems="center"
      sx={{ color: 'inherit', textDecoration: 'none' }}
    >
      <Box className="brand-mark" sx={light ? { boxShadow: '0 0 0 1px rgba(247,248,251,0.18)' } : undefined}>
        R
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Outfit',
            fontWeight: 800,
            letterSpacing: '-.04em',
            lineHeight: 1,
          }}
        >
          ROLEFIT
        </Typography>
      </Box>
    </Stack>
  );
}

function WorkspaceChip({ role }) {
  if (!role) return null;
  return (
    <Typography
      component="span"
      className={`workspace-chip workspace-chip--${role}`}
      sx={{
        display: { xs: 'none', sm: 'inline-flex' },
        ml: 1,
        px: 1,
        py: 0.35,
        borderRadius: 1,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: 'Outfit',
      }}
    >
      {role === 'recruiter' ? 'Hiring' : 'Career'}
    </Typography>
  );
}

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isLanding = location.pathname === '/';
  const role = user?.role;
  const density = role === 'recruiter' ? 'recruiter' : role === 'applicant' ? 'applicant' : 'public';
  const homeTo = role === 'recruiter' ? '/recruiter' : role === 'applicant' ? '/applicant' : '/';

  useEffect(() => {
    document.documentElement.dataset.density = density;
    document.documentElement.dataset.workspace = density;
    return () => {
      delete document.documentElement.dataset.density;
      delete document.documentElement.dataset.workspace;
    };
  }, [density]);

  const links =
    role === 'recruiter'
      ? [
          ['Decisions', '/recruiter'],
          ['Directory', '/recruiter/candidates'],
          ['Board', '/jobs'],
        ]
      : role === 'applicant'
        ? [
            ['Ready', '/applicant'],
            ['Roles', '/jobs'],
            ['Pipeline', '/applicant/applications'],
            ['Resume', '/applicant/resume'],
            ['Saved', '/applicant/saved'],
            ['Profile', '/applicant/profile'],
          ]
        : [
            ['Open roles', '/jobs'],
            ['Sign in', '/login'],
          ];

  const primaryCta =
    role === 'recruiter'
      ? { label: 'New role', to: '/recruiter/jobs/new' }
      : role === 'applicant'
        ? { label: 'Browse roles', to: '/jobs' }
        : { label: 'Start hiring', to: '/register/recruiter' };

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

  const barSx =
    isLanding
      ? {
          bgcolor: 'rgba(18,21,28,0.82)',
          borderColor: 'rgba(247,248,251,0.08)',
          color: '#F7F8FB',
        }
      : role === 'recruiter'
        ? {
            bgcolor: 'rgba(18,21,28,0.96)',
            borderColor: 'rgba(247,248,251,0.1)',
            color: '#F7F8FB',
          }
        : role === 'applicant'
          ? {
              bgcolor: 'rgba(247,248,251,0.92)',
              borderColor: 'divider',
              color: 'text.primary',
            }
          : {
              bgcolor: 'rgba(238,241,246,0.88)',
              borderColor: 'divider',
              color: 'text.primary',
            };

  const lightChrome = isLanding || role === 'recruiter';
  const toolbarMin = role === 'recruiter' ? 56 : 68;

  return (
    <Box
      className={`app-shell app-shell--${density}`}
      sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Button
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 16,
          top: 12,
          zIndex: 2000,
          transform: 'translateY(-120%)',
          bgcolor: 'secondary.main',
          color: 'primary.main',
          '&:focus': { transform: 'translateY(0)' },
        }}
      >
        Skip to content
      </Button>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        className={`shell-bar shell-bar--${density}`}
        sx={{
          ...barSx,
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: toolbarMin, gap: { xs: 1, md: 2 } }}>
            <Stack direction="row" alignItems="center">
              <BrandLockup light={lightChrome} to={homeTo} />
              <WorkspaceChip role={role} />
            </Stack>

            <Stack
              direction="row"
              spacing={role === 'recruiter' ? 2 : 2.5}
              sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, ml: 2 }}
            >
              {links.map(([label, to]) => (
                <Typography
                  key={`${label}-${to}`}
                  component={NavLink}
                  to={to}
                  className="nav-link"
                  end={to === '/recruiter' || to === '/applicant' || to === '/'}
                  sx={{
                    color: 'inherit',
                    opacity: 0.78,
                    textDecoration: 'none',
                    fontSize: role === 'recruiter' ? 13 : 14,
                    fontWeight: 500,
                    letterSpacing: role === 'recruiter' ? '0.01em' : 0,
                    '&.active': {
                      opacity: 1,
                      fontWeight: 700,
                      color: lightChrome ? '#FF8A6A' : 'secondary.main',
                    },
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
                  <Stack
                    direction="row"
                    spacing={1.1}
                    alignItems="center"
                    sx={{
                      mr: 0.5,
                      px: 1.25,
                      py: 0.55,
                      borderRadius: 2,
                      bgcolor: lightChrome ? 'rgba(247,248,251,0.08)' : 'rgba(18,21,28,0.04)',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: role === 'recruiter' ? 28 : 30,
                        height: role === 'recruiter' ? 28 : 30,
                        bgcolor: 'secondary.main',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} lineHeight={1.15} noWrap>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.65 }}>
                        {role === 'recruiter' ? 'Hiring workspace' : 'Career workspace'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    component={Link}
                    to={primaryCta.to}
                  >
                    {primaryCta.label}
                  </Button>
                  <Button
                    startIcon={<Logout />}
                    onClick={exit}
                    sx={{ color: 'inherit', borderColor: lightChrome ? 'rgba(247,248,251,0.22)' : 'divider' }}
                    variant="outlined"
                    size="small"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  {!isLanding && (
                    <Button component={Link} to="/login" sx={{ color: 'inherit' }}>
                      Sign in
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    component={Link}
                    to={isLanding ? '/register/recruiter' : primaryCta.to}
                  >
                    {isLanding ? 'Start hiring' : primaryCta.label}
                  </Button>
                  {isLanding && (
                    <Button
                      component={Link}
                      to="/jobs"
                      sx={{ color: 'inherit', borderColor: 'rgba(247,248,251,0.28)' }}
                      variant="outlined"
                    >
                      Find work
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <OfflineBanner />

      <Drawer open={open} onClose={() => setOpen(false)} anchor="right">
        <Box sx={{ width: 300, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center">
            <BrandLockup to={homeTo} />
            <WorkspaceChip role={role} />
          </Stack>
          {user && (
            <Stack direction="row" spacing={1.25} alignItems="center" mt={3} mb={1}>
              <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff', fontWeight: 800 }}>{initials}</Avatar>
              <Box>
                <Typography fontWeight={700}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {role === 'recruiter' ? 'Hiring workspace' : 'Career workspace'}
                </Typography>
              </Box>
            </Stack>
          )}
          <Divider sx={{ my: 2 }} />
          <Stack spacing={0.5} flex={1}>
            {links.map(([label, to]) => (
              <Button
                key={`${label}-${to}`}
                component={Link}
                to={to}
                onClick={() => setOpen(false)}
                sx={{ justifyContent: 'flex-start', py: 1.25 }}
              >
                {label}
              </Button>
            ))}
            {!user && (
              <Button component={Link} to="/register/applicant" onClick={() => setOpen(false)} sx={{ justifyContent: 'flex-start', py: 1.25 }}>
                Join as an applicant
              </Button>
            )}
          </Stack>
          {user ? (
            <>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to={primaryCta.to}
                onClick={() => setOpen(false)}
                sx={{ mb: 1 }}
              >
                {primaryCta.label}
              </Button>
              <Button startIcon={<Logout />} onClick={exit} color="inherit">
                Sign out
              </Button>
            </>
          ) : (
            <Button component={Link} to="/register/recruiter" variant="contained" color="secondary" onClick={() => setOpen(false)}>
              Start hiring
            </Button>
          )}
        </Box>
      </Drawer>

      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        className={`shell-main density-${density}`}
        sx={{ flex: 1, outline: 'none' }}
      >
        {children}
      </Box>

      {!isLanding && (
        <Box
          component="footer"
          className={`shell-footer shell-footer--${density}`}
          sx={{
            borderTop: '1px solid',
            borderColor: role === 'recruiter' ? 'rgba(247,248,251,0.08)' : 'divider',
            py: role === 'recruiter' ? 2.5 : 3.5,
            mt: 'auto',
            bgcolor: role === 'recruiter' ? '#12151C' : 'rgba(255,255,255,0.35)',
            color: role === 'recruiter' ? '#F7F8FB' : 'inherit',
          }}
        >
          <Container maxWidth="xl">
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
              <BrandLockup light={role === 'recruiter'} to={homeTo} />
              <Typography variant="body2" sx={{ opacity: role === 'recruiter' ? 0.7 : 1 }} color={role === 'recruiter' ? 'inherit' : 'text.secondary'}>
                {role === 'recruiter'
                  ? 'Decide who to interview next.'
                  : role === 'applicant'
                    ? 'Ready your profile. Apply with clarity.'
                    : 'Hiring clarity, at human speed.'}
              </Typography>
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
}
