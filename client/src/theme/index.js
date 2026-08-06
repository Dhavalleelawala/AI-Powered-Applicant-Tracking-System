import { createTheme } from '@mui/material/styles';

const ink = '#0B1F1A';
const teal = '#1FA7A0';
const tealDeep = '#178F89';
const paper = '#EEF2F0';
const cream = '#F7F4EF';
const line = '#CDD6D1';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ink, light: '#1A332C', dark: '#061410', contrastText: cream },
    secondary: { main: teal, light: '#4BC4BE', dark: tealDeep, contrastText: ink },
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
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.55 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '-0.01em' },
    overline: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '0.12em' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: paper,
          backgroundImage:
            'radial-gradient(ellipse 90% 55% at 0% -15%, rgba(31,167,160,0.1), transparent 55%), radial-gradient(ellipse 55% 45% at 100% 0%, rgba(11,31,26,0.05), transparent 52%)',
          backgroundAttachment: 'fixed',
        },
        '*:focus-visible': {
          outline: `2px solid ${teal}`,
          outlineOffset: 2,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 18px',
          transition: 'transform .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease',
        },
        sizeLarge: { padding: '12px 22px', fontSize: 15 },
        contained: {
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        containedSecondary: {
          boxShadow: '0 1px 0 rgba(11,31,26,0.06)',
          '&:hover': { backgroundColor: tealDeep },
        },
        outlined: {
          borderColor: line,
          '&:hover': { borderColor: teal, backgroundColor: 'rgba(31,167,160,0.06)' },
        },
        text: {
          '&:hover': { backgroundColor: 'rgba(31,167,160,0.08)' },
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
        sizeSmall: { height: 26 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderRadius: 12,
          transition: 'background-color .15s ease',
          '&.Mui-focused': { backgroundColor: '#fff' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: teal, borderWidth: 2 },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: '#5A6F68', borderBottomColor: line, backgroundColor: 'rgba(238,242,240,0.85)' },
        body: { borderBottomColor: line },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color .15s ease',
          '&:hover': { backgroundColor: 'rgba(31,167,160,0.04)' },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, border: `1px solid ${line}` },
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
        paper: { backgroundColor: cream, borderLeft: `1px solid ${line}` },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, border: `1px solid ${line}` },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(11,31,26,0.06)' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 6, backgroundColor: 'rgba(31,167,160,0.15)' },
        bar: { borderRadius: 99 },
      },
    },
  },
});
