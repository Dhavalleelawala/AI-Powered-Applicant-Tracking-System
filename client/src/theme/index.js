import { createTheme } from '@mui/material/styles';

const ink = '#0B1F1A';
const teal = '#1FA7A0';
const paper = '#F4F7F5';
const line = '#D4DBD6';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ink, contrastText: '#F7F4EF' },
    secondary: { main: teal, contrastText: ink },
    background: { default: paper, paper: '#FFFFFF' },
    text: { primary: '#14201C', secondary: '#5A6F68' },
    error: { main: '#B84335' },
    warning: { main: '#C47B2D' },
    success: { main: '#2F7D57' },
    info: { main: '#3A6B8C' },
    divider: line,
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 0.95 },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 750, letterSpacing: '-0.045em', lineHeight: 1.05 },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '-0.03em' },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '-0.01em' },
    overline: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '0.12em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 0% -10%, rgba(31,167,160,0.08), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(11,31,26,0.04), transparent 50%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 18px',
          transition: 'transform .18s ease, background-color .18s ease, border-color .18s ease',
        },
        contained: {
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        outlined: {
          borderColor: line,
          '&:hover': { borderColor: teal, backgroundColor: 'rgba(31,167,160,0.06)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${line}`,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderRadius: 10,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: teal, borderWidth: 2 },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: '#5A6F68', borderBottomColor: line },
        body: { borderBottomColor: line },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${line}`,
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: 0 },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: paper, borderRight: `1px solid ${line}` },
      },
    },
  },
});
