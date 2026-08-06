import { createTheme } from '@mui/material/styles';

/** Rolefit "Ember Ledger" — cool ink + ember accent (replaces forest/teal). */
const ink = '#12151C';
const inkSoft = '#1C2230';
const ember = '#FF5C35';
const emberDeep = '#E04828';
const paper = '#EEF1F6';
const mist = '#F7F8FB';
const line = '#D5DBE5';
const textPrimary = '#171A22';
const textSecondary = '#667085';

const display = '"Outfit", sans-serif';
const body = '"Manrope", sans-serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ink, light: inkSoft, dark: '#0A0C10', contrastText: mist },
    secondary: { main: ember, light: '#FF7A58', dark: emberDeep, contrastText: '#FFFFFF' },
    background: { default: paper, paper: '#FFFFFF' },
    text: { primary: textPrimary, secondary: textSecondary },
    error: { main: '#D64545' },
    warning: { main: '#D97706' },
    success: { main: '#0F8A5F' },
    info: { main: '#3E6B8A' },
    divider: line,
  },
  typography: {
    fontFamily: body,
    htmlFontSize: 16,
    h1: {
      fontFamily: display,
      fontWeight: 700,
      letterSpacing: '-0.045em',
      lineHeight: 0.98,
      fontSize: 'clamp(2.75rem, 6vw, 5.5rem)',
    },
    h2: {
      fontFamily: display,
      fontWeight: 700,
      letterSpacing: '-0.035em',
      lineHeight: 1.08,
      fontSize: 'clamp(1.85rem, 3.2vw, 2.85rem)',
    },
    h3: {
      fontFamily: display,
      fontWeight: 650,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
      fontSize: 'clamp(1.25rem, 1.8vw, 1.55rem)',
    },
    h4: {
      fontFamily: display,
      fontWeight: 650,
      letterSpacing: '-0.02em',
      fontSize: '1.25rem',
    },
    h5: {
      fontFamily: display,
      fontWeight: 650,
      fontSize: '1.1rem',
    },
    h6: {
      fontFamily: display,
      fontWeight: 650,
      fontSize: '1rem',
    },
    subtitle1: { fontSize: '1.05rem', lineHeight: 1.55, fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.65 },
    body2: { fontSize: '0.925rem', lineHeight: 1.55 },
    button: {
      fontFamily: body,
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '-0.01em',
      fontSize: '0.95rem',
    },
    caption: { fontSize: '0.8rem', lineHeight: 1.45, color: textSecondary },
    overline: {
      fontFamily: display,
      fontWeight: 700,
      letterSpacing: '0.14em',
      fontSize: '0.7rem',
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: paper,
          backgroundImage:
            'radial-gradient(ellipse 85% 50% at 0% -12%, rgba(255,92,53,0.08), transparent 55%), radial-gradient(ellipse 55% 45% at 100% 0%, rgba(18,21,28,0.05), transparent 52%)',
          backgroundAttachment: 'fixed',
        },
        '*:focus-visible': {
          outline: `2px solid ${ember}`,
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
          transition: 'transform .18s ease, background-color .18s ease, border-color .18s ease',
        },
        sizeLarge: { padding: '12px 22px', fontSize: '1rem' },
        sizeSmall: { padding: '6px 12px', fontSize: '0.85rem' },
        contained: {
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        containedSecondary: {
          '&:hover': { backgroundColor: emberDeep },
        },
        outlined: {
          borderColor: line,
          '&:hover': { borderColor: ember, backgroundColor: 'rgba(255,92,53,0.06)' },
        },
        text: {
          '&:hover': { backgroundColor: 'rgba(255,92,53,0.08)' },
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
        root: { borderRadius: 8, fontWeight: 600, fontFamily: body },
        sizeSmall: { height: 26 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderRadius: 12,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ember, borderWidth: 2 },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: textSecondary,
          borderBottomColor: line,
          backgroundColor: 'rgba(238,241,246,0.9)',
          fontFamily: body,
        },
        body: { borderBottomColor: line },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color .15s ease',
          '&:hover': { backgroundColor: 'rgba(255,92,53,0.04)' },
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
        paper: { backgroundColor: mist, borderLeft: `1px solid ${line}` },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, border: `1px solid ${line}` },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(18,21,28,0.07)' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 6, backgroundColor: 'rgba(255,92,53,0.15)' },
        bar: { borderRadius: 99 },
      },
    },
  },
});

export const brand = { ink, ember, paper, mist, line, display, body };
