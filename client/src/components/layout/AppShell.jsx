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
import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { OfflineBanner } from './OfflineBanner';

function BrandLockup({ light = false }) {
  return (
    <Stack
      component={Link}
      to="/"
      direction="row"
      spacing={1.1}
      alignItems="center"
      sx={{ color: 'inherit', textDecoration: 'none' }}
    >
      <Box className="brand-mark" sx={light ? { boxShadow: '0 0 0 1px rgba(247,248,251,0.18)' } : undefined}>
        R
      </Box>
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
    </Stack>
  );
}

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
        : [['Jobs', '/jobs']];

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
        sx={{
          bgcolor: isLanding ? 'rgba(18,21,28,0.82)' : 'rgba(238,241,246,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid',
          borderColor: isLanding ? 'rgba(247,248,251,0.08)' : 'divider',
          color: isLanding ? '#F7F8FB' : 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 68, gap: { xs: 1, md: 2.5 } }}>
            <BrandLockup light={isLanding} />

            <Stack direction="row" spacing={2.5} sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, ml: 2.5 }}>
              {links.map(([label, to]) => (
                <Typography
                  key={`${label}-${to}`}
                  component={NavLink}
                  to={to}
                  className="nav-link"
                  end={to === '/recruiter' || to === '/'}
                  sx={{
                    color: 'inherit',
                    opacity: 0.78,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    '&.active': { opacity: 1, fontWeight: 700, color: isLanding ? '#FF8A6A' : 'secondary.main' },
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
                      py: 0.6,
                      borderRadius: 2,
                      bgcolor: isLanding ? 'rgba(247,248,251,0.08)' : 'rgba(18,21,28,0.04)',
                    }}
                  >
                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'secondary.main', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                      {initials}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} lineHeight={1.15} noWrap>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.65, textTransform: 'capitalize' }}>
                        {user.role}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    startIcon={<Logout />}
                    onClick={exit}
                    sx={{ color: 'inherit', borderColor: isLanding ? 'rgba(247,244,239,0.22)' : 'divider' }}
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
                    Start hiring
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <OfflineBanner />

      <Drawer open={open} onClose={() => setOpen(false)} anchor="right">
        <Box sx={{ width: 300, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <BrandLockup />
          {user && (
            <Stack direction="row" spacing={1.25} alignItems="center" mt={3} mb={1}>
              <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 800 }}>{initials}</Avatar>
              <Box>
                <Typography fontWeight={700}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                  {user.role}
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
              <>
                <Button component={Link} to="/login" onClick={() => setOpen(false)} sx={{ justifyContent: 'flex-start', py: 1.25 }}>
                  Sign in
                </Button>
                <Button component={Link} to="/register/applicant" onClick={() => setOpen(false)} sx={{ justifyContent: 'flex-start', py: 1.25 }}>
                  Join as applicant
                </Button>
              </>
            )}
          </Stack>
          {user ? (
            <Button startIcon={<Logout />} onClick={exit} color="inherit">
              Sign out
            </Button>
          ) : (
            <Button component={Link} to="/register/recruiter" variant="contained" color="secondary" onClick={() => setOpen(false)}>
              Start hiring
            </Button>
          )}
        </Box>
      </Drawer>

      <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, outline: 'none' }}>
        {children}
      </Box>

      {!isLanding && (
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            py: 3.5,
            mt: 'auto',
            bgcolor: 'rgba(255,255,255,0.35)',
          }}
        >
          <Container maxWidth="xl">
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
              <BrandLockup />
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
