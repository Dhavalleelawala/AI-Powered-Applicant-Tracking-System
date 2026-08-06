import { createTheme } from '@mui/material/styles';

/** Rolefit "Ember Ledger" — cool ink + ember accent; tuned for role-workspace readability. */
const ink = '#12151C';
const inkSoft = '#1C2230';
const ember = '#FF5C35';
const emberDeep = '#E04828';
const paper = '#EEF1F6';
const mist = '#F7F8FB';
const line = '#C8D0DC';
const textPrimary = '#0F1218';
const textSecondary = '#3F4A5C';

const display = '"Outfit", sans-serif';
const body = '"Manrope", sans-serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ink, light: inkSoft, dark: '#0A0C10', contrastText: mist },
    secondary: { main: ember, light: '#FF7A58', dark: emberDeep, contrastText: '#FFFFFF' },
    background: { default: paper, paper: '#FFFFFF' },
    text: { primary: textPrimary, secondary: textSecondary },
    error: { main: '#C62828' },
    warning: { main: '#B45309' },
    success: { main: '#0B7A54' },
    info: { main: '#2F5F7A' },
    divider: line,
  },
  typography: {
    fontFamily: body,
    htmlFontSize: 16,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: {
      fontFamily: display,
      fontWeight: 700,
      letterSpacing: '-0.045em',
      lineHeight: 0.98,
      fontSize: 'clamp(2.75rem, 6vw, 5.5rem)',
      color: textPrimary,
    },
    h2: {
      fontFamily: display,
      fontWeight: 700,
      letterSpacing: '-0.035em',
      lineHeight: 1.08,
      fontSize: 'clamp(1.85rem, 3.2vw, 2.85rem)',
      color: textPrimary,
    },
    h3: {
      fontFamily: display,
      fontWeight: 650,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
      fontSize: 'clamp(1.25rem, 1.8vw, 1.55rem)',
      color: textPrimary,
    },
    h4: {
      fontFamily: display,
      fontWeight: 650,
      letterSpacing: '-0.02em',
      fontSize: '1.25rem',
      color: textPrimary,
    },
    h5: {
      fontFamily: display,
      fontWeight: 650,
      fontSize: '1.1rem',
      color: textPrimary,
    },
    h6: {
      fontFamily: display,
      fontWeight: 650,
      fontSize: '1rem',
      color: textPrimary,
    },
    subtitle1: { fontSize: '1.05rem', lineHeight: 1.55, fontWeight: 600, color: textPrimary },
    subtitle2: { fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 600, color: textSecondary },
    body1: {
      fontSize: '1.02rem',
      lineHeight: 1.7,
      fontWeight: 500,
      color: textPrimary,
      letterSpacing: '-0.005em',
    },
    body2: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
      fontWeight: 500,
      color: textSecondary,
      letterSpacing: '-0.005em',
    },
    button: {
      fontFamily: body,
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '-0.01em',
      fontSize: '0.95rem',
    },
    caption: { fontSize: '0.84rem', lineHeight: 1.5, fontWeight: 500, color: textSecondary },
    overline: {
      fontFamily: display,
      fontWeight: 700,
      letterSpacing: '0.12em',
      fontSize: '0.72rem',
      color: emberDeep,
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: paper,
          color: textPrimary,
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
    MuiLink: {
      styleOverrides: {
        root: {
          color: emberDeep,
          fontWeight: 650,
          textDecorationColor: 'rgba(224,72,40,0.35)',
          '&:hover': { color: ember, textDecorationColor: ember },
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
          '&:active': { transform: 'translateY(1px) scale(0.985)' },
        },
        containedSecondary: {
          '&:hover': { backgroundColor: emberDeep },
        },
        outlined: {
          borderColor: line,
          color: textPrimary,
          '&:hover': { borderColor: ember, backgroundColor: 'rgba(255,92,53,0.06)' },
        },
        text: {
          color: textPrimary,
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
          color: textPrimary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 650, fontFamily: body },
        sizeSmall: { height: 26 },
        outlined: { borderColor: line, color: textPrimary },
        label: { fontWeight: 650 },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: textSecondary,
          fontWeight: 600,
          '&.Mui-focused': { color: emberDeep },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { color: textSecondary, fontWeight: 500, fontSize: '0.8rem' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderRadius: 12,
          color: textPrimary,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ember, borderWidth: 2 },
        },
        input: { fontWeight: 500 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: textPrimary,
          borderBottomColor: line,
          backgroundColor: 'rgba(238,241,246,0.95)',
          fontFamily: body,
        },
        body: { borderBottomColor: line, color: textPrimary, fontWeight: 500 },
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
        root: { borderRadius: 12, border: `1px solid ${line}`, color: textPrimary },
        message: { fontWeight: 500, lineHeight: 1.55 },
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
    MuiAccordionSummary: {
      styleOverrides: {
        content: { fontWeight: 650, color: textPrimary },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: mist, borderLeft: `1px solid ${line}`, color: textPrimary },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, border: `1px solid ${line}`, color: textPrimary },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontWeight: 500, color: textPrimary },
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

export const brand = { ink, ember, paper, mist, line, display, body, textPrimary, textSecondary };
